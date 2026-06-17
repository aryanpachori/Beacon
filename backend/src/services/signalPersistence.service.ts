import { prisma } from '../db/client'
import {
  CollectedPackageSignals,
  NormalizedSignals,
  rawValueForSignal,
} from './signals.service'
import type { MaintainerSnapshot } from './resolvePackageSignals.service'

const SIGNAL_TYPE_MAP: Record<keyof NormalizedSignals, string> = {
  commitVelocity: 'commit_velocity_30d',
  maintainerActivity: 'maintainer_activity',
  funding: 'funding_sponsor_count',
  issueResolution: 'issue_close_rate',
  communityHealth: 'fork_star_ratio',
  securityHygiene: 'ossf_score',
}

/**
 * Persist signals for a package.
 *
 * Primary store: `packages.signalSnapshot` (one JSON column update per scan).
 * History store: `package_signals` (one row per signal type per scan, kept for trend charts).
 * Maintainers: upserted into `maintainers` + `package_maintainers` tables so the
 *   /api/maintainers endpoint has real data instead of returning empty arrays.
 */
export async function persistSignals(
  packageId: string,
  collected: CollectedPackageSignals
): Promise<void> {
  const { normalized, facts, maintainers } = collected
  const now = new Date()

  // 1. Single-row snapshot on the package itself
  await prisma.package.update({
    where: { id: packageId },
    data: {
      signalSnapshot: { ...normalized, facts, maintainers },
      signalCapturedAt: now,
    },
  })

  // 2. History rows for trend charts
  const sharedRaw = { facts, maintainers }
  const rows = (Object.entries(normalized) as [keyof NormalizedSignals, number][]).map(
    ([key, value]) => ({
      packageId,
      signalType: SIGNAL_TYPE_MAP[key],
      value,
      rawValue: rawValueForSignal(key, facts),
      rawData: sharedRaw,
      source: 'github_api',
      capturedAt: now,
    })
  )
  await prisma.packageSignal.createMany({ data: rows })

  // 3. Persist maintainer records so /api/maintainers has data
  if (maintainers.length > 0) {
    await persistMaintainers(packageId, maintainers, facts.daysSinceLastCommit)
  }
}

async function persistMaintainers(
  packageId: string,
  snapshots: MaintainerSnapshot[],
  daysSinceLastCommit: number
): Promise<void> {
  for (const snap of snapshots) {
    const maintainer = await prisma.maintainer.upsert({
      where: { githubLogin: snap.login },
      create: {
        githubLogin: snap.login,
        displayName: snap.name,
        avatarUrl: `https://github.com/${snap.login}.png`,
        daysInactive: snap.lastCommitDays ?? daysSinceLastCommit,
        publicReposCount: snap.publicRepos ?? null,
        isSponsorEnabled: snap.sponsor !== 'None',
        fetchedAt: new Date(),
      },
      update: {
        displayName: snap.name,
        daysInactive: snap.lastCommitDays ?? daysSinceLastCommit,
        publicReposCount: snap.publicRepos ?? null,
        isSponsorEnabled: snap.sponsor !== 'None',
        fetchedAt: new Date(),
      },
    })

    await prisma.packageMaintainer.upsert({
      where: { packageId_maintainerId: { packageId, maintainerId: maintainer.id } },
      create: {
        packageId,
        maintainerId: maintainer.id,
        isPrimary: snap.isPrimary,
      },
      update: {
        isPrimary: snap.isPrimary,
      },
    })
  }
}
