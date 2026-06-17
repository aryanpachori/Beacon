export type Tier = "healthy" | "watch" | "at-risk" | "critical";
export type Ecosystem = "npm" | "pypi" | "cargo" | "maven" | "gem" | "go";
export type SignalTrend = "up" | "down" | "stable";
export type SignalWeight = "high" | "medium";
// No 'low' — only high and medium signals surface in the UI

export interface Signal {
  value: number;
  trend: SignalTrend;
  weight: SignalWeight;
}

export interface SignalFacts {
  daysSinceLastCommit: number;
  commitsLast30d: number;
  commitsLast90d: number;
  primaryMaintainerLogin: string | null;
  primaryMaintainerName: string | null;
  contributorCount: number;
  openIssues: number;
  closeRatePct: number;
  staleIssuePct: number;
  stars: number;
  forks: number;
  forkStarRatio: number;
  sponsorCount: number;
  hasFundingYml: boolean;
  ossfScore: number;
  daysSinceRelease: number;
  cveCount: number;
  isDeprecated?: boolean;
  deprecatedMessage?: string | null;
  signalSourceRepo: string;
}

export interface MaintainerSnapshot {
  login: string;
  name: string;
  lastCommitDays: number;
  publicRepos: number;
  sponsor: string;
  isPrimary: boolean;
}

export interface Recommendation {
  name: string;
  sps: number;
  weeklyDownloads: number;
  ecosystem: Ecosystem;
}

export interface Package {
  id: string;
  name: string;
  ecosystem: Ecosystem;
  version: string;
  repoName: string;
  sps: number;
  tier: Tier;
  /** True when signals are collected but intelligence scoring has not run yet */
  scoringPending?: boolean;
  spsHistory: number[]; // 90 values, index 0 = 90 days ago, index 89 = today
  lastUpdated: string;
  signals: {
    commitVelocity: Signal;
    maintainerActivity: Signal;
    funding: Signal;
    issueResolution: Signal;
    communityHealth: Signal;
    securityHygiene: Signal;
  };
  recommendations: Recommendation[];
  effortEstimate: {
    linesImpacted: number;
    filesAffected: number;
    sprintWeeks: number;
  };
  signalFacts?: SignalFacts | null;
  maintainers?: MaintainerSnapshot[];
  // Extended detail fields (populated on package detail page only)
  weeklyDownloads?: number;
  totalStars?: number;
  totalForks?: number;
  license?: string;
  isDeprecated?: boolean;
  successorPackage?: string;
  homepageUrl?: string;
  githubRepoUrl?: string;
  predictionReason?: string | null;
  predictedCriticalAt?: string | null;
  predictionConfidence?: number | null;
  predictionSlope?: number | null;
}

export interface Alert {
  id: string;
  packageId: string;
  packageName: string;
  spsBefore: number;
  spsAfter: number;
  tier: Tier;
  firedAt: string;
  repos: string[];
  slackSent: boolean;
  resolved: boolean;
  aiReason?: string;
  signalPills?: string[];
  alertType?: string;
}

export interface Repo {
  id: string;
  name: string;
  org: string;
  packageCount: number;
  avgSps: number;
  worstPackage: { name: string; sps: number; tier: Tier };
  connectedAt: string;
}
