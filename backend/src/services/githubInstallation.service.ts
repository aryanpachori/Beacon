import { ScanStatus } from '@prisma/client'
import { prisma } from '../db/client'
import { getAppOctokit, getInstallationOctokit } from '../lib/github'
import { notifyScanProgress } from './scanProgress.service'

export type SyncedRepo = {
  id: string
  fullName: string
  name: string
  org: string
}

export async function syncInstallationRepos(
  installationDbId: string,
  installationGithubId: number
): Promise<SyncedRepo[]> {
  const octokit = await getInstallationOctokit(installationGithubId)
  const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
    per_page: 100,
  })

  const synced: SyncedRepo[] = []
  for (const repo of data.repositories) {
    const row = await prisma.repo.upsert({
      where: {
        installationId_githubRepoId: {
          installationId: installationDbId,
          githubRepoId: BigInt(repo.id),
        },
      },
      create: {
        installationId: installationDbId,
        githubRepoId: BigInt(repo.id),
        name: repo.name,
        org: repo.owner?.login ?? 'unknown',
        fullName: repo.full_name,
        defaultBranch: repo.default_branch ?? 'main',
        isPrivate: repo.private ?? false,
      },
      update: {
        defaultBranch: repo.default_branch ?? 'main',
        fullName: repo.full_name,
        org: repo.owner?.login ?? 'unknown',
      },
    })
    synced.push({
      id: row.id,
      fullName: row.fullName,
      name: row.name,
      org: row.org,
    })
  }

  return synced
}

export async function resolveInstallationAccountLogin(
  installationGithubId: number
): Promise<string> {
  try {
    const appOctokit = await getAppOctokit()
    const { data } = await appOctokit.rest.apps.getInstallation({
      installation_id: installationGithubId,
    })
    return data.account && 'login' in data.account ? data.account.login : 'unknown'
  } catch {
    return 'unknown'
  }
}

export async function markScanFailed(installationDbId: string): Promise<void> {
  await prisma.githubInstallation.update({
    where: { id: installationDbId },
    data: { scanStatus: ScanStatus.failed },
  })
  await notifyScanProgress(installationDbId)
}

/** Called once all packages are scored (scanStatus → complete). */
export async function markOnboardingComplete(installationDbId: string): Promise<void> {
  const installation = await prisma.githubInstallation.findUnique({
    where: { id: installationDbId },
    select: { userId: true, scanStatus: true },
  })
  if (!installation?.userId || installation.scanStatus !== ScanStatus.complete) return

  await prisma.user.updateMany({
    where: { id: installation.userId, onboardingCompletedAt: null },
    data: { onboardingStep: 4, onboardingCompletedAt: new Date() },
  })
}

export async function linkInstallationForGitHubUser(
  githubLogin: string,
  userId: string
) {
  const appOctokit = await getAppOctokit()
  const installations = await appOctokit.paginate(appOctokit.rest.apps.listInstallations, {
    per_page: 100,
  })

  const match = installations.find(
    (inst) =>
      inst.account &&
      'login' in inst.account &&
      inst.account.login.toLowerCase() === githubLogin.toLowerCase()
  )

  if (!match?.id) return null

  const accountLogin =
    match.account && 'login' in match.account ? match.account.login : 'unknown'

  return prisma.githubInstallation.upsert({
    where: { installationId: BigInt(match.id) },
    create: {
      userId,
      installationId: BigInt(match.id),
      accountLogin,
      scanStatus: ScanStatus.pending,
      scanProgress: { total: 0, scanned: 0, scored: 0 },
    },
    update: {
      userId,
      accountLogin,
      scanStatus: ScanStatus.pending,
      scanProgress: { total: 0, scanned: 0, scored: 0 },
    },
  })
}
