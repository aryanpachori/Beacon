import type { Package, Signal } from '@/types'
import { alerts } from '@/lib/mockData'
import { daysSinceDate } from '@/lib/utils'
import { formatDaysSinceLabel, getDaysSinceColorClass } from '@/lib/dashboardData'
import { tierColor } from '@/lib/constants'

export interface MaintainerProfile {
  name: string
  handle: string
  lastCommitDays: number
  publicRepos: number
  sponsor: string
}

export interface PackageStatusBadge {
  id: string
  icon: 'heart' | 'tool' | 'alert' | 'arrow'
  label: string
  variant: 'critical' | 'healthy' | 'teal' | 'muted'
}

export interface AlertHistoryRow {
  id: string
  date: string
  spsBefore: number
  spsAfter: number
  tier: Package['tier']
  reason: string
}

const DESCRIPTIONS: Record<string, string> = {
  moment: 'Parse, validate, manipulate, and display dates in JavaScript.',
  request: 'Simplified HTTP client for Node.js — promise-based requests.',
  'left-pad': 'Left-pad a string with spaces or a custom character.',
  rxjs: 'Reactive extensions for JavaScript — async and event-based programs.',
  'node-sass': 'Node.js bindings for LibSass — compiles Sass to CSS.',
  bower: 'Package manager for the web — client-side dependency resolution.',
  underscore: 'JavaScript utility library delivering consistency and performance.',
  nodemailer: 'Send emails from Node.js — SMTP and transport plugins.',
}

const AI_VERDICTS: Record<string, { body: string; confidence: number }> = {
  moment: {
    body: 'moment is in de facto abandonment. The maintainer has publicly confirmed the project will not receive new features, and commit activity confirms this. With no sponsor funding and 195 days since the last release, the survival window is estimated at 60–90 days before community forks diverge beyond practical use.',
    confidence: 84,
  },
  request: {
    body: 'request is officially deprecated with no nominated successor in the README. Commit velocity and issue response have collapsed over the past year. Teams still on request should treat migration as urgent — security patches are not guaranteed.',
    confidence: 91,
  },
  'left-pad': {
    body: 'left-pad is a historical artifact with no meaningful maintenance. The functionality is native in modern JavaScript, so migration is mechanical rather than architectural. Risk is reputational and supply-chain hygiene rather than feature parity.',
    confidence: 97,
  },
  'node-sass': {
    body: 'node-sass is superseded by the Dart Sass implementation distributed as sass. Native binding maintenance burden makes continued use costly. Most codebases can migrate with dependency swap and minor API adjustments.',
    confidence: 88,
  },
  bower: {
    body: 'bower was deprecated in favour of npm and modern bundlers. Remaining usage typically indicates legacy front-end stacks. Migration path is well documented toward webpack or Vite with npm-managed assets.',
    confidence: 92,
  },
}

const REPLACEMENT_BLURBS: Record<string, string> = {
  dayjs: 'Drop-in API subset for moment with immutable dates and smaller bundle size.',
  'date-fns': 'Modular date utilities with tree-shaking — best for bundle-conscious apps.',
  luxon: 'Immutable dates with first-class timezone support via ICU.',
  axios: 'Actively maintained HTTP client with broad ecosystem support.',
  got: 'Lightweight HTTP/2 client with modern async patterns.',
  'node-fetch': 'Fetch API for Node — familiar surface for isomorphic code.',
  sass: 'Official Dart Sass implementation — direct successor to node-sass.',
}

const MAINTAINER_PROFILES: Record<string, MaintainerProfile[]> = {
  moment: [
    { name: 'Tim Wood', handle: '@moment-owner', lastCommitDays: 195, publicRepos: 12, sponsor: 'None' },
    { name: 'Isaac Cam', handle: '@icambron', lastCommitDays: 240, publicRepos: 8, sponsor: 'None' },
  ],
  request: [
    { name: 'Mikeal Rogers', handle: '@mikeal', lastCommitDays: 992, publicRepos: 34, sponsor: 'None' },
  ],
  'node-sass': [
    { name: 'Sass Team', handle: '@sass', lastCommitDays: 45, publicRepos: 6, sponsor: 'OpenCollective' },
  ],
}

