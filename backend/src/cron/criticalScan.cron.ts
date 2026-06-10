import { Tier } from '@prisma/client'
import { prisma } from '../db/client'
import { signalCollectQueue } from '../lib/queue'

export async function runCriticalScan(): Promise<void> {
  console.log('Critical tier rescan starting...')

  const installations = await prisma.githubInstallation.findMany({
    where: {
      suspendedAt: null,
      repos: {
        some: {
          repoPackages: {
            some: { package: { tier: Tier.critical } },
          },
        },
      },
    },
    select: { id: true, installationId: true },
    distinct: ['id'],
  })

  for (const installation of installations) {
    await signalCollectQueue.add(
      'critical-scan',
      {
        installation_id: Number(installation.installationId),
        installationDbId: installation.id,
        triggered_by: 'cron-critical',
      },
      { priority: 5 }
    )
  }

  console.log(`Queued ${installations.length} critical installations`)
}
