import { Router } from 'express'
import { Tier } from '@prisma/client'
import { prisma, toApiTier } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import {
  getUserInstallationContext,
  monitoredRepoRelation,
} from '../services/selectedRepos.service'
import { resolveSignalsBatch, toApiSignalsPayload } from '../services/resolvePackageSignals.service'

export const dashboardRouter = Router()

dashboardRouter.use(authMiddleware)

dashboardRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const ctx = await getUserInstallationContext(req.user!.userId)

    if (!ctx) {
      return res.json({
        healthCounts: { healthy: 0, watch: 0, atRisk: 0, critical: 0 },
        criticalPackages: [],
        recentAlerts: [],
        avgSps: 0,
        totalPackages: 0,
        scanStatus: 'pending',
        scanProgress: { total: 0, scanned: 0, scored: 0 },
      })
    }

    const { installation, selectedRepoIds } = ctx
    const repoScope = monitoredRepoRelation(installation.id, selectedRepoIds)

    if (selectedRepoIds.length === 0) {
      const progress = (installation.scanProgress ?? {}) as {
        total?: number
        scanned?: number
        scored?: number
      }
      return res.json({
        healthCounts: { healthy: 0, watch: 0, atRisk: 0, critical: 0 },
        criticalPackages: [],
        recentAlerts: [],
        avgSps: 0,
        totalPackages: 0,
        scanStatus: installation.scanStatus,
        scanProgress: {
          total: progress.total ?? 0,
          scanned: progress.scanned ?? 0,
          scored: progress.scored ?? 0,
        },
      })
    }

    const totalPackages = await prisma.package.count({
      where: {
        repoPackages: { some: repoScope },
      },
    })

    const packages = await prisma.package.findMany({
      where: {
        tier: { not: null },
        repoPackages: { some: repoScope },
      },
      select: { tier: true, currentSps: true },
    })

    const healthCounts = { healthy: 0, watch: 0, atRisk: 0, critical: 0 }
    let spsSum = 0
    let spsCount = 0
    for (const p of packages) {
      if (p.currentSps != null) {
        spsSum += p.currentSps
        spsCount++
      }
      if (p.tier === Tier.healthy) healthCounts.healthy++
      else if (p.tier === Tier.watch) healthCounts.watch++
      else if (p.tier === Tier.at_risk) healthCounts.atRisk++
      else if (p.tier === Tier.critical) healthCounts.critical++
    }

    const criticalPackages = await prisma.package.findMany({
      where: {
        tier: { in: [Tier.critical, Tier.at_risk] },
        repoPackages: { some: repoScope },
      },
      select: {
        id: true,
        name: true,
        ecosystem: true,
        currentSps: true,
        tier: true,
        updatedAt: true,
        repoPackages: {
          where: repoScope,
          take: 1,
          select: {
            declaredVersion: true,
            repo: { select: { org: true, name: true } },
          },
        },
      },
      orderBy: { currentSps: 'asc' },
      take: 5,
    })

    const recentAlerts = await prisma.alert.findMany({
      where: {
        installationId: installation.id,
        package: { repoPackages: { some: repoScope } },
      },
      include: { package: { select: { name: true } } },
      orderBy: { firedAt: 'desc' },
      take: 5,
    })

    const progress = (installation.scanProgress ?? {}) as {
      total?: number
      scanned?: number
      scored?: number
    }

    const criticalSignalMap = await resolveSignalsBatch(criticalPackages.map((p) => p.id))

    res.json({
      healthCounts,
      criticalPackages: criticalPackages.map((p) => ({
        id: p.id,
        name: p.name,
        ecosystem: p.ecosystem,
        sps: p.currentSps,
        tier: toApiTier(p.tier),
        lastUpdated: p.updatedAt,
        version: p.repoPackages[0]?.declaredVersion ?? '*',
        repoName: p.repoPackages[0]
          ? `${p.repoPackages[0].repo.org}/${p.repoPackages[0].repo.name}`
          : '',
        signals: toApiSignalsPayload(criticalSignalMap.get(p.id) ?? null),
      })),
      recentAlerts: recentAlerts.map((a) => ({
        id: a.id,
        packageId: a.packageId,
        packageName: a.package.name,
        spsBefore: a.spsBefore,
        spsAfter: a.spsAfter,
        tier: toApiTier(a.tierAfter),
        firedAt: a.firedAt,
        slackSent: a.slackSent,
        jiraCreated: false,
      })),
      avgSps: spsCount > 0 ? Math.round(spsSum / spsCount) : 0,
      totalPackages,
      scanStatus: installation.scanStatus,
      scanProgress: {
        total: progress.total ?? totalPackages,
        scanned: progress.scanned ?? 0,
        scored: progress.scored ?? 0,
      },
    })
  } catch (err) {
    next(err)
  }
})
