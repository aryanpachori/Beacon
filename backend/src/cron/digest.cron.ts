import { prisma } from '../db/client'
import { sendOrgDigest } from '../services/digest.service'

export async function runDigest(): Promise<void> {
  const now = new Date()
  const currentUtcHour = now.getUTCHours()  // 0-23
  const currentUtcDay  = now.getUTCDay()    // 0 = Sunday

  if (currentUtcHour !== 2) return   // send once daily at 02:00 UTC (07:30 IST ≈ 8 AM IST)

  const integrations = await prisma.orgIntegration.findMany({
    where: {
      digestEnabled: true,
      digestEmail: { not: null },
      digestFrequency: { not: 'never' },
    },
    select: { installationId: true, digestFrequency: true, digestDay: true },
  })

  let sentCount = 0
  for (const row of integrations) {
    if (row.digestFrequency === 'weekly' && row.digestDay !== currentUtcDay) continue
    await sendOrgDigest(row.installationId)
    sentCount++
  }

  if (sentCount > 0) {
    console.log(`Digest hour=${currentUtcHour}: sent ${sentCount} digests`)
  }
}
