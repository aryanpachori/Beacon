import type { CollectedPackageSignals } from './signals.service'
import { fetchNpmRegistryMetaForPackage } from './signals.service'

/** Neutral snapshot when upstream GitHub repo cannot be resolved. */
export async function buildUnresolvedPackageSignals(
  packageName: string,
  ecosystem: string
): Promise<CollectedPackageSignals> {
  let isDeprecated = false
  let deprecatedMessage: string | null = null
  let daysSinceRelease = 365
  let securityHygiene = 50

  if (ecosystem === 'npm') {
    const npm = await fetchNpmRegistryMetaForPackage(packageName)
    if (npm) {
      isDeprecated = npm.isDeprecated
      deprecatedMessage = npm.deprecatedMessage
      daysSinceRelease = npm.daysSinceRelease
      if (npm.isDeprecated) securityHygiene = 10
    }
  }

  const normalized = {
    commitVelocity: 50,
    maintainerActivity: 50,
    funding: 50,
    issueResolution: 50,
    communityHealth: 50,
    securityHygiene,
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
    ossfScore: securityHygiene,
    daysSinceRelease,
    cveCount: 0,
    isDeprecated,
    deprecatedMessage,
    signalSourceRepo: `unresolved:${ecosystem}/${packageName}`,
  }

  return { normalized, facts, maintainers: [] }
}
