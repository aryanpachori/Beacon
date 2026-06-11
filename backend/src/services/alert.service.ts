import { AlertType, ScanStatus, AlertSeverity } from '@prisma/client'
import { prisma, fromApiTier, tierRank, toApiTier } from '../db/client'
import { redis } from '../lib/redis'
import {
  dispatchChannels,
  generateNotificationMessage,
} from './notification.service'
import { notifyScanProgress } from './scanProgress.service'

export interface CheckAlertParams {
  installationId: string
  packageId: string
  packageName: string
  prevSps: number | null
  newSps: number
  tier: string
  prevTier: string | null
  signals: Record<string, number>
  reason: string
  isAdvisory?: boolean
  cveId?: string
  cisaUrl?: string
  affectedVersions?: string[]
  safeVersions?: string[]
}

function buildSignalPills(signals: Record<string, number>): string[] {
  return Object.entries(signals)
    .filter(([, score]) => score < 50)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
    .slice(0, 5)
}

export async function checkAndFireAlert(params: CheckAlertParams): Promise<void> {
  if (params.prevSps === null) return

  const integration = await prisma.orgIntegration.findUnique({
    where: { installationId: params.installationId },
  })
  const threshold = integration?.alertThreshold ?? 40

  const tierAfter = fromApiTier(params.tier)
  const tierBefore = params.prevTier ? fromApiTier(params.prevTier) : null

  const crossedThreshold =
    params.newSps < threshold && params.prevSps >= threshold
  const tierWorsened = tierRank(tierAfter) < tierRank(tierBefore)
  const tierImproved = tierRank(tierAfter) > tierRank(tierBefore)

  let alertType: AlertType
  let severity: AlertSeverity = AlertSeverity.normal

  if (params.isAdvisory || params.cveId) {
    alertType = AlertType.supply_chain
    severity = AlertSeverity.critical_override
  } else if (tierImproved) {
    alertType = AlertType.recovery
  } else if (crossedThreshold) {
    alertType = AlertType.threshold
  } else if (tierWorsened) {
    alertType = AlertType.tier_change
  } else {
    return
  }

  const dedupKey = `alert:dedup:${alertType}:${params.installationId}:${params.packageId}`
  if (await redis.get(dedupKey)) return
  await redis.setex(dedupKey, 86400, '1')

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
      severity,
      cveId: params.cveId || null,
      cisaUrl: params.cisaUrl || null,
      affectedVersions: params.affectedVersions ?? undefined,
      safeVersions: params.safeVersions ?? undefined,
      signalPills: buildSignalPills(params.signals),
    },
  })

  const installation = await prisma.githubInstallation.findUnique({
    where: { id: params.installationId },
    select: { userId: true },
  })
  if (!installation) return

  await prisma.notification.create({
    data: {
      userId: installation.userId,
      installationId: params.installationId,
      packageId: params.packageId,
      packageName: params.packageName,
      message: generateNotificationMessage(params.packageName, params.tier, alertType),
      tier: tierAfter,
      actionUrl: `/packages/${params.packageId}`,
    },
  })

  await dispatchChannels(integration, {
    packageId: params.packageId,
    packageName: params.packageName,
    prevSps: params.prevSps,
    newSps: params.newSps,
    tier: params.tier,
    prevTier: params.prevTier,
    reason: params.reason,
    alertType,
    cveId: params.cveId,
  })
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
  isAdvisory?: boolean,
  cveId?: string,
  cisaUrl?: string,
  affectedVersions?: string[],
  safeVersions?: string[]
): Promise<void> {
  const tierEnum = fromApiTier(tier)
  const prevTierEnum = prevTier ? fromApiTier(prevTier) : null

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { name: true },
  })

  await prisma.package.update({
    where: { id: packageId },
    data: {
      currentSps: newSps,
      tier: tierEnum,
      lastScoredAt: new Date(),
      predictionReason: reason,
    },
  })

  await prisma.packageScore.create({
    data: {
      packageId,
      sps: newSps,
      tier: tierEnum,
      featureVector: signals,
    },
  })

  const installation = await prisma.githubInstallation.findUnique({
    where: { id: installationId },
    select: { scanProgress: true },
  })

  const progress = (installation?.scanProgress ?? {}) as {
    total?: number
    scanned?: number
    scored?: number
  }
  const scored = (progress.scored ?? 0) + 1
  const newProgress = { ...progress, scored }

  await prisma.githubInstallation.update({
    where: { id: installationId },
    data: {
      scanProgress: newProgress,
      ...(newProgress.total !== undefined && scored >= newProgress.total
        ? { scanStatus: ScanStatus.complete }
        : {}),
    },
  })
  await notifyScanProgress(installationId)

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
    isAdvisory,
    cveId,
    cisaUrl,
    affectedVersions,
    safeVersions,
  })
}
