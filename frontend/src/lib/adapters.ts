import type {
  Alert,
  Ecosystem,
  MaintainerSnapshot,
  Package,
  Repo,
  Signal,
  SignalFacts,
  Tier,
} from "@/types";

export type ApiPackageListItem = {
  id: string;
  name: string;
  ecosystem: string;
  sps: number | null;
  tier: Tier | null;
  lastUpdated: string;
  version: string;
  repoName: string;
  signals?: ApiSignalsPayload | null;
  spsHistory?: number[];
};

export type ApiPackageDetail = ApiPackageListItem & {
  description?: string | null;
  repos?: { repoName: string; version: string; manifestPath: string }[];
  signals?: ApiSignalsPayload | ApiDbSignal[] | null;
  spsHistory?: number[];
  recommendations?: Package["recommendations"];
  effortEstimate?: Package["effortEstimate"];
  weeklyDownloads?: number | null;
  totalStars?: number | null;
  totalForks?: number | null;
  license?: string | null;
  isDeprecated?: boolean;
  successorPackage?: string | null;
  homepageUrl?: string | null;
  githubRepoUrl?: string | null;
  predictionReason?: string | null;
  predictedCriticalAt?: string | null;
  predictionConfidence?: number | null;
  predictionSlope?: number | null;
};

export type NormalizedSignals = {
  commitVelocity: number;
  maintainerActivity: number;
  funding: number;
  issueResolution: number;
  communityHealth: number;
  securityHygiene: number;
};

export type ApiSignalsPayload = NormalizedSignals & {
  facts?: SignalFacts | null;
  maintainers?: MaintainerSnapshot[];
};

type ApiDbSignal = {
  signalType: string;
  value: number;
  capturedAt: string;
};

export type ApiAlert = {
  id: string;
  packageId: string;
  packageName: string;
  spsBefore: number;
  spsAfter: number;
  tierBefore?: Tier;
  tier: Tier;
  aiReason?: string | null;
  alertType?: string;
  signalPills?: string[];
  firedAt: string;
  slackSent: boolean;
  resolved: boolean;
};

export type ApiRepo = {
  id: string;
  name: string;
  org: string;
  packageCount: number;
  avgSps: number;
  worstPackage: { name: string; sps: number; tier: Tier };
  connectedAt: string;
};

export type ApiDashboard = {
  healthCounts: {
    healthy: number;
    watch: number;
    atRisk: number;
    critical: number;
  };
  criticalPackages: ApiPackageListItem[];
  recentAlerts: ApiAlert[];
  avgSps: number;
  totalPackages: number;
  scanStatus?: string;
  scanProgress?: { total?: number; scanned?: number; scored?: number };
};

export type ApiUser = {
  id: string;
  email: string;
  fullName: string | null;
  nickname: string | null;
  avatarThemeIndex?: number;
  plan: string;
  planStatus?: string;
  onboardingStep?: number;
  repoLimit?: number;
};

const DB_SIGNAL_TYPE_MAP: Record<string, keyof NormalizedSignals> = {
  commit_velocity_30d: "commitVelocity",
  maintainer_activity: "maintainerActivity",
  funding_sponsor_count: "funding",
  issue_close_rate: "issueResolution",
  fork_star_ratio: "communityHealth",
  ossf_score: "securityHygiene",
};

function defaultSignals(): Package["signals"] {
  const neutral: Signal = { value: 50, trend: "stable", weight: "medium" };
  return {
    commitVelocity: neutral,
    maintainerActivity: neutral,
    funding: neutral,
    issueResolution: neutral,
    communityHealth: neutral,
    securityHygiene: neutral,
  };
}

function valueToSignal(value: number): Signal {
  const v = Math.round(value);
  return {
    value: v,
    trend: v >= 55 ? "stable" : "down",
    weight: v < 40 ? "high" : "medium",
  };
}

function isNormalizedSignals(s: unknown): s is NormalizedSignals {
  return (
    typeof s === "object" &&
    s !== null &&
    "commitVelocity" in s &&
    typeof (s as NormalizedSignals).commitVelocity === "number"
  );
}

function extractSignalsPayload(raw: unknown): {
  normalized: NormalizedSignals | null;
  facts: SignalFacts | null;
  maintainers: MaintainerSnapshot[];
} {
  if (!raw) {
    return { normalized: null, facts: null, maintainers: [] };
  }

  if (Array.isArray(raw)) {
    return {
      normalized: dbSignalsToNormalized(raw),
      facts: null,
      maintainers: [],
    };
  }

  if (typeof raw === "object" && raw !== null) {
    const payload = raw as ApiSignalsPayload;
    if (isNormalizedSignals(payload)) {
      const { facts, maintainers, ...rest } = payload;
      return {
        normalized: rest as NormalizedSignals,
        facts: facts ?? null,
        maintainers: maintainers ?? [],
      };
    }
  }

  return { normalized: null, facts: null, maintainers: [] };
}

