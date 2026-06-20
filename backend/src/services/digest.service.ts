import { Tier } from '@prisma/client'
import { prisma, toApiTier } from '../db/client'
import { sendMail, FOUNDER_EMAILS } from '../lib/mailer'
import { buildDigestEmail, buildWelcomeEmail, DigestPackage } from '../lib/emailTemplates'

const DASHBOARD_URL = process.env.FRONTEND_URL ?? 'https://beaconapp.dev'

export async function sendOrgDigest(installationId: string, opts?: { force?: boolean }): Promise<void> {
  const integration = await prisma.orgIntegration.findUnique({
    where: { installationId },
    select: { digestEmail: true, digestFrequency: true, digestEnabled: true },
  })
  if (!opts?.force) {
    if (!integration?.digestEnabled) return
    if (integration.digestFrequency === 'never') return
  }

  const installation = await prisma.githubInstallation.findUnique({
    where: { id: installationId },
    select: { accountLogin: true },
  })

  // Fetch all packages for this installation grouped by tier
  const allPackages = await prisma.package.findMany({
    where: {
      repoPackages: {
        some: { repo: { installationId } },
      },
    },
    select: { name: true, ecosystem: true, currentSps: true, tier: true },
    orderBy: { currentSps: 'asc' },
  })

  function toDigestPkg(p: typeof allPackages[0]): DigestPackage {
    return {
      name: p.name,
      ecosystem: p.ecosystem,
      sps: p.currentSps,
      tier: toApiTier(p.tier) ?? 'healthy',
    }
  }

  const criticalPackages = allPackages.filter(p => p.tier === Tier.critical).map(toDigestPkg)
  const atRiskPackages   = allPackages.filter(p => p.tier === Tier.at_risk).map(toDigestPkg)
  const watchPackages    = allPackages.filter(p => p.tier === Tier.watch).map(toDigestPkg).slice(0, 10)
  const healthyCount     = allPackages.filter(p => p.tier === Tier.healthy).length

  const { subject, html } = buildDigestEmail({
    frequency: integration.digestFrequency === 'weekly' ? 'weekly' : 'daily',
    accountLogin: installation?.accountLogin ?? 'your organization',
    criticalPackages,
    atRiskPackages,
    watchPackages,
    healthyCount,
    totalPackages: allPackages.length,
    dashboardUrl: DASHBOARD_URL,
  })

  // Send to the org's configured email + always the founders
  const to = integration.digestEmail ? [integration.digestEmail, ...FOUNDER_EMAILS] : FOUNDER_EMAILS
  await sendMail({ to, subject, html })
}

export async function sendPublicDigest(): Promise<void> {
  // Aggregate health stats across all packages for the public brief
  const [totalPackages, criticalCount, atRiskCount, healthyCount] = await Promise.all([
    prisma.package.count(),
    prisma.package.count({ where: { tier: Tier.critical } }),
    prisma.package.count({ where: { tier: Tier.at_risk } }),
    prisma.package.count({ where: { tier: Tier.healthy } }),
  ])

  const topCritical = await prisma.package.findMany({
    where: { tier: { in: [Tier.critical, Tier.at_risk] } },
    orderBy: { currentSps: 'asc' },
    take: 5,
    select: { name: true, ecosystem: true, currentSps: true, tier: true },
  })

  function toDigestPkg(p: typeof topCritical[0]): DigestPackage {
    return { name: p.name, ecosystem: p.ecosystem, sps: p.currentSps, tier: toApiTier(p.tier) ?? 'healthy' }
  }

  const { subject, html } = buildDigestEmail({
    frequency: 'weekly',
    accountLogin: 'Beacon Community',
    criticalPackages: topCritical.filter(p => p.tier === Tier.critical).map(toDigestPkg),
    atRiskPackages: topCritical.filter(p => p.tier === Tier.at_risk).map(toDigestPkg),
    watchPackages: [],
    healthyCount,
    totalPackages,
    dashboardUrl: DASHBOARD_URL,
  })

  // Public digest goes to newsletter subscribers + founders
  const subscribers = await prisma.digestSubscriber.findMany({
    where: { subscribed: true },
    select: { email: true },
  })

  const to = [...subscribers.map(s => s.email), ...FOUNDER_EMAILS]
  if (to.length === 0) return

  await sendMail({ to, subject, html })
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  const { subject, html } = buildWelcomeEmail(email)
  await sendMail({ to: [email, ...FOUNDER_EMAILS], subject, html })
}
