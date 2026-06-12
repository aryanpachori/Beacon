import { AlertType, ScanStatus } from "@prisma/client";
import { prisma, fromApiTier, tierRank, toApiTier } from "../db/client";
import { redis } from "../lib/redis";
import { markOnboardingComplete } from "./githubInstallation.service";
import {
  dispatchChannels,
  generateNotificationMessage,
} from "./notification.service";
import { bumpScanProgress } from "./scanProgress.service";

export interface CheckAlertParams {
  installationId: string;
  packageId: string;
  packageName: string;
  prevSps: number | null;
  newSps: number;
  tier: string;
  prevTier: string | null;
  signals: Record<string, number>;
  reason: string;
}

function buildSignalPills(signals: Record<string, number>): string[] {
  return Object.entries(signals)
    .filter(([, score]) => score < 50)
    .map(([key]) => key.replace(/([A-Z])/g, " $1").trim())
    .slice(0, 5);
}

export async function checkAndFireAlert(
  params: CheckAlertParams,
): Promise<void> {
  if (params.prevSps === null) return;

  const integration = await prisma.orgIntegration.findUnique({
    where: { installationId: params.installationId },
  });
  const threshold = integration?.alertThreshold ?? 40;

  const tierAfter = fromApiTier(params.tier);
  const tierBefore = params.prevTier ? fromApiTier(params.prevTier) : null;

  const crossedThreshold =
    params.newSps < threshold && params.prevSps >= threshold;
  const tierWorsened = tierRank(tierAfter) < tierRank(tierBefore);
  const tierImproved = tierRank(tierAfter) > tierRank(tierBefore);

  if (!crossedThreshold && !tierWorsened && !tierImproved) return;

  const alertType: AlertType = tierImproved
    ? AlertType.recovery
    : AlertType.threshold;
  const dedupKey = `alert:dedup:${alertType}:${params.installationId}:${params.packageId}`;
  if (await redis.get(dedupKey)) return;
  await redis.setex(dedupKey, 86400, "1");

  await prisma.alert.create({
    data: {
      installationId: params.installationId,
      packageId: params.packageId,
      spsBefore: params.prevSps,
      spsAfter: params.newSps,
      tierBefore,
      tierAfter,
      aiReason: params.reason,
      alertType,
      signalPills: buildSignalPills(params.signals),
    },
  });

  const installation = await prisma.githubInstallation.findUnique({
    where: { id: params.installationId },
    select: { userId: true },
  });
  if (!installation) return;

  await prisma.notification.create({
    data: {
      userId: installation.userId,
      installationId: params.installationId,
      packageId: params.packageId,
      packageName: params.packageName,
      message: generateNotificationMessage(params.packageName, params.tier),
      tier: tierAfter,
      actionUrl: `/packages/${params.packageId}`,
    },
  });

  await dispatchChannels(integration, {
    packageId: params.packageId,
    packageName: params.packageName,
    prevSps: params.prevSps,
    newSps: params.newSps,
    tier: params.tier,
    prevTier: params.prevTier,
    reason: params.reason,
  });
}

export async function incrementScanScored(
  installationId: string,
  packageId: string,
  newSps: number,
  tier: string,
  prevSps: number | null,
  prevTier: string | null,
  reason: string,
  signals: Record<string, number>,
): Promise<void> {
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { name: true },
  });
  if (!pkg) {
    console.warn(
      JSON.stringify({
        event: "score_complete_skipped",
        reason: "package_not_found",
        packageId,
      }),
    );
    return;
  }

  const installationExists = await prisma.githubInstallation.findUnique({
    where: { id: installationId },
    select: { id: true },
  });
  if (!installationExists) {
    console.warn(
      JSON.stringify({
        event: "score_complete_skipped",
        reason: "installation_not_found",
        installationId,
        packageId,
      }),
    );
    return;
  }

  const tierEnum = fromApiTier(tier);
  const prevTierEnum = prevTier ? fromApiTier(prevTier) : null;

  await prisma.package.update({
    where: { id: packageId },
    data: {
      currentSps: newSps,
      tier: tierEnum,
      lastScoredAt: new Date(),
      predictionReason: reason,
    },
  });

  await prisma.packageScore.create({
    data: {
      packageId,
      sps: newSps,
      tier: tierEnum,
      featureVector: signals,
    },
  });

  const progress = await bumpScanProgress(installationId, "scored");

  await checkAndFireAlert({
    installationId,
    packageId,
    packageName: pkg?.name ?? packageId,
    prevSps,
    newSps,
    tier: toApiTier(tierEnum) ?? tier,
    prevTier: prevTierEnum ? toApiTier(prevTierEnum) : null,
    signals,
    reason,
  });

  if (progress?.status === ScanStatus.complete) {
    await markOnboardingComplete(installationId);
  }
}