const SIGNAL_COPY: Record<string, (pkg: Package, signal: Signal) => string> = {
  commitVelocity: (pkg) => {
    const facts = pkg.signalFacts
    if (facts) {
      if (facts.signalSourceRepo.startsWith('unresolved:')) {
        return `Could not resolve the upstream GitHub repository for ${pkg.name}. Re-scan after registry metadata is available.`
      }
      const cadence =
        facts.commitsLast30d > 0
          ? `${facts.commitsLast30d} commits in the last 30 days on ${facts.signalSourceRepo}`
          : `Last commit on ${facts.signalSourceRepo} was ${facts.daysSinceLastCommit} days ago`
      return `${cadence}. Healthy packages average a commit every 12 days.`
    }
    const days = daysSinceDate(pkg.lastUpdated)
    return `Last commit was ${days} days ago. Healthy packages average a commit every 12 days.`
  },
  maintainerActivity: (pkg, s) => {
    const facts = pkg.signalFacts
    const handle = facts?.primaryMaintainerLogin
      ? `@${facts.primaryMaintainerLogin}`
      : pkg.maintainers?.[0]?.login
        ? `@${pkg.maintainers[0].login}`
        : '@primary-maintainer'
    const days = facts?.daysSinceLastCommit ?? Math.max(60, Math.round((100 - s.value) * 0.8))
    const contributors = facts?.contributorCount
    const suffix =
      contributors != null && contributors <= 1 ? ' Single maintainer on record.' : ''
    return `Primary maintainer ${handle} has not pushed to any public repo in ${days} days.${suffix}`
  },
  funding: (pkg, s) => {
    const facts = pkg.signalFacts
    if (facts?.hasFundingYml || (facts?.sponsorCount ?? 0) > 0) {
      return 'Sponsor or funding metadata detected — backing may cover maintenance costs.'
    }
    return s.value < 20
      ? 'No OpenCollective, GitHub Sponsors, or corporate backing detected.'
      : 'Limited sponsor signals — funding covers infrastructure but not full-time maintenance.'
  },
  issueResolution: (pkg, s) => {
    const facts = pkg.signalFacts
    const stale = facts?.staleIssuePct ?? Math.min(95, 100 - s.value + 40)
    const closeRate = facts?.closeRatePct
    if (closeRate != null) {
      return `${stale}% of open issues appear stale; ${closeRate}% close rate across recent issues. Industry stale average is ~23%.`
    }
    return `${stale}% of issues older than 90 days have no response. Industry average is 23%.`
  },
  communityHealth: (pkg, s) => {
    const facts = pkg.signalFacts
    const ratio = facts?.forkStarRatio ?? Number((s.value / 100 * 0.4).toFixed(2))
    const stars = facts?.stars
    const starLine = stars != null ? ` ${stars.toLocaleString()} stars.` : ''
    return `Fork-to-star ratio is ${ratio} — above 0.25 indicates community has diverged from main project.${starLine}`
  },
  securityHygiene: (pkg, s) => {
    const facts = pkg.signalFacts
    if (facts) {
      const cveLine =
        facts.cveCount > 0
          ? ` ${facts.cveCount} known CVE(s) on record.`
          : facts.daysSinceRelease > 180
            ? ` Last release was ${facts.daysSinceRelease} days ago.`
            : ''
      return `OSSF Scorecard estimate: ${facts.ossfScore}/100 (signal score ${s.value}).${cveLine}`
    }
    const drop = ((50 - s.value) / 10).toFixed(1)
    const cveDays = Math.round((100 - s.value) * 28)
    return `OSSF Scorecard dropped ${drop} points in the last 90 days. Last CVE: ${cveDays} days ago.`
  },
}

const ALERT_REASONS: Record<string, string> = {
  'alert-1': 'SPS crossed critical threshold after 195 days without release',
}

const OPEN_ISSUES: Record<string, { count: number; trend: 'up' | 'down' | 'stable' }> = {
  moment: { count: 847, trend: 'up' },
  request: { count: 412, trend: 'stable' },
  'left-pad': { count: 12, trend: 'down' },
  rxjs: { count: 156, trend: 'up' },
  'node-sass': { count: 203, trend: 'down' },
}

export function getPackageDescription(pkg: Package): string {
  return (
    DESCRIPTIONS[pkg.id] ??
    `A ${pkg.ecosystem} package monitored across ${pkg.repoName}.`
  )
}

export function getAiVerdict(pkg: Package) {
  const custom = AI_VERDICTS[pkg.id]
  if (custom) return custom
  return {
    body: `${pkg.name} shows declining health signals across commit velocity, funding, and community engagement. Combined SPS of ${pkg.sps} indicates elevated abandonment risk. Plan a migration review within the next quarter.`,
    confidence: Math.max(55, Math.min(92, 100 - pkg.sps)),
  }
}

