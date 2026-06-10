import type { CollectedPackageSignals } from './signals.service'

/** Neutral snapshot when upstream GitHub repo cannot be resolved. */
export function buildUnresolvedPackageSignals(
  packageName: string,
  ecosystem: string
): CollectedPackageSignals {
  const normalized = {
    commitVelocity: 50,
    maintainerActivity: 50,
    funding: 50,
    issueResolution: 50,
    communityHealth: 50,
    securityHygiene: 50,
  }

  const facts = {
    daysSinceLastCommit: 365,
    commitsLast30d: 0,
    commitsLast90d: 0,
    primaryMaintainerLogin: null,
    primaryMaintainerName: null,
    contributorCount: 0,
    openIssues: 0,
    closeRatePct: 50,
    staleIssuePct: 50,
    stars: 0,
    forks: 0,
    forkStarRatio: 0,
    sponsorCount: 0,
    hasFundingYml: false,
    ossfScore: 50,
    daysSinceRelease: 365,
    cveCount: 0,
    signalSourceRepo: `unresolved:${ecosystem}/${packageName}`,
  }

  return { normalized, facts, maintainers: [] }
}
