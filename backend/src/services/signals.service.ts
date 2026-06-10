import { Octokit } from '@octokit/rest'
import { redis } from '../lib/redis'
import type { MaintainerSnapshot, SignalFacts } from './resolvePackageSignals.service'

export interface NormalizedSignals {
  commitVelocity: number
  maintainerActivity: number
  funding: number
  issueResolution: number
  communityHealth: number
  securityHygiene: number
}

export interface CollectedPackageSignals {
  normalized: NormalizedSignals
  facts: SignalFacts
  maintainers: MaintainerSnapshot[]
}

export interface SignalCollectionContext {
  owner: string
  repo: string
  packageName: string
  ecosystem: string
  octokit: Octokit
}

export async function collectPackageSignals(
  ctx: SignalCollectionContext
): Promise<CollectedPackageSignals> {
  const commit = await getCommitSignals(ctx)
  const [maintainer, funding, issues, community, security] = await Promise.all([
    getMaintainerSignals(ctx, commit.daysSinceLastCommit),
    getFundingSignals(ctx),
    getIssueSignals(ctx),
    getCommunitySignals(ctx),
    getSecuritySignals(ctx),
  ])

  const normalized: NormalizedSignals = {
    commitVelocity: normalizeCommitVelocity(commit.commitVelocity30d),
    maintainerActivity: normalizeMaintainerActivity(commit.daysSinceLastCommit),
    funding: normalizeFunding(funding.sponsorCount, funding.hasFundingYml),
    issueResolution: normalizeIssueResolution(issues.staleRatio, issues.closeRate),
    communityHealth: normalizeCommunity(community.forkStarRatio, community.contributorTrend),
    securityHygiene: normalizeSecurity(security.cveCount, security.daysSinceRelease),
  }

  const facts: SignalFacts = {
    daysSinceLastCommit: commit.daysSinceLastCommit,
    commitsLast30d: commit.commitVelocity30d,
    commitsLast90d: commit.commitVelocity90d,
    primaryMaintainerLogin: maintainer.primaryMaintainerLogin,
    primaryMaintainerName: maintainer.primaryMaintainerName,
    contributorCount: maintainer.contributorCount,
    openIssues: issues.openCount,
    closeRatePct: Math.round(issues.closeRate * 100),
    staleIssuePct: Math.round(issues.staleRatio * 100),
    stars: community.stars,
    forks: community.forks,
    forkStarRatio: Number(community.forkStarRatio.toFixed(3)),
    sponsorCount: funding.sponsorCount,
    hasFundingYml: funding.hasFundingYml,
    ossfScore: security.ossfScore,
    daysSinceRelease: security.daysSinceRelease,
    cveCount: security.cveCount,
    signalSourceRepo: `${ctx.owner}/${ctx.repo}`,
  }

  const maintainers: MaintainerSnapshot[] = maintainer.primaryMaintainerLogin
    ? [
        {
          login: maintainer.primaryMaintainerLogin,
          name: maintainer.primaryMaintainerName ?? maintainer.primaryMaintainerLogin,
          lastCommitDays: commit.daysSinceLastCommit,
          publicRepos: maintainer.publicRepos,
          sponsor:
            funding.sponsorCount > 0 || funding.hasFundingYml ? 'GitHub Sponsors' : 'None',
          isPrimary: true,
        },
      ]
    : []

  return { normalized, facts, maintainers }
}

async function getCommitSignals(ctx: SignalCollectionContext) {
  const since30 = new Date()
  since30.setDate(since30.getDate() - 30)
  const since90 = new Date()
  since90.setDate(since90.getDate() - 90)

  const { data: commits30 } = await ctx.octokit.rest.repos.listCommits({
    owner: ctx.owner,
    repo: ctx.repo,
    since: since30.toISOString(),
    per_page: 100,
  })

  const { data: commits90 } = await ctx.octokit.rest.repos.listCommits({
    owner: ctx.owner,
    repo: ctx.repo,
    since: since90.toISOString(),
    per_page: 100,
  })

  const { data: latest } = await ctx.octokit.rest.repos.listCommits({
    owner: ctx.owner,
    repo: ctx.repo,
    per_page: 1,
  })

  const lastCommitDate = latest[0]?.commit.author?.date
  const daysSinceLastCommit = lastCommitDate
    ? Math.floor((Date.now() - new Date(lastCommitDate).getTime()) / 86400000)
    : 365

  return {
    commitVelocity30d: commits30.length,
    commitVelocity90d: commits90.length,
    daysSinceLastCommit,
  }
}

