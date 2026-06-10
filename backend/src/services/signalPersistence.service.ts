import { prisma } from '../db/client'
import {
  CollectedPackageSignals,
  NormalizedSignals,
  rawValueForSignal,
} from './signals.service'

const SIGNAL_TYPE_MAP: Record<keyof NormalizedSignals, string> = {
  commitVelocity: 'commit_velocity_30d',
  maintainerActivity: 'maintainer_activity',
  funding: 'funding_sponsor_count',
  issueResolution: 'issue_close_rate',
  communityHealth: 'fork_star_ratio',
  securityHygiene: 'ossf_score',
}

export async function persistSignals(
  packageId: string,
  collected: CollectedPackageSignals
): Promise<void> {
  const { normalized, facts, maintainers } = collected
  const sharedRaw = { facts, maintainers }

  const rows = (Object.entries(normalized) as [keyof NormalizedSignals, number][]).map(
    ([key, value]) => ({
      packageId,
      signalType: SIGNAL_TYPE_MAP[key],
      value,
      rawValue: rawValueForSignal(key, facts),
      rawData: sharedRaw,
      source: 'github_api',
    })
  )

  await prisma.packageSignal.createMany({ data: rows })
}