export function getReplacementBlurb(recName: string): string {
  return REPLACEMENT_BLURBS[recName] ?? 'Actively maintained alternative with strong community adoption.'
}

export function getMaintainerProfiles(pkg: Package): MaintainerProfile[] {
  if (pkg.maintainers?.length) {
    return pkg.maintainers.map((m) => ({
      name: m.name,
      handle: `@${m.login}`,
      lastCommitDays: m.lastCommitDays,
      publicRepos: m.publicRepos,
      sponsor: m.sponsor,
    }))
  }
  if (MAINTAINER_PROFILES[pkg.id]) return MAINTAINER_PROFILES[pkg.id]
  const facts = pkg.signalFacts
  const days = facts?.daysSinceLastCommit ?? daysSinceDate(pkg.lastUpdated)
  const login = facts?.primaryMaintainerLogin ?? `${pkg.name}-maintainer`
  const name = facts?.primaryMaintainerName ?? `${pkg.name} maintainer`
  return [
    {
      name,
      handle: `@${login}`,
      lastCommitDays: days,
      publicRepos: facts?.contributorCount ?? 8 + (pkg.sps % 12),
      sponsor: pkg.signals.funding.value > 40 ? 'GitHub Sponsors' : 'None',
    },
  ]
}

export function getSignalExplanation(
  pkg: Package,
  key: keyof Package['signals'],
  signal: Signal
): string {
  const fn = SIGNAL_COPY[key]
  return fn ? fn(pkg, signal) : `Signal score ${signal.value}/100 with ${signal.trend} trend.`
}

export function getSignalBarClass(value: number): string {
  if (value >= 67) return 'signal-bar-fill-high'
  if (value >= 34) return 'signal-bar-fill-mid'
  return 'signal-bar-fill-low'
}

export function getStatusBadges(pkg: Package): PackageStatusBadge[] {
  const badges: PackageStatusBadge[] = []
  const funding = pkg.signals.funding.value

  badges.push({
    id: 'sponsor',
    icon: 'heart',
    label: funding < 20 ? 'No sponsors' : 'Sponsored',
    variant: funding < 20 ? 'critical' : 'healthy',
  })

  if (pkg.id === 'moment') {
    badges.push({ id: 'maint', icon: 'tool', label: 'Maintenance only', variant: 'critical' })
  } else if (pkg.sps >= 50) {
    badges.push({ id: 'maint', icon: 'tool', label: 'Active', variant: 'healthy' })
  } else {
    badges.push({ id: 'maint', icon: 'tool', label: 'Low activity', variant: 'critical' })
  }

  if (['request', 'bower', 'left-pad'].includes(pkg.id)) {
    badges.push({ id: 'dep', icon: 'alert', label: 'Officially deprecated', variant: 'critical' })
  }

  if (pkg.id === 'node-sass') {
    badges.push({ id: 'succ', icon: 'arrow', label: 'Use sass instead', variant: 'teal' })
  } else if (pkg.id === 'bower') {
    badges.push({ id: 'succ', icon: 'arrow', label: 'Use webpack or Vite', variant: 'teal' })
  } else if (pkg.recommendations[0]) {
    badges.push({
      id: 'succ',
      icon: 'arrow',
      label: `Consider ${pkg.recommendations[0].name}`,
      variant: 'teal',
    })
  }

  return badges
}

export function getOpenIssues(pkg: Package) {
  return OPEN_ISSUES[pkg.id] ?? { count: 40 + Math.round((100 - pkg.sps) * 3), trend: 'stable' as const }
}

export function getDaysSinceCommit(pkg: Package) {
  const days = pkg.signalFacts?.daysSinceLastCommit ?? daysSinceDate(pkg.lastUpdated)
  return {
    days,
    label: formatDaysSinceLabel(days),
    colorClass: getDaysSinceColorClass(days),
  }
}

export function getSpsColorClass(pkg: Package): string {
  return tierColor(pkg.tier, 'text')
}

