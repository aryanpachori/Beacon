import { Router } from 'express'
import { prisma, toApiTier } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { getRepoLimitForPlan } from '../lib/planLimits'
import {
  getUserInstallationContext,
  monitoredRepoWhere,
  parseSelectedRepoIds,
} from '../services/selectedRepos.service'
import { enqueueScan } from '../lib/scanQueue'
import { ScanStatus } from '@prisma/client'
import { notifyScanProgress } from '../services/scanProgress.service'

export const reposRouter = Router()

reposRouter.use(authMiddleware)

reposRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const ctx = await getUserInstallationContext(req.user!.userId)
    if (!ctx) return res.json({ repos: [], repoLimit: 1, monitoredCount: 0 })

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { plan: true },
    })
    const repoLimit = user ? getRepoLimitForPlan(user.plan) : 1

    const selectedRepoIds = ctx.selectedRepoIds
    const repos = await prisma.repo.findMany({
      where: monitoredRepoWhere(ctx.installation.id, selectedRepoIds),
      include: {
        repoPackages: {
          include: { package: { select: { currentSps: true, tier: true, name: true } } },
        },
      },
      orderBy: [{ org: 'asc' }, { name: 'asc' }],
    })

    const enriched = repos.map((repo) => {
      const packages = repo.repoPackages.map((rp) => rp.package).filter((p) => p.currentSps != null)
      const avgSps =
        packages.length > 0
          ? Math.round(packages.reduce((s, p) => s + (p.currentSps ?? 0), 0) / packages.length)
          : 0
      const worst = [...packages].sort((a, b) => (a.currentSps ?? 100) - (b.currentSps ?? 100))[0]

      return {
        id: repo.id,
        name: repo.name,
        org: repo.org,
        packageCount: repo.repoPackages.length,
        avgSps,
        worstPackage: worst
          ? {
              name: worst.name,
              sps: worst.currentSps ?? 0,
              tier: toApiTier(worst.tier) ?? 'healthy',
            }
          : { name: '—', sps: 0, tier: 'healthy' },
        connectedAt: repo.createdAt,
      }
    })

    res.json({
      repos: enriched,
      repoLimit,
      monitoredCount: selectedRepoIds.length,
    })
  } catch (err) {
    next(err)
  }
})

reposRouter.patch('/selected', async (req: AuthRequest, res, next) => {
  try {
    const { repos } = req.body as { repos?: string[] }
    if (!repos) throw new AppError(400, 'repos array required')

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { plan: true },
    })
    const repoLimit = user ? getRepoLimitForPlan(user.plan) : 1
    if (!user) throw new AppError(404, 'User not found')

    if (repos.length > repoLimit) {
      throw new AppError(
        400,
        `Your plan allows ${repoLimit} repo${repoLimit === 1 ? '' : 's'}`
      )
    }

    const ctx = await getUserInstallationContext(req.user!.userId)
    if (!ctx) throw new AppError(404, 'No installation found')

    const valid = await prisma.repo.count({
      where: {
        id: { in: repos },
        installationId: ctx.installation.id,
      },
    })
    if (valid !== repos.length) {
      throw new AppError(400, 'One or more repositories are invalid')
    }

    await prisma.githubInstallation.update({
      where: { id: ctx.installation.id },
      data: { selectedRepos: repos },
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

reposRouter.post('/rescan', async (req: AuthRequest, res, next) => {
  try {
    const ctx = await getUserInstallationContext(req.user!.userId)
    if (!ctx) throw new AppError(404, 'No GitHub installation found')

    const selectedRepoIds = parseSelectedRepoIds(
      (
        await prisma.githubInstallation.findUnique({
          where: { id: ctx.installation.id },
          select: { selectedRepos: true },
        })
      )?.selectedRepos
    )
    if (selectedRepoIds.length === 0) {
      throw new AppError(400, 'No monitored repository selected')
    }

    const repos = await prisma.repo.findMany({
      where: { id: { in: selectedRepoIds }, installationId: ctx.installation.id },
    })

    const installation = await prisma.githubInstallation.findUnique({
      where: { id: ctx.installation.id },
      select: { installationId: true },
    })
    if (!installation) throw new AppError(404, 'No GitHub installation found')

    await prisma.githubInstallation.update({
      where: { id: ctx.installation.id },
      data: {
        scanStatus: ScanStatus.scanning,
        scanProgress: { total: 0, scanned: 0, scored: 0 },
      },
    })

    enqueueScan({
      installation_id: Number(installation.installationId),
      installationDbId: ctx.installation.id,
      userId: req.user!.userId,
      repos: repos.map((r) => ({ owner: r.org, repo: r.name })),
      triggered_by: 'manual',
    })

    await notifyScanProgress(ctx.installation.id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
