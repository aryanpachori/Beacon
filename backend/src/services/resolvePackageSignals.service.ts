import { prisma } from '../db/client'
import { redis } from '../lib/redis'
import type { NormalizedSignals } from './signals.service'

export type SignalFacts = {
  daysSinceLastCommit: number
  commitsLast30d: number
  commitsLast90d: number
  primaryMaintainerLogin: string | null
  primaryMaintainerName: string | null
  contributorCount: number
  openIssues: number
  closeRatePct: number
  staleIssuePct: number
  stars: number
  forks: number
  forkStarRatio: number
  sponsorCount: number
  hasFundingYml: boolean
  ossfScore: number
  daysSinceRelease: number
  cveCount: number
  isDeprecated: boolean
  deprecatedMessage: string | null
  signalSourceRepo: string
}

export type MaintainerSnapshot = {
  login: string
  name: string
  lastCommitDays: number
  publicRepos: number
  sponsor: string
  isPrimary: boolean
}

export type ResolvedPackageSignals = {
  normalized: NormalizedSignals
  facts: SignalFacts | null
  maintainers: MaintainerSnapshot[]
}

const DB_TO_NORMALIZED: Record<string, keyof NormalizedSignals> = {
  commit_velocity_30d: 'commitVelocity',
  maintainer_activity: 'maintainerActivity',
  funding_sponsor_count: 'funding',
  issue_close_rate: 'issueResolution',
  fork_star_ratio: 'communityHealth',
  ossf_score: 'securityHygiene',
}

const NEUTRAL: NormalizedSignals = {
  commitVelocity: 50,
  maintainerActivity: 50,
  funding: 50,
  issueResolution: 50,
  communityHealth: 50,
  securityHygiene: 50,
}

function isNormalizedSignals(value: unknown): value is NormalizedSignals {
  return (
    typeof value === 'object' &&
    value !== null &&
    'commitVelocity' in value &&
    typeof (value as NormalizedSignals).commitVelocity === 'number'
  )
}

function parseCachedPayload(raw: string): ResolvedPackageSignals | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (parsed.normalized && isNormalizedSignals(parsed.normalized)) {
      return {
        normalized: parsed.normalized,
        facts: (parsed.facts as SignalFacts | undefined) ?? null,
        maintainers: (parsed.maintainers as MaintainerSnapshot[] | undefined) ?? [],
      }
    }
    if (isNormalizedSignals(parsed)) {
      const { facts, maintainers, ...normalized } = parsed as NormalizedSignals & {
        facts?: SignalFacts
        maintainers?: MaintainerSnapshot[]
      }
      if (isNormalizedSignals(normalized)) {
        return {
          normalized,
          facts: facts ?? null,
          maintainers: maintainers ?? [],
        }
      }
    }
  } catch {
    return null
  }
  return null
}

function rowsToResolved(
  rows: { signalType: string; value: number; rawData: unknown }[]
): ResolvedPackageSignals | null {
  const latestByType = new Map<string, { value: number; rawData: unknown }>()
  for (const row of rows) {
    if (!latestByType.has(row.signalType)) {
      latestByType.set(row.signalType, { value: row.value, rawData: row.rawData })
    }
  }

  const normalized: Partial<NormalizedSignals> = {}
  for (const [signalType, { value }] of latestByType) {
    const key = DB_TO_NORMALIZED[signalType]
    if (key) normalized[key] = value
  }

  if (Object.keys(normalized).length === 0) return null

  let facts: SignalFacts | null = null
  let maintainers: MaintainerSnapshot[] = []
  for (const { rawData } of latestByType.values()) {
    if (rawData && typeof rawData === 'object') {
      const data = rawData as { facts?: SignalFacts; maintainers?: MaintainerSnapshot[] }
      if (data.facts) facts = data.facts
      if (data.maintainers?.length) maintainers = data.maintainers
      if (facts) break
    }
  }

  return {
    normalized: { ...NEUTRAL, ...normalized },
    facts,
    maintainers,
  }
}

export async function resolvePackageSignals(
  packageId: string
): Promise<ResolvedPackageSignals | null> {
  // 1. Try the fast snapshot column on the package itself
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { signalSnapshot: true },
  })
  if (pkg?.signalSnapshot) {
    const parsed = parseCachedPayload(JSON.stringify(pkg.signalSnapshot))
    if (parsed) return parsed
  }

  // 2. Redis cache (warm from previous API reads)
  const cached = await redis.get(`signals:${packageId}`)
  if (cached) {
    const parsed = parseCachedPayload(cached)
    if (parsed) return parsed
  }

  // 3. Fall back to history rows
  const rows = await prisma.packageSignal.findMany({
    where: { packageId },
    orderBy: { capturedAt: 'desc' },
    take: 36,
    select: { signalType: true, value: true, rawData: true },
  })

  return rowsToResolved(rows)
}

export async function resolveSignalsBatch(
  packageIds: string[]
): Promise<Map<string, ResolvedPackageSignals>> {
  const result = new Map<string, ResolvedPackageSignals>()
  if (packageIds.length === 0) return result

  // 1. Pull snapshots from the packages table in one query (no Redis needed)
  const pkgs = await prisma.package.findMany({
    where: { id: { in: packageIds } },
    select: { id: true, signalSnapshot: true },
  })

  const missingIds: string[] = []
  for (const pkg of pkgs) {
    if (pkg.signalSnapshot) {
      const parsed = parseCachedPayload(JSON.stringify(pkg.signalSnapshot))
      if (parsed) {
        result.set(pkg.id, parsed)
        continue
      }
    }
    missingIds.push(pkg.id)
  }

  if (missingIds.length === 0) return result

  // 2. Redis cache for any packages that don't have a snapshot yet
  const keys = missingIds.map((id) => `signals:${id}`)
  const cached = await redis.mget(...keys)

  const stillMissing: string[] = []
  missingIds.forEach((id, index) => {
    const raw = cached[index]
    if (raw) {
      const parsed = parseCachedPayload(raw)
      if (parsed) {
        result.set(id, parsed)
        return
      }
    }
    stillMissing.push(id)
  })

  if (stillMissing.length === 0) return result

  // 3. Last resort: history rows
  const rows = await prisma.packageSignal.findMany({
    where: { packageId: { in: stillMissing } },
    orderBy: { capturedAt: 'desc' },
    select: { packageId: true, signalType: true, value: true, rawData: true },
  })

  const byPackage = new Map<string, typeof rows>()
  for (const row of rows) {
    const list = byPackage.get(row.packageId) ?? []
    list.push(row)
    byPackage.set(row.packageId, list)
  }

  for (const id of stillMissing) {
    const pkgRows = byPackage.get(id) ?? []
    const resolved = rowsToResolved(pkgRows)
    if (resolved) result.set(id, resolved)
  }

  return result
}

export function toApiSignalsPayload(resolved: ResolvedPackageSignals | null) {
  if (!resolved) return null
  return {
    ...resolved.normalized,
    facts: resolved.facts,
    maintainers: resolved.maintainers,
  }
}
