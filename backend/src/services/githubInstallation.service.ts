import { ScanStatus } from '@prisma/client'
import { prisma } from '../db/client'
import { getAppOctokit, getInstallationOctokit } from '../lib/github'
import { notifyScanProgress } from './scanProgress.service'

export type SyncedRepo = {
  id: string           // DB UUID when persisted; GitHub repo ID string when from listInstallationRepos
  githubRepoId?: number
  fullName: string
  name: string
  org: string
  defaultBranch?: string
  isPrivate?: boolean
}

/**
 * Fetch all repos accessible to this GitHub App installation from the API.
 * Does NOT write to the database — repos are persisted only when the user
 * explicitly selects them via /start-scan.
 */
export async function listInstallationRepos(
  installationGithubId: number
): Promise<SyncedRepo[]> {
  const octokit = await getInstallationOctokit(installationGithubId)
  const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
    per_page: 100,
  })

  return data.repositories.map((repo) => ({
    id: repo.id.toString(),          // GitHub repo ID (not a DB ID)
    githubRepoId: repo.id,
    fullName: repo.full_name,
    name: repo.name,
    org: repo.owner?.login ?? 'unknown',
    defaultBranch: repo.default_branch ?? 'main',
    isPrivate: repo.private ?? false,
  }))
}

/**
 * Upsert only the repos the user has selected into the DB.
 * Called from /start-scan — not on every GitHub connect.
 */
export async function upsertSelectedRepos(
  installationDbId: string,
  repos: Array<{ githubRepoId: number; name: string; org: string; defaultBranch?: string; isPrivate?: boolean }>
): Promise<SyncedRepo[]> {
  const upserted: SyncedRepo[] = []
  for (const r of repos) {
    const row = await prisma.repo.upsert({
      where: {
        installationId_githubRepoId: {
          installationId: installationDbId,
          githubRepoId: BigInt(r.githubRepoId),
        },
      },
      create: {
        installationId: installationDbId,
        githubRepoId: BigInt(r.githubRepoId),
        name: r.name,
        org: r.org,
        fullName: `${r.org}/${r.name}`,
        defaultBranch: r.defaultBranch ?? 'main',
        isPrivate: r.isPrivate ?? false,
      },
      update: { org: r.org, fullName: `${r.org}/${r.name}` },
    })
    upserted.push({ id: row.id, fullName: row.fullName, name: row.name, org: row.org })
  }
  return upserted
}

/** @deprecated Use listInstallationRepos (no DB writes) instead. */
export async function syncInstallationRepos(
  installationDbId: string,
  installationGithubId: number
): Promise<SyncedRepo[]> {
  return listInstallationRepos(installationGithubId)
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
  // Guard: installation may have been deleted between job enqueue and execution
  const exists = await prisma.githubInstallation.findUnique({ where: { id: installationDbId }, select: { id: true } })
  if (!exists) return
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
