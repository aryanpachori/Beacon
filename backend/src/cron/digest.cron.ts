import { prisma } from '../db/client'
import { sendOrgDigest } from '../services/digest.service'

export async function runDigest(): Promise<void> {
  console.log('Org digest starting...')

  const integrations = await prisma.orgIntegration.findMany({
    where: { digestEnabled: true, digestEmail: { not: null } },
    select: { installationId: true, digestFrequency: true, digestDay: true },
  })

  const currentUtcDay = new Date().getUTCDay() // 0-6 (Sunday is 0, Monday is 1, etc.)
  let sentCount = 0

  for (const row of integrations) {
    if (row.digestFrequency === 'never') continue
    if (row.digestFrequency === 'weekly' && row.digestDay !== currentUtcDay) continue

    await sendOrgDigest(row.installationId)
    sentCount++
  }

  console.log(`Sent digests for ${sentCount} of ${integrations.length} total enabled integrations`)
}
