import { Resend } from 'resend'
import { Tier } from '@prisma/client'
import { prisma, toApiTier } from '../db/client'

export async function sendOrgDigest(installationId: string): Promise<void> {
  const integration = await prisma.orgIntegration.findUnique({
    where: { installationId },
    select: { digestEmail: true, digestFrequency: true, digestEnabled: true },
  })
  if (!integration?.digestEnabled || !integration.digestEmail) return
  if (integration.digestFrequency === 'never') return

  const criticalPackages = await prisma.package.findMany({
    where: {
      tier: { in: [Tier.critical, Tier.at_risk] },
      repoPackages: {
        some: { repo: { installationId } },
      },
    },
    select: { name: true, currentSps: true, tier: true },
    take: 10,
    orderBy: { currentSps: 'asc' },
  })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const items = criticalPackages
    .map(
      (p) =>
        `<li>${p.name}: SPS ${p.currentSps ?? '—'} (${toApiTier(p.tier) ?? 'unknown'})</li>`
    )
    .join('')

  const frequencyName = integration.digestFrequency === 'weekly' ? 'Weekly' : 'Daily'

  await resend.emails.send({
    from: process.env.DIGEST_FROM || 'digest@driftlogg.com',
    to: integration.digestEmail,
    subject: `DriftLogg ${frequencyName} Dependency Health Digest`,
    html: `<h2>Dependency health summary</h2><ul>${items || '<li>No critical packages</li>'}</ul>`,
  })
}

export async function sendPublicDigest(): Promise<void> {
  const subscribers = await prisma.digestSubscriber.findMany({
    where: { subscribed: true },
    select: { email: true },
  })

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || subscribers.length === 0) return

  const resend = new Resend(apiKey)
  for (const sub of subscribers) {
    await resend.emails.send({
      from: process.env.DIGEST_FROM || 'digest@driftlogg.com',
      to: sub.email,
      subject: 'DriftLogg Weekly Open Source Health Brief',
      html: '<p>Your weekly open source dependency health brief from DriftLogg.</p>',
    })
  }
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: process.env.DIGEST_FROM || 'digest@driftlogg.com',
    to: email,
    subject: 'Welcome to DriftLogg digest',
    html: '<p>Thanks for subscribing to the DriftLogg newsletter.</p>',
  })
}
