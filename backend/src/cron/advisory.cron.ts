import { Tier } from '@prisma/client'
import { prisma } from '../db/client'
import { signalCollectQueue } from '../lib/queue'

export async function runAdvisoryCheck(): Promise<void> {
  const packages = await prisma.package.findMany({
    where: {
      tier: { in: [Tier.critical, Tier.at_risk] },
    },
    select: {
      id: true,
      repoPackages: {
        take: 1,
        select: {
          repo: {
            select: {
              installationId: true,
              installation: { select: { installationId: true, suspendedAt: true } },
            },
          },
        },
      },
    },
    take: 20,
  })

  for (const pkg of packages) {
    const link = pkg.repoPackages[0]
    const installation = link?.repo.installation
    if (!installation || installation.suspendedAt) continue

    await signalCollectQueue.add(
      'advisory-check',
      {
        installation_id: Number(installation.installationId),
        installationDbId: link.repo.installationId,
        triggered_by: 'advisory',
        packageId: pkg.id,
      },
      { priority: 15 }
    )
  }
}
