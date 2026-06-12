import { Router } from 'express'
import { prisma } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import {
  getUserInstallationContext,
  monitoredRepoRelation,
} from '../services/selectedRepos.service'

export const activityRouter = Router()
activityRouter.use(authMiddleware)

/**
 * GET /api/activity
 * Returns the last 100 alert-based events for the user's monitored packages.
 */
activityRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const ctx = await getUserInstallationContext(req.user!.userId)
    if (!ctx || ctx.selectedRepoIds.length === 0) {
      return res.json({ events: [] })
    }

    const { installation, selectedRepoIds } = ctx
    const repoScope = monitoredRepoRelation(installation.id, selectedRepoIds)

    const limit = Math.min(parseInt(req.query.limit as string) || 100, 200)

    const alerts = await prisma.alert.findMany({
      where: {
        installationId: installation.id,
        package: { repoPackages: { some: repoScope } },
      },
      orderBy: { firedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        alertType: true,
        spsBefore: true,
        spsAfter: true,
        tierBefore: true,
        tierAfter: true,
        aiReason: true,
        signalPills: true,
        primarySignal: true,
        cveId: true,
        affectedVersions: true,
        safeVersions: true,
        resolved: true,
        firedAt: true,
        package: {
          select: {
            id: true,
            name: true,
            ecosystem: true,
          },
        },
      },
    })

    const events = alerts.map(a => ({
      id: a.id,
      type: a.alertType,
      packageId: a.package.id,
      packageName: a.package.name,
      ecosystem: a.package.ecosystem,
      tier: a.tierAfter ?? a.tierBefore ?? 'healthy',
      spsBefore: a.spsBefore ?? undefined,
      spsAfter: a.spsAfter ?? undefined,
      aiReason: a.aiReason ?? undefined,
      signalPills: a.signalPills ?? undefined,
      primarySignal: a.primarySignal ?? undefined,
      cveId: a.cveId ?? undefined,
      affectedVersions: (a.affectedVersions as string[] | null) ?? undefined,
      safeVersions: (a.safeVersions as string[] | null) ?? undefined,
      resolved: a.resolved,
      firedAt: a.firedAt.toISOString(),
    }))

    res.json({ events })
  } catch (err) {
    next(err)
  }
})
