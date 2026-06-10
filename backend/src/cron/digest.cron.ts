import { prisma } from '../db/client'
import { sendOrgDigest } from '../services/digest.service'

export async function runDigest(): Promise<void> {
  console.log('Org digest starting...')

  const integrations = await prisma.orgIntegration.findMany({
    where: { digestEnabled: true, digestEmail: { not: null } },
    select: { installationId: true, digestFrequency: true },
  })

  for (const row of integrations) {
    if (row.digestFrequency === 'never') continue
    await sendOrgDigest(row.installationId)
  }

  console.log(`Sent digests for ${integrations.length} orgs`)
}
