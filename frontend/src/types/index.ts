export type Tier = 'healthy' | 'watch' | 'at-risk' | 'critical'
export type Ecosystem = 'npm' | 'pypi' | 'cargo' | 'maven' | 'gem' | 'go'
export type SignalTrend = 'up' | 'down' | 'stable'
export type SignalWeight = 'high' | 'medium'
// No 'low' — only high and medium signals surface in the UI

export interface Signal {
  value: number
  trend: SignalTrend
  weight: SignalWeight
}

export interface Recommendation {
  name: string
  sps: number
  weeklyDownloads: number
  ecosystem: Ecosystem
}

export interface Package {
  id: string
  name: string
  ecosystem: Ecosystem
  version: string
  repoName: string
  sps: number
  tier: Tier
  spsHistory: number[]  // 90 values, index 0 = 90 days ago, index 89 = today
  lastUpdated: string
  signals: {
    commitVelocity:     Signal
    maintainerActivity: Signal
    funding:            Signal
    issueResolution:    Signal
    communityHealth:    Signal
    securityHygiene:    Signal
  }
  recommendations: Recommendation[]
  effortEstimate: { linesImpacted: number; filesAffected: number; sprintWeeks: number }
}

export interface Alert {
  id: string
  packageId: string
  packageName: string
  spsBefore: number
  spsAfter: number
  tier: Tier
  firedAt: string
  repos: string[]
  slackSent: boolean
  jiraCreated: boolean
}

export interface Repo {
  id: string
  name: string
  org: string
  packageCount: number
  avgSps: number
  worstPackage: { name: string; sps: number; tier: Tier }
  connectedAt: string
}