async function getMaintainerSignals(ctx: SignalCollectionContext, daysSinceLastCommit: number) {
  const { data: contributors } = await ctx.octokit.rest.repos.listContributors({
    owner: ctx.owner,
    repo: ctx.repo,
    per_page: 10,
  })

  const primary = contributors[0]
  let publicRepos = 0
  let displayName: string | null = primary?.login ?? null

  if (primary?.login) {
    try {
      const { data: user } = await ctx.octokit.rest.users.getByUsername({
        username: primary.login,
      })
      publicRepos = user.public_repos ?? 0
      displayName = user.name ?? primary.login
    } catch {
      displayName = primary.login
    }
  }

  return {
    daysSinceLastCommit,
    primaryMaintainerLogin: primary?.login ?? null,
    primaryMaintainerName: displayName,
    contributorCount: contributors.length,
    publicRepos,
    isSingleMaintainer: contributors.length <= 1,
  }
}

async function getFundingSignals(ctx: SignalCollectionContext) {
  let hasFundingYml = false
  for (const path of ['.github/FUNDING.yml', 'FUNDING.yml', '.github/FUNDING.yaml']) {
    try {
      await ctx.octokit.rest.repos.getContent({
        owner: ctx.owner,
        repo: ctx.repo,
        path,
      })
      hasFundingYml = true
      break
    } catch {
      // file not present
    }
  }

  return {
    sponsorCount: 0,
    openCollectiveBalance: 0,
    hasFundingYml,
  }
}

async function getIssueSignals(ctx: SignalCollectionContext) {
  const { data: openIssues } = await ctx.octokit.rest.issues.listForRepo({
    owner: ctx.owner,
    repo: ctx.repo,
    state: 'open',
    per_page: 100,
  })

  const { data: closedIssues } = await ctx.octokit.rest.issues.listForRepo({
    owner: ctx.owner,
    repo: ctx.repo,
    state: 'closed',
    per_page: 100,
  })

  const openCount = openIssues.length
  const total = openCount + closedIssues.length
  const closeRate = total > 0 ? closedIssues.length / total : 0.5
  const staleRatio = openCount > 50 ? 0.6 : openCount / 100

  return { staleRatio, closeRate, openCount, avgResponseDays: 14 }
}

async function getCommunitySignals(ctx: SignalCollectionContext) {
  const { data: repo } = await ctx.octokit.rest.repos.get({
    owner: ctx.owner,
    repo: ctx.repo,
  })

  const forkStarRatio =
    repo.stargazers_count > 0 ? repo.forks_count / repo.stargazers_count : 0

  return {
    forkStarRatio,
    contributorTrend: 0,
    downstreamDependents: 0,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
  }
}

async function getSecuritySignals(_ctx: SignalCollectionContext) {
  return {
    ossfScore: 50,
    ossfDelta: 0,
    cveCount: 0,
    daysSinceRelease: 30,
  }
}

function normalizeCommitVelocity(commits30d: number): number {
  return Math.min(100, Math.round((commits30d / 30) * 100))
}

function normalizeMaintainerActivity(daysSinceLastCommit: number): number {
  return Math.max(0, Math.min(100, 100 - daysSinceLastCommit * 2))
}

function normalizeFunding(sponsorCount: number, hasFundingYml: boolean): number {
  let score = sponsorCount * 10
  if (hasFundingYml) score += 20
  return Math.min(100, score)
}

function normalizeIssueResolution(staleRatio: number, closeRate: number): number {
  return Math.round(closeRate * 70 + (1 - staleRatio) * 30)
}

function normalizeCommunity(forkStarRatio: number, contributorTrend: number): number {
  return Math.min(100, Math.round(forkStarRatio * 50 + contributorTrend * 50 + 30))
}

function normalizeSecurity(cveCount: number, daysSinceRelease: number): number {
  let score = 80
  score -= cveCount * 15
  if (daysSinceRelease > 180) score -= 20
  return Math.max(0, Math.min(100, score))
}

function rawValueForSignal(
  key: keyof NormalizedSignals,
  facts: SignalFacts
): number {
  switch (key) {
    case 'commitVelocity':
      return facts.commitsLast30d
    case 'maintainerActivity':
      return facts.daysSinceLastCommit
    case 'funding':
      return facts.sponsorCount
    case 'issueResolution':
      return facts.closeRatePct
    case 'communityHealth':
      return facts.forkStarRatio
    case 'securityHygiene':
      return facts.ossfScore
    default:
      return 0
  }
}

export async function cacheSignals(
  packageId: string,
  collected: CollectedPackageSignals
): Promise<void> {
  const key = `signals:${packageId}`
  const ttlSeconds = 21600
  const payload = {
    ...collected.normalized,
    facts: collected.facts,
    maintainers: collected.maintainers,
  }
  await redis.setex(key, ttlSeconds, JSON.stringify(payload))

  console.log(
    JSON.stringify({
      event: 'signals_cached_redis',
      key,
      ttlSeconds,
      packageId,
      signals: collected.normalized,
      facts: collected.facts,
      timestamp: new Date().toISOString(),
    })
  )
}

export { rawValueForSignal }
