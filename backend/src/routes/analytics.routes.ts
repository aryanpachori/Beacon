import { Router } from 'express'
import { Tier, Ecosystem } from '@prisma/client'
import { prisma } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import {
  getUserInstallationContext,
  monitoredRepoRelation,
} from '../services/selectedRepos.service'

export const analyticsRouter = Router()
analyticsRouter.use(authMiddleware)

/**
 * GET /api/analytics
 *
 * Returns rich analytics data for the dashboard:
 * - alertTrend:       daily alert counts for the past 14 days
 * - ecosystemDist:    package count per ecosystem
 * - spsHistogram:     package count in SPS buckets [0-20, 20-40, 40-60, 60-80, 80-100]
 * - signalAverages:   mean value per signal type across all monitored packages
 * - topDeclining:     packages with the steepest SPS drop (last 2 scores)
 * - topImproving:     packages with the greatest SPS improvement (last 2 scores)
 * - alertsByType:     count per alert type (threshold / tier_change / recovery / supply_chain)
 * - weeklyAlertCount: alerts fired in the last 7 days
 */
analyticsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const ctx = await getUserInstallationContext(req.user!.userId)

    const empty = {
      alertTrend: [] as { date: string; count: number }[],
      ecosystemDist: [] as { ecosystem: string; count: number }[],
      spsHistogram: [
        { bucket: '0–20',  min: 0,  max: 20,  count: 0 },
        { bucket: '20–40', min: 20, max: 40,  count: 0 },
        { bucket: '40–60', min: 40, max: 60,  count: 0 },
        { bucket: '60–80', min: 60, max: 80,  count: 0 },
        { bucket: '80–100',min: 80, max: 100, count: 0 },
      ],
      signalAverages: [] as { signal: string; avg: number }[],
      topDeclining:   [] as { id: string; name: string; spsDrop: number; currentSps: number; tier: string }[],
      topImproving:   [] as { id: string; name: string; spsGain: number; currentSps: number; tier: string }[],
      alertsByType:   {} as Record<string, number>,
      weeklyAlertCount: 0,
    }

    if (!ctx) return res.json(empty)

    const { installation, selectedRepoIds } = ctx
    if (selectedRepoIds.length === 0) return res.json(empty)

    const repoScope = monitoredRepoRelation(installation.id, selectedRepoIds)

    // ── 1. Alert trend — last 14 days ─────────────────────────────────────
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86_400_000)
    const alerts = await prisma.alert.findMany({
      where: {
        installationId: installation.id,
        firedAt: { gte: fourteenDaysAgo },
        package: { repoPackages: { some: repoScope } },
      },
      select: { firedAt: true, alertType: true },
      orderBy: { firedAt: 'asc' },
    })

    // Build day buckets
    const dayMap = new Map<string, number>()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000)
      dayMap.set(d.toISOString().slice(0, 10), 0)
    }
    const alertsByType: Record<string, number> = {}
    for (const a of alerts) {
      const day = a.firedAt.toISOString().slice(0, 10)
      dayMap.set(day, (dayMap.get(day) ?? 0) + 1)
      alertsByType[a.alertType] = (alertsByType[a.alertType] ?? 0) + 1
    }

    const alertTrend = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }))

    const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000)
    const weeklyAlertCount = alerts.filter(a => a.firedAt >= sevenDaysAgo).length

    // ── 2. Ecosystem distribution ─────────────────────────────────────────
    const ecosystemRaw = await prisma.package.groupBy({
      by: ['ecosystem'],
      where: { repoPackages: { some: repoScope } },
      _count: { ecosystem: true },
    })
    const ecosystemDist = ecosystemRaw.map(r => ({
      ecosystem: r.ecosystem ?? 'unknown',
      count: r._count.ecosystem,
    })).sort((a, b) => b.count - a.count)

    // ── 3. SPS histogram ─────────────────────────────────────────────────
    const pkgSps = await prisma.package.findMany({
      where: {
        currentSps: { not: null },
        repoPackages: { some: repoScope },
      },
      select: { currentSps: true },
    })

    const spsHistogram = [
      { bucket: '0–20',   min: 0,  max: 20,  count: 0 },
      { bucket: '20–40',  min: 20, max: 40,  count: 0 },
      { bucket: '40–60',  min: 40, max: 60,  count: 0 },
      { bucket: '60–80',  min: 60, max: 80,  count: 0 },
      { bucket: '80–100', min: 80, max: 100, count: 0 },
    ]
    for (const p of pkgSps) {
      const sps = p.currentSps ?? 0
      for (const bucket of spsHistogram) {
        if (sps >= bucket.min && (sps < bucket.max || (bucket.max === 100 && sps === 100))) {
          bucket.count++
          break
        }
      }
    }

    // ── 4. Signal averages ────────────────────────────────────────────────
    // Get the latest signal per (packageId, signalType) for monitored packages
    const packageIds = (await prisma.package.findMany({
      where: { repoPackages: { some: repoScope } },
      select: { id: true },
    })).map(p => p.id)

    const signals = packageIds.length > 0
      ? await prisma.$queryRaw<{ signal_type: string; avg_value: number }[]>`
          SELECT signal_type, ROUND(AVG(value::numeric), 1)::float AS avg_value
          FROM (
            SELECT DISTINCT ON (package_id, signal_type)
              package_id, signal_type, value
            FROM "PackageSignal"
            WHERE package_id = ANY(${packageIds}::text[])
              AND value IS NOT NULL
            ORDER BY package_id, signal_type, captured_at DESC
          ) latest
          GROUP BY signal_type
          ORDER BY avg_value DESC
        `
      : []

    const signalAverages = signals.map(s => ({
      signal: s.signal_type,
      avg: Number(s.avg_value),
    }))

    // ── 5. Top declining & improving packages ─────────────────────────────
    // For each monitored package, look at latest 2 PackageScore records
    const recentScores = packageIds.length > 0
      ? await prisma.$queryRaw<{
          package_id: string; sps: number; scored_at: Date; package_name: string;
          package_tier: string; rn: number
        }[]>`
          SELECT
            ps.package_id,
            ps.sps,
            ps.scored_at,
            p.name AS package_name,
            p.tier AS package_tier,
            ROW_NUMBER() OVER (PARTITION BY ps.package_id ORDER BY ps.scored_at DESC) AS rn
          FROM "PackageScore" ps
          JOIN "Package" p ON p.id = ps.package_id
          WHERE ps.package_id = ANY(${packageIds}::text[])
          ORDER BY ps.package_id, ps.scored_at DESC
        `
      : []

    type ScoreRow = { package_id: string; sps: number; package_name: string; package_tier: string; rn: number }
    const latestByPkg = new Map<string, ScoreRow>()
    const prevByPkg = new Map<string, ScoreRow>()
    for (const row of recentScores as ScoreRow[]) {
      if (row.rn === 1) latestByPkg.set(row.package_id, row)
      if (row.rn === 2) prevByPkg.set(row.package_id, row)
    }

    const movements: { id: string; name: string; delta: number; currentSps: number; tier: string }[] = []
    for (const [id, latest] of latestByPkg) {
      const prev = prevByPkg.get(id)
      if (prev) {
        movements.push({
          id,
          name: latest.package_name,
          delta: latest.sps - prev.sps,
          currentSps: latest.sps,
          tier: latest.package_tier,
        })
      }
    }

    const topDeclining = movements
      .filter(m => m.delta < 0)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 5)
      .map(m => ({ id: m.id, name: m.name, spsDrop: Math.abs(m.delta), currentSps: m.currentSps, tier: m.tier }))

    const topImproving = movements
      .filter(m => m.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5)
      .map(m => ({ id: m.id, name: m.name, spsGain: m.delta, currentSps: m.currentSps, tier: m.tier }))

    res.json({
      alertTrend,
      ecosystemDist,
      spsHistogram,
      signalAverages,
      topDeclining,
      topImproving,
      alertsByType,
      weeklyAlertCount,
    })
  } catch (err) {
    next(err)
  }
})
