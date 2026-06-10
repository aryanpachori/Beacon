import { Router, Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { Plan, PlanStatus } from '@prisma/client'
import { getPlanLimits } from '../lib/planLimits'
import { trimSelectedReposForUser } from '../services/selectedReposTrim.service'
import { signalCollectQueue } from '../lib/queue'
import { isManifestPath } from '../lib/github'
import { prisma } from '../db/client'

export const webhooksRouter = Router()

function verifyGitHubSignature(req: Request, rawBody: Buffer): boolean {
  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET
  if (!secret) return false

  const signature = req.headers['x-hub-signature-256'] as string | undefined
  if (!signature) return false

  const expected =
    'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

webhooksRouter.post('/github', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawBody = req.body as Buffer
    if (!Buffer.isBuffer(rawBody) || !verifyGitHubSignature(req, rawBody)) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const event = req.headers['x-github-event'] as string
    const payload = JSON.parse(rawBody.toString())

    if (event === 'push') {
      const installationId = payload.installation?.id as number | undefined
      const repoFullName = payload.repository?.full_name as string | undefined
      const commits = payload.commits as Array<{ added?: string[]; modified?: string[] }> | undefined

      if (installationId && repoFullName && commits) {
        const affectedPaths = new Set<string>()
        for (const commit of commits) {
          for (const p of [...(commit.added ?? []), ...(commit.modified ?? [])]) {
            if (isManifestPath(p)) affectedPaths.add(p)
          }
        }

        if (affectedPaths.size > 0) {
          const [owner, repo] = repoFullName.split('/')
          const installation = await prisma.githubInstallation.findUnique({
            where: { installationId: BigInt(installationId) },
            select: { id: true, selectedRepos: true },
          })
          if (!installation) {
            return res.status(200).json({ ok: true })
          }

          const repoRow = await prisma.repo.findFirst({
            where: { installationId: installation.id, fullName: repoFullName },
            select: { id: true },
          })
          const selectedIds = Array.isArray(installation.selectedRepos)
            ? (installation.selectedRepos as string[])
            : []
          if (!repoRow || !selectedIds.includes(repoRow.id)) {
            return res.status(200).json({ ok: true })
          }

          await signalCollectQueue.add('scan', {
            installation_id: installationId,
            installationDbId: installation?.id,
            repos: [{ owner, repo, manifestPaths: [...affectedPaths] }],
            triggered_by: 'webhook',
          })
        }
      }
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    next(err)
  }
})

webhooksRouter.post('/razorpay', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    const signature = req.headers['x-razorpay-signature'] as string | undefined
    const rawBody = req.body as Buffer

    if (secret && signature && Buffer.isBuffer(rawBody)) {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex')
      if (signature !== expected) {
        return res.status(400).json({ error: 'Signature verification failed' })
      }
    }

    const payload = JSON.parse(
      Buffer.isBuffer(rawBody) ? rawBody.toString() : JSON.stringify(req.body)
    )
    const event = payload.event as string

    let plan: Plan = Plan.starter
    switch (event) {
      case 'payment.captured':
      case 'subscription.charged':
        plan = Plan.pro
        break
      case 'subscription.cancelled':
      case 'payment.failed':
        plan = Plan.starter
        break
      default:
        return res.json({ received: true })
    }

    const customerEmail =
      payload.payload?.payment?.entity?.email ||
      payload.payload?.subscription?.entity?.customer_email

    if (customerEmail) {
      const limits = getPlanLimits(plan)
      const users = await prisma.user.findMany({
        where: { email: customerEmail },
        select: { id: true },
      })

      await prisma.user.updateMany({
        where: { email: customerEmail },
        data: {
          plan,
          planStatus: PlanStatus.active,
          repoLimit: limits.repoLimit,
          packageLimit: limits.packageLimit,
        },
      })

      for (const u of users) {
        await trimSelectedReposForUser(u.id, limits.repoLimit)
      }
    }

    res.json({ received: true, plan })
  } catch (err) {
    next(err)
  }
})
