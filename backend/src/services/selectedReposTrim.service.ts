import { prisma } from '../db/client'
import { parseSelectedRepoIds } from './selectedRepos.service'

/** After a downgrade, keep only the first N monitored repos. */
export async function trimSelectedReposForUser(userId: string, repoLimit: number): Promise<void> {
  const installation = await prisma.githubInstallation.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, selectedRepos: true },
  })
  if (!installation) return

  const selected = parseSelectedRepoIds(installation.selectedRepos)
  if (selected.length <= repoLimit) return

  await prisma.githubInstallation.update({
    where: { id: installation.id },
    data: { selectedRepos: selected.slice(0, repoLimit) },
  })
}
