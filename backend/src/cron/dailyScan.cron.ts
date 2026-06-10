import { prisma } from '../db/client'
import { signalCollectQueue } from '../lib/queue'
import { parseSelectedRepoIds } from '../services/selectedRepos.service'

export async function runDailyScan(): Promise<void> {
  console.log('Daily scan starting...')

  const installations = await prisma.githubInstallation.findMany({
    where: { suspendedAt: null },
    select: { id: true, installationId: true, selectedRepos: true },
  })

  let queued = 0
  for (const installation of installations) {
    const selectedIds = parseSelectedRepoIds(installation.selectedRepos)
    if (selectedIds.length === 0) continue

    const repoRows = await prisma.repo.findMany({
      where: { id: { in: selectedIds }, installationId: installation.id },
      select: { org: true, name: true },
    })
    if (repoRows.length === 0) continue

    await signalCollectQueue.add(
      'daily-scan',
      {
        installation_id: Number(installation.installationId),
        installationDbId: installation.id,
        triggered_by: 'cron',
        repos: repoRows.map((r) => ({ owner: r.org, repo: r.name })),
      },
      { priority: 10 }
    )
    queued++
  }

  console.log(`Queued ${queued} installations for daily scan`)
}