export function getPackageAlerts(pkgId: string): AlertHistoryRow[] {
  return alerts
    .filter(a => a.packageId === pkgId)
    .sort((a, b) => new Date(b.firedAt).getTime() - new Date(a.firedAt).getTime())
    .map(a => ({
      id: a.id,
      date: new Date(a.firedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      spsBefore: a.spsBefore,
      spsAfter: a.spsAfter,
      tier: a.tier,
      reason: ALERT_REASONS[a.id] ?? `Tier changed to ${a.tier} after SPS drop`,
    }))
}

export function getMigrationNote(pkg: Package): string {
  const primary = pkg.recommendations[0]?.name ?? 'an alternative'
  return `Based on typical ${pkg.name} → ${primary} migrations in similar codebases. Actual effort depends on custom formatting logic.`
}

export function getMaintainerBarClass(days: number): string {
  if (days < 30) return 'maintainer-bar-active'
  if (days < 180) return 'maintainer-bar-stale'
  return 'maintainer-bar-dormant'
}

export function buildChartSeries(pkg: Package) {
  const currentSps = pkg.sps ?? 0
  const historySource =
    pkg.spsHistory.length > 0
      ? pkg.spsHistory.map((sps) => (sps == null ? currentSps : sps))
      : Array.from({ length: 90 }, () => currentSps)

  const historical = historySource.map((sps, i) => {
    const daysAgo = 89 - i
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return {
      dayIndex: i,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sps,
      segment: 'history' as const,
    }
  })

  const lastSps = historical[historical.length - 1]?.sps ?? currentSps
  const projection = Array.from({ length: 91 }, (_, i) => ({
    dayIndex: 89 + i,
    date: i === 0 ? 'Today' : `+${i}d`,
    sps: lastSps,
    segment: 'projection' as const,
  }))

  return [...historical, ...projection.slice(1)]
}

export type PackageLinkLabel = 'npm' | 'GitHub' | 'Homepage' | 'Issues' | 'Changelog'

export interface PackageLink {
  label: PackageLinkLabel
  href: string
}

const PACKAGE_LINK_URLS: Record<string, Partial<Record<PackageLinkLabel, string>>> = {
  moment: {
    GitHub: 'https://github.com/moment/moment',
    Homepage: 'https://momentjs.com',
    Issues: 'https://github.com/moment/moment/issues',
    Changelog: 'https://github.com/moment/moment/blob/develop/CHANGELOG.md',
  },
  request: {
    GitHub: 'https://github.com/request/request',
    Homepage: 'https://github.com/request/request#readme',
    Issues: 'https://github.com/request/request/issues',
  },
  'left-pad': {
    GitHub: 'https://github.com/stevemao/left-pad',
    Issues: 'https://github.com/stevemao/left-pad/issues',
    Changelog: 'https://github.com/stevemao/left-pad/releases',
  },
  rxjs: {
    GitHub: 'https://github.com/ReactiveX/rxjs',
    Homepage: 'https://rxjs.dev',
    Issues: 'https://github.com/ReactiveX/rxjs/issues',
    Changelog: 'https://github.com/ReactiveX/rxjs/blob/master/CHANGELOG.md',
  },
  'node-sass': {
    GitHub: 'https://github.com/sass/node-sass',
    Issues: 'https://github.com/sass/node-sass/issues',
  },
  bower: {
    GitHub: 'https://github.com/bower/bower',
    Homepage: 'https://bower.io',
    Issues: 'https://github.com/bower/bower/issues',
  },
}

export function getPackageLinks(pkg: Package): PackageLink[] {
  const overrides = PACKAGE_LINK_URLS[pkg.id] ?? {}
  const links: PackageLink[] = []
  const order: PackageLinkLabel[] = ['npm', 'GitHub', 'Homepage', 'Issues', 'Changelog']

  for (const label of order) {
    if (label === 'npm' && pkg.ecosystem === 'npm') {
      links.push({
        label,
        href: overrides.npm ?? `https://www.npmjs.com/package/${pkg.name}`,
      })
      continue
    }
    const href = overrides[label]
    if (href) links.push({ label, href })
  }

  return links
}

export function getRecommendationNpmUrl(rec: Package['recommendations'][0]): string | null {
  if (rec.ecosystem !== 'npm') return null
  if (/^[a-z0-9@][a-z0-9._/-]*$/i.test(rec.name)) {
    return `https://www.npmjs.com/package/${rec.name}`
  }
  return `https://www.npmjs.com/search?q=${encodeURIComponent(rec.name)}`
}

export function formatWeeklyDownloads(count: number | null | undefined): string {
  if (count == null || count === 0) return '—'
  return count.toLocaleString()
}
