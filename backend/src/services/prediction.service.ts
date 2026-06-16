/**
 * Post-score prediction engine — runs on the Node backend when persisting a score
 * (score-complete callback from py-intelligence, or the optional Node dev worker).
 *
 * Lives here (not py-intelligence) because it reads package_scores history from Postgres.
 * py-intelligence only does stateless XGBoost inference; Redis connects the two services.
 */
import { prisma } from "../db/client";
import type { IntelligenceSignalsPayload } from "../lib/queue";

const FEATURE_KEYS = [
  "commit_velocity",
  "maintainer_activity",
  "security_hygiene",
  "issue_resolution",
  "funding",
  "community_health",
] as const satisfies ReadonlyArray<keyof IntelligenceSignalsPayload>;

const SIGNAL_LABELS: Record<(typeof FEATURE_KEYS)[number], string> = {
  commit_velocity: "Commit velocity",
  maintainer_activity: "Maintainer activity",
  security_hygiene: "Security hygiene",
  issue_resolution: "Issue resolution",
  funding: "Funding",
  community_health: "Community health",
};

const MIN_DAILY_POINTS = 7;
const MAX_DAILY_POINTS = 30;
const R2_THRESHOLD = 0.7;
const CRITICAL_SPS = 20;
const MAX_FORECAST_DAYS = 365;
const DEPRECATED_SECURITY_THRESHOLD = 15;
const DAY_MS = 86_400_000;

const DEFAULT_FEATURE_VECTOR: IntelligenceSignalsPayload = {
  commit_velocity: 0,
  maintainer_activity: 0,
  security_hygiene: 0,
  issue_resolution: 0,
  funding: 0,
  community_health: 0,
};

export type PackagePrediction = {
  predictedCriticalAt: Date;
  predictionConfidence: number;
  predictionSlope: number;
  predictionReason: string;
};

type DailyPoint = {
  sps: number;
  featureVector: IntelligenceSignalsPayload;
  scoredAt: Date;
};

function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** One row per UTC calendar day via DISTINCT ON — uses (packageId, scoredAt) index. */
async function fetchDailyHistory(packageId: string): Promise<DailyPoint[]> {
  const rows = await prisma.$queryRaw<
    { sps: number; featureVector: unknown; scoredAt: Date }[]
  >`
    SELECT sps, "featureVector", "scoredAt"
    FROM (
      SELECT DISTINCT ON (date_trunc('day', "scoredAt" AT TIME ZONE 'UTC'))
        sps, "featureVector", "scoredAt"
      FROM package_scores
      WHERE "packageId" = ${packageId}
      ORDER BY date_trunc('day', "scoredAt" AT TIME ZONE 'UTC') DESC, "scoredAt" DESC
      LIMIT ${MAX_DAILY_POINTS - 1}
    ) AS latest_per_day
    ORDER BY "scoredAt" ASC
  `;

  return rows.map((row) => ({
    sps: row.sps,
    featureVector:
      (row.featureVector as IntelligenceSignalsPayload) ??
      DEFAULT_FEATURE_VECTOR,
    scoredAt: row.scoredAt,
  }));
}

export function linearRegression(values: number[]): {
  slope: number;
  rSquared: number;
} {
  const n = values.length;
  if (n < 2) return { slope: 0, rSquared: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = values[i]!;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, rSquared: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;

  for (let i = 0; i < n; i++) {
    const y = values[i]!;
    const predicted = intercept + slope * i;
    ssTot += (y - meanY) ** 2;
    ssRes += (y - predicted) ** 2;
  }

  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, rSquared };
}

function generateDeclineReason(
  oldest: IntelligenceSignalsPayload,
  newest: IntelligenceSignalsPayload,
  dayCount: number,
  daysSinceLastCommit?: number,
): string {
  let bestKey: (typeof FEATURE_KEYS)[number] | null = null;
  let bestDrop = 0;

  for (const key of FEATURE_KEYS) {
    const old = oldest[key];
    if (old <= 0) continue;
    const drop = ((old - newest[key]) / old) * 100;
    if (drop > bestDrop) {
      bestDrop = drop;
      bestKey = key;
    }
  }

  if (
    bestKey === "maintainer_activity" &&
    daysSinceLastCommit &&
    daysSinceLastCommit >= 30
  ) {
    return `Maintainer inactive ${daysSinceLastCommit} days.`;
  }

  if (bestKey && bestDrop > 0) {
    return `${SIGNAL_LABELS[bestKey]} dropped ${Math.round(bestDrop)}% over ${dayCount} days.`;
  }

  return `SPS is declining steadily over the past ${dayCount} days.`;
}

export async function computePrediction(
  packageId: string,
  currentSps: number,
  currentSignals: IntelligenceSignalsPayload,
): Promise<PackagePrediction | null> {
  if (currentSignals.security_hygiene <= DEPRECATED_SECURITY_THRESHOLD)
    return null;
  if (currentSps <= CRITICAL_SPS) return null;

  const now = new Date();
  const today = utcDay(now);

  const prior = await fetchDailyHistory(packageId);
  const withoutToday = prior.filter((p) => utcDay(p.scoredAt) !== today);
  const series: DailyPoint[] = [
    ...withoutToday,
    { sps: currentSps, featureVector: currentSignals, scoredAt: now },
  ];

  if (series.length < MIN_DAILY_POINTS) return null;

  const { slope, rSquared } = linearRegression(series.map((p) => p.sps));
  if (rSquared <= R2_THRESHOLD || slope >= 0) return null;

  const daysToCritical = (currentSps - CRITICAL_SPS) / Math.abs(slope);
  if (!Number.isFinite(daysToCritical) || daysToCritical <= 0) return null;

  const cappedDays = Math.min(daysToCritical, MAX_FORECAST_DAYS);
  const predictedCriticalAt = new Date(now.getTime() + cappedDays * DAY_MS);

  const maintainerRow = await prisma.packageSignal.findFirst({
    where: { packageId, signalType: "maintainer_activity" },
    orderBy: { capturedAt: "desc" },
    select: { rawData: true },
  });
  const daysSinceLastCommit = (
    maintainerRow?.rawData as {
      facts?: { daysSinceLastCommit?: number };
    } | null
  )?.facts?.daysSinceLastCommit;

  const predictionReason = generateDeclineReason(
    series[0]!.featureVector,
    series[series.length - 1]!.featureVector,
    series.length,
    daysSinceLastCommit,
  );

  return {
    predictedCriticalAt,
    predictionConfidence: rSquared,
    predictionSlope: slope,
    predictionReason,
  };
}
