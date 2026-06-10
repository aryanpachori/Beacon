import { Router } from 'express'
import { DigestFrequency } from '@prisma/client'
import { prisma } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { sendSlackTest, sendGchatTest } from '../services/notification.service'
import { AppError } from '../middleware/error.middleware'

export const integrationsRouter = Router()

integrationsRouter.use(authMiddleware)

async function getInstallationId(userId: string): Promise<string> {
  const row = await prisma.githubInstallation.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  })
  if (!row) throw new AppError(404, 'No GitHub installation found')
  return row.id
}

integrationsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const installationId = await getInstallationId(req.user!.userId)
    const integration = await prisma.orgIntegration.findUnique({
      where: { installationId },
    })
    res.json(integration ?? {})
  } catch (err) {
    next(err)
  }
})

integrationsRouter.post('/slack', async (req: AuthRequest, res, next) => {
  try {
    const { webhookUrl } = req.body as { webhookUrl?: string }
    if (!webhookUrl) throw new AppError(400, 'webhookUrl required')

    const installationId = await getInstallationId(req.user!.userId)
    await prisma.orgIntegration.upsert({
      where: { installationId },
      create: { installationId, slackWebhookUrl: webhookUrl, slackEnabled: false },
      update: { slackWebhookUrl: webhookUrl, slackEnabled: false },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

integrationsRouter.post('/slack/test', async (req: AuthRequest, res, next) => {
  try {
    const { webhookUrl } = req.body as { webhookUrl?: string }
    if (!webhookUrl) throw new AppError(400, 'webhookUrl required')

    try {
      await sendSlackTest(webhookUrl)
      const installationId = await getInstallationId(req.user!.userId)
      await prisma.orgIntegration.upsert({
        where: { installationId },
        create: {
          installationId,
          slackWebhookUrl: webhookUrl,
          slackEnabled: true,
          slackVerifiedAt: new Date(),
        },
        update: {
          slackWebhookUrl: webhookUrl,
          slackEnabled: true,
          slackVerifiedAt: new Date(),
        },
      })
      res.json({ success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Slack test failed'
      res.json({ success: false, error: message })
    }
  } catch (err) {
    next(err)
  }
})

integrationsRouter.post('/gchat', async (req: AuthRequest, res, next) => {
  try {
    const { webhookUrl } = req.body as { webhookUrl?: string }
    if (!webhookUrl) throw new AppError(400, 'webhookUrl required')

    const installationId = await getInstallationId(req.user!.userId)
    await prisma.orgIntegration.upsert({
      where: { installationId },
      create: { installationId, gchatWebhookUrl: webhookUrl, gchatEnabled: false },
      update: { gchatWebhookUrl: webhookUrl, gchatEnabled: false },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

integrationsRouter.post('/gchat/test', async (req: AuthRequest, res, next) => {
  try {
    const { webhookUrl } = req.body as { webhookUrl?: string }
    if (!webhookUrl) throw new AppError(400, 'webhookUrl required')

    try {
      await sendGchatTest(webhookUrl)
      const installationId = await getInstallationId(req.user!.userId)
      await prisma.orgIntegration.upsert({
        where: { installationId },
        create: {
          installationId,
          gchatWebhookUrl: webhookUrl,
          gchatEnabled: true,
          gchatVerifiedAt: new Date(),
        },
        update: {
          gchatWebhookUrl: webhookUrl,
          gchatEnabled: true,
          gchatVerifiedAt: new Date(),
        },
      })
      res.json({ success: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'GChat test failed'
      res.json({ success: false, error: message })
    }
  } catch (err) {
    next(err)
  }
})

integrationsRouter.patch('/digest', async (req: AuthRequest, res, next) => {
  try {
    const { email, frequency, enabled } = req.body as {
      email?: string
      frequency?: 'daily' | 'weekly' | 'never'
      enabled?: boolean
    }

    const installationId = await getInstallationId(req.user!.userId)
    const digestFrequency =
      frequency === 'daily'
        ? DigestFrequency.daily
        : frequency === 'weekly'
          ? DigestFrequency.weekly
          : frequency === 'never'
            ? DigestFrequency.never
            : undefined

    await prisma.orgIntegration.upsert({
      where: { installationId },
      create: {
        installationId,
        digestEmail: email ?? null,
        digestFrequency: digestFrequency ?? DigestFrequency.daily,
        digestEnabled: enabled ?? false,
      },
      update: {
        ...(email !== undefined ? { digestEmail: email } : {}),
        ...(digestFrequency !== undefined ? { digestFrequency } : {}),
        ...(enabled !== undefined ? { digestEnabled: enabled } : {}),
      },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

integrationsRouter.patch('/threshold', async (req: AuthRequest, res, next) => {
  try {
    const { threshold } = req.body as { threshold?: number }
    if (threshold === undefined) throw new AppError(400, 'threshold required')

    const installationId = await getInstallationId(req.user!.userId)
    await prisma.orgIntegration.upsert({
      where: { installationId },
      create: { installationId, alertThreshold: threshold },
      update: { alertThreshold: threshold },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
