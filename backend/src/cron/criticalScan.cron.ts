import { Tier } from '@prisma/client'
import { prisma } from '../db/client'
import { enqueueScan } from '../lib/scanQueue'

export async function runCriticalScan(): Promise<void> {
  console.log('Critical tier rescan starting...')

  // Group by installation, but only include the specific repos that contain critical packages.
  // Previously we passed no repo list so the worker re-scanned ALL selected repos for the
  // installation even if only one had a critical package — wasteful.
  const rows = await prisma.repoPackage.findMany({
    where: {
      package: { tier: Tier.critical },
      repo: { installation: { suspendedAt: null } },
    },
    select: {
      repo: {
        select: {
          org: true,
          name: true,
          installationId: true,
          installation: {
            select: { id: true, installationId: true },
          },
        },
      },
    },
    distinct: ['repoId'],
  })

  // Group repos by installation
  const byInstallation = new Map<
    string,
    { installationDbId: string; installationGithubId: number; repos: { owner: string; repo: string }[] }
  >()

  for (const row of rows) {
    const inst = row.repo.installation
    const key = inst.id
    if (!byInstallation.has(key)) {
      byInstallation.set(key, {
        installationDbId: inst.id,
        installationGithubId: Number(inst.installationId),
        repos: [],
      })
    }
    byInstallation.get(key)!.repos.push({ owner: row.repo.org, repo: row.repo.name })
  }

  for (const { installationDbId, installationGithubId, repos } of byInstallation.values()) {
    enqueueScan({
      installation_id: installationGithubId,
      installationDbId,
      triggered_by: 'cron-critical',
      repos,
    })
  }

  console.log(`Queued ${byInstallation.size} installations (${rows.length} repos) for critical scan`)
}
