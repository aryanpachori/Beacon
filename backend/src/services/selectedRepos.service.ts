import { prisma } from '../db/client'

export function parseSelectedRepoIds(selectedRepos: unknown): string[] {
  if (!Array.isArray(selectedRepos)) return []
  return selectedRepos.filter((id): id is string => typeof id === 'string' && id.length > 0)
}

export async function getUserInstallationContext(userId: string) {
  const installation = await prisma.githubInstallation.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      selectedRepos: true,
      installationId: true,
      scanStatus: true,
      scanProgress: true,
    },
  })
  if (!installation) return null

  const selectedRepoIds = parseSelectedRepoIds(installation.selectedRepos)
  return { installation, selectedRepoIds }
}

/** Prisma filter for Repo rows the user is actively monitoring. */
export function monitoredRepoWhere(installationId: string, selectedRepoIds: string[]) {
  if (selectedRepoIds.length === 0) {
    return { installationId, id: { in: [] as string[] } }
  }
  return { installationId, id: { in: selectedRepoIds } }
}

/** Prisma filter for RepoPackage → repo relation scoped to monitored repos. */
export function monitoredRepoRelation(installationId: string, selectedRepoIds: string[]) {
  return { repo: monitoredRepoWhere(installationId, selectedRepoIds) }
}