function dbSignalsToNormalized(
  signals: ApiDbSignal[],
): NormalizedSignals | null {
  const map: Partial<NormalizedSignals> = {};
  for (const row of signals) {
    const key = DB_SIGNAL_TYPE_MAP[row.signalType];
    if (key) map[key] = row.value;
  }
  if (Object.keys(map).length === 0) return null;
  const base = defaultSignals();
  return {
    commitVelocity: map.commitVelocity ?? base.commitVelocity.value,
    maintainerActivity: map.maintainerActivity ?? base.maintainerActivity.value,
    funding: map.funding ?? base.funding.value,
    issueResolution: map.issueResolution ?? base.issueResolution.value,
    communityHealth: map.communityHealth ?? base.communityHealth.value,
    securityHygiene: map.securityHygiene ?? base.securityHygiene.value,
  };
}

export function normalizedToPackageSignals(
  signals: NormalizedSignals,
): Package["signals"] {
  return {
    commitVelocity: valueToSignal(signals.commitVelocity),
    maintainerActivity: valueToSignal(signals.maintainerActivity),
    funding: valueToSignal(signals.funding),
    issueResolution: valueToSignal(signals.issueResolution),
    communityHealth: valueToSignal(signals.communityHealth),
    securityHygiene: valueToSignal(signals.securityHygiene),
  };
}

export function parseSignals(
  raw: ApiPackageDetail["signals"],
): Package["signals"] {
  const { normalized } = extractSignalsPayload(raw);
  if (normalized) return normalizedToPackageSignals(normalized);
  return defaultSignals();
}

function toIsoDate(value: string | Date): string {
  return typeof value === "string" ? value : new Date(value).toISOString();
}

export function adaptPackageListItem(p: ApiPackageListItem): Package {
  const scoringPending = p.sps == null || p.tier == null;
  const extracted = extractSignalsPayload(p.signals);
  return {
    id: p.id,
    name: p.name,
    ecosystem: p.ecosystem as Ecosystem,
    version: p.version || "*",
    repoName: p.repoName || "",
    sps: p.sps ?? 0,
    tier: (p.tier ?? "watch") as Tier,
    scoringPending,
    spsHistory: p.spsHistory ?? [],
    lastUpdated: toIsoDate(p.lastUpdated),
    signals: extracted.normalized
      ? normalizedToPackageSignals(extracted.normalized)
      : defaultSignals(),
    signalFacts: extracted.facts,
    maintainers: extracted.maintainers,
    recommendations: [],
    effortEstimate: { linesImpacted: 0, filesAffected: 0, sprintWeeks: 0 },
  };
}

export function adaptPackageDetail(p: ApiPackageDetail): Package {
  const base = adaptPackageListItem(p);
  return {
    ...base,
    spsHistory: p.spsHistory ?? [],
    recommendations: p.recommendations ?? [],
    effortEstimate: p.effortEstimate ?? base.effortEstimate,
    weeklyDownloads: p.weeklyDownloads ?? undefined,
    totalStars: p.totalStars ?? undefined,
    totalForks: p.totalForks ?? undefined,
    license: p.license ?? undefined,
    isDeprecated: p.isDeprecated ?? false,
    successorPackage: p.successorPackage ?? undefined,
    homepageUrl: p.homepageUrl ?? undefined,
    githubRepoUrl: p.githubRepoUrl ?? undefined,
    predictionReason: p.predictionReason ?? null,
    predictedCriticalAt: p.predictedCriticalAt
      ? toIsoDate(p.predictedCriticalAt)
      : null,
    predictionConfidence: p.predictionConfidence ?? null,
    predictionSlope: p.predictionSlope ?? null,
  };
}

export function adaptAlert(a: ApiAlert): Alert {
  return {
    id: a.id,
    packageId: a.packageId,
    packageName: a.packageName,
    spsBefore: a.spsBefore,
    spsAfter: a.spsAfter,
    tier: a.tier,
    firedAt: toIsoDate(a.firedAt),
    repos: [],
    slackSent: a.slackSent,
    resolved: a.resolved,
    aiReason: a.aiReason ?? undefined,
    signalPills: a.signalPills,
    alertType: a.alertType,
  };
}

export function adaptRepo(r: ApiRepo): Repo {
  return {
    id: r.id,
    name: r.name,
    org: r.org,
    packageCount: r.packageCount,
    avgSps: r.avgSps,
    worstPackage: r.worstPackage,
    connectedAt: toIsoDate(r.connectedAt),
  };
}
