import { Router } from 'express'
import { prisma } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import {
  getUserInstallationContext,
  monitoredRepoRelation,
} from '../services/selectedRepos.service'

export const maintainersRouter = Router()
maintainersRouter.use(authMiddleware)

/**
 * GET /api/maintainers
 * Returns all primary maintainers across the user's monitored packages,
 * sorted by inactivity (most inactive first).
 */
maintainersRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const ctx = await getUserInstallationContext(req.user!.userId)
    if (!ctx || ctx.selectedRepoIds.length === 0) {
      return res.json({ maintainers: [] })
    }

    const { installation, selectedRepoIds } = ctx
    const repoScope = monitoredRepoRelation(installation.id, selectedRepoIds)

    // Get all package IDs in monitored repos
    const packages = await prisma.package.findMany({
      where: { repoPackages: { some: repoScope } },
      select: {
        id: true,
        name: true,
        tier: true,
        maintainers: {
          select: {
            isPrimary: true,
            commitCount: true,
            maintainer: {
              select: {
                id: true,
                githubLogin: true,
                displayName: true,
                avatarUrl: true,
                company: true,
                publicReposCount: true,
                followersCount: true,
                daysInactive: true,
                isSponsorEnabled: true,
                lastPushAt: true,
              },
            },
          },
        },
      },
    })

    // Aggregate by maintainer — one maintainer can own many packages
    const maintainerMap = new Map<string, {
      id: string
      login: string
      displayName: string
      avatarUrl: string | null
      company: string | null
      publicReposCount: number | null
      followersCount: number | null
      daysInactive: number | null
      isSponsorEnabled: boolean | null
      lastPushAt: Date | null
      packages: { id: string; name: string; tier: string | null }[]
    }>()

    for (const pkg of packages) {
      for (const pm of pkg.maintainers) {
        const m = pm.maintainer
        if (!maintainerMap.has(m.id)) {
          maintainerMap.set(m.id, {
            id: m.id,
            login: m.githubLogin,
            displayName: m.displayName ?? m.githubLogin,
            avatarUrl: m.avatarUrl,
            company: m.company,
            publicReposCount: m.publicReposCount,
            followersCount: m.followersCount,
            daysInactive: m.daysInactive,
            isSponsorEnabled: m.isSponsorEnabled,
            lastPushAt: m.lastPushAt,
            packages: [],
          })
        }
        maintainerMap.get(m.id)!.packages.push({
          id: pkg.id,
          name: pkg.name,
          tier: pkg.tier,
        })
      }
    }

    const maintainers = Array.from(maintainerMap.values())
      .sort((a, b) => (b.daysInactive ?? 0) - (a.daysInactive ?? 0))
      .map(m => ({
        id: m.id,
        login: m.login,
        displayName: m.displayName,
        avatarUrl: m.avatarUrl ?? undefined,
        company: m.company ?? undefined,
        publicReposCount: m.publicReposCount ?? 0,
        followersCount: m.followersCount ?? 0,
        daysInactive: m.daysInactive ?? 0,
        isSponsorEnabled: m.isSponsorEnabled ?? false,
        lastPushAt: m.lastPushAt?.toISOString() ?? undefined,
        packages: m.packages,
        riskLevel: (
          (m.daysInactive ?? 0) > 90 ? 'high' :
          (m.daysInactive ?? 0) > 30 ? 'medium' : 'low'
        ) as 'low' | 'medium' | 'high',
      }))

    res.json({ maintainers })
  } catch (err) {
    next(err)
  }
})
