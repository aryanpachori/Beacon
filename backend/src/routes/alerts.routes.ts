import { Router } from 'express'
import { prisma, toApiTier } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import {
  getUserInstallationContext,
  monitoredRepoRelation,
} from '../services/selectedRepos.service'

export const alertsRouter = Router()

alertsRouter.use(authMiddleware)

alertsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const ctx = await getUserInstallationContext(req.user!.userId)

    if (!ctx || ctx.selectedRepoIds.length === 0) return res.json({ alerts: [] })

    const repoScope = monitoredRepoRelation(ctx.installation.id, ctx.selectedRepoIds)

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const offset = parseInt(req.query.offset as string) || 0

    const [total, alerts] = await Promise.all([
      prisma.alert.count({
        where: {
          installationId: ctx.installation.id,
          package: { repoPackages: { some: repoScope } },
        },
      }),
      prisma.alert.findMany({
        where: {
          installationId: ctx.installation.id,
          package: { repoPackages: { some: repoScope } },
        },
        include: { package: { select: { name: true } } },
        orderBy: { firedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ])

    res.json({
      total,
      alerts: alerts.map((a) => ({
        id: a.id,
        packageId: a.packageId,
        packageName: a.package.name,
        spsBefore: a.spsBefore,
        spsAfter: a.spsAfter,
        tierBefore: toApiTier(a.tierBefore),
        tier: toApiTier(a.tierAfter),
        aiReason: a.aiReason,
        alertType: a.alertType,
        signalPills: a.signalPills,
        firedAt: a.firedAt,
        slackSent: a.slackSent,
        resolved: a.resolved ?? (a.alertType === 'recovery'),
      })),
    })
  } catch (err) {
    next(err)
  }
})

alertsRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    const alertId = Array.isArray(id) ? id[0]! : id
    const ctx = await getUserInstallationContext(req.user!.userId)

    if (!ctx) throw new AppError(404, 'Alert not found')
    if (ctx.selectedRepoIds.length === 0) throw new AppError(404, 'Alert not found')

    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        installationId: ctx.installation.id,
        package: {
          repoPackages: {
            some: monitoredRepoRelation(ctx.installation.id, ctx.selectedRepoIds),
          },
        },
      },
      include: { package: { select: { name: true } } },
    })

    if (!alert) throw new AppError(404, 'Alert not found')
    res.json({
      ...alert,
      packageName: alert.package.name,
      tier: toApiTier(alert.tierAfter),
      tierBefore: toApiTier(alert.tierBefore),
    })
  } catch (err) {
    next(err)
  }
})
