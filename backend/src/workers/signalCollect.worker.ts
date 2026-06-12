import { Worker, Job } from 'bullmq'
import { ScanStatus } from '@prisma/client'
import { queueConnection, Queues, SignalCollectJobData, toIntelligenceSignals } from '../lib/queue'
import { enqueueIntelligenceScore } from '../services/intelligenceEnqueue.service'
import { prisma } from '../db/client'
import {
  getInstallationOctokit,
  isManifestPath,
  getManifestEcosystem,
} from '../lib/github'
import { toEcosystem } from '../lib/ecosystem'
import { parseManifest, dedupeDependencies, ParsedDependency } from '../services/manifest.service'
import { collectPackageSignals, cacheSignals } from '../services/signals.service'
import { persistSignals } from '../services/signalPersistence.service'
import { resolvePackageGithubRepo } from '../services/packageRepoResolver.service'
import { buildUnresolvedPackageSignals } from '../services/unresolvedSignals.service'
import { bumpScanProgress, notifyScanProgress } from '../services/scanProgress.service'
import { markScanFailed } from '../services/githubInstallation.service'

const MANIFEST_CONCURRENCY = 10

export function startWorkers(): void {
  const worker = new Worker<SignalCollectJobData>(
    Queues.SIGNAL_COLLECT,
    async (job: Job<SignalCollectJobData>) => {
      await processScanJob(job.data)
    },
    { connection: queueConnection, concurrency: 3 }
  )

  worker.on('failed', async (job, err) => {
    console.error(`signal-collect job ${job?.id} failed:`, err.message)
    const installationDbId = job?.data.installationDbId
    if (installationDbId) {
      await markScanFailed(installationDbId)
    }
  })

  console.log('Signal collect worker started')
}

async function processScanJob(data: SignalCollectJobData): Promise<void> {
  const { installation_id, installationDbId } = data

  console.log(
    JSON.stringify({
      event: 'signal_collect_job_started',
      queue: Queues.SIGNAL_COLLECT,
      installationGithubId: installation_id,
      installationDbId,
      repoCount: data.repos?.length ?? 0,
      triggeredBy: data.triggered_by ?? 'unknown',
      timestamp: new Date().toISOString(),
    })
  )

  const installation = installationDbId
    ? await prisma.githubInstallation.findUnique({ where: { id: installationDbId } })
    : await prisma.githubInstallation.findUnique({
        where: { installationId: BigInt(installation_id) },
      })

  if (!installation) {
    throw new Error(`Installation ${installation_id} not found`)
  }

  const octokit = await getInstallationOctokit(installation_id)
  const allDeps: Array<ParsedDependency & { manifestPath: string; repoId: string }> = []

  const reposToScan = await resolveRepos(data, installation.id, octokit)

  for (const { repoId, owner, repo } of reposToScan) {
    const manifests = await findManifests(octokit, owner, repo, data.repos)

    for (const { path, content } of manifests) {
      const filename = path.split('/').pop()!
      const ecosystem = getManifestEcosystem(filename)
      if (!ecosystem) continue

      const parsed = parseManifest(content, filename, ecosystem)
      for (const dep of parsed) {
        allDeps.push({ ...dep, manifestPath: path, repoId })
      }
    }
  }

  const uniqueDeps = dedupeDependencies(allDeps)

  if (uniqueDeps.length === 0) {
    await prisma.githubInstallation.update({
      where: { id: installation.id },
      data: {
        scanProgress: { total: 0, scanned: 0, scored: 0 },
        scanStatus: ScanStatus.failed,
      },
    })
    await notifyScanProgress(installation.id)
    return
  }

  // Publish total immediately so the UI shows "Found N packages" before the upsert loop
  await prisma.githubInstallation.update({
    where: { id: installation.id },
    data: {
      scanProgress: { total: uniqueDeps.length, scanned: 0, scored: 0 },
      scanStatus: ScanStatus.scanning,
    },
  })
  await notifyScanProgress(installation.id)

  const packageRecords: Array<{
    packageId: string
    dep: ParsedDependency & { manifestPath: string; repoId: string }
  }> = []

  for (const dep of allDeps) {
    const pkg = await prisma.package.upsert({
      where: {
        name_ecosystem: {
          name: dep.name,
          ecosystem: toEcosystem(dep.ecosystem),
        },
      },
      create: {
        name: dep.name,
        ecosystem: toEcosystem(dep.ecosystem),
      },
      update: {},
    })

    const manifestFile = dep.manifestPath.split('/').pop() ?? dep.manifestPath
    await prisma.repoPackage.upsert({
      where: {
        repoId_packageId_manifestPath: {
          repoId: dep.repoId,
          packageId: pkg.id,
          manifestPath: dep.manifestPath,
        },
      },
      create: {
        repoId: dep.repoId,
        packageId: pkg.id,
        manifestPath: dep.manifestPath,
        manifestFile,
        declaredVersion: dep.version,
      },
      update: { declaredVersion: dep.version },
    })

    if (!packageRecords.find((p) => p.packageId === pkg.id)) {
      packageRecords.push({ packageId: pkg.id, dep })
    }
  }

  const totalPackages = packageRecords.length

  const chunks = chunkArray(packageRecords, MANIFEST_CONCURRENCY)
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async ({ packageId, dep }) => {
        const upstream = await resolvePackageGithubRepo(packageId, dep.name, dep.ecosystem)

        let collected
        if (!upstream) {
          console.warn(
            JSON.stringify({
              event: 'package_upstream_repo_unresolved',
              packageId,
              packageName: dep.name,
              ecosystem: dep.ecosystem,
            })
          )
          collected = await buildUnresolvedPackageSignals(dep.name, dep.ecosystem)
        } else {
          console.log(
            JSON.stringify({
              event: 'package_signals_collecting',
              packageId,
              packageName: dep.name,
              ecosystem: dep.ecosystem,
              upstreamRepo: `${upstream.owner}/${upstream.repo}`,
              resolveSource: upstream.source,
            })
          )
          try {
            collected = await collectPackageSignals({
              owner: upstream.owner,
              repo: upstream.repo,
              packageName: dep.name,
              ecosystem: dep.ecosystem,
              octokit,
            })
          } catch (err) {
            console.warn(
              JSON.stringify({
                event: 'package_signals_github_failed',
                packageId,
                packageName: dep.name,
                upstreamRepo: `${upstream.owner}/${upstream.repo}`,
                error: err instanceof Error ? err.message : String(err),
              })
            )
            collected = await buildUnresolvedPackageSignals(dep.name, dep.ecosystem)
          }
        }

        await persistSignals(packageId, collected)
        await cacheSignals(packageId, collected)

        const pkg = await prisma.package.findUnique({
          where: { id: packageId },
          select: { currentSps: true },
        })

        const signalRepo = collected.facts.signalSourceRepo.startsWith('unresolved:')
          ? dep.name
          : collected.facts.signalSourceRepo

        await enqueueIntelligenceScore(
          {
            package_id: packageId,
            prev_sps: pkg?.currentSps ?? null,
            installation_id: installation.id,
            installation_github_id: installation_id,
            signals: toIntelligenceSignals(collected.normalized),
          },
          {
            packageName: dep.name,
            repoFullName: signalRepo,
            triggeredBy: data.triggered_by,
          }
        )

        await bumpScanProgress(installation.id, 'scanned')
      })
    )
  }

  const afterScan = await prisma.githubInstallation.findUnique({
    where: { id: installation.id },
    select: { scanProgress: true, scanStatus: true },
  })
  const progressAfterScan = (afterScan?.scanProgress ?? {}) as {
    total?: number
    scanned?: number
    scored?: number
  }
  const scored = progressAfterScan.scored ?? 0
  const total = progressAfterScan.total ?? totalPackages
  const scanComplete = total > 0 && scored >= total

  await prisma.githubInstallation.update({
    where: { id: installation.id },
    data: {
      scanStatus: scanComplete ? ScanStatus.complete : ScanStatus.scoring,
    },
  })
  await notifyScanProgress(installation.id)

  console.log(
    JSON.stringify({
      event: 'signal_collect_job_complete',
      installationDbId: installation.id,
      totalDependencies: totalPackages,
      scanned: progressAfterScan.scanned ?? totalPackages,
      scored,
      scanComplete,
      timestamp: new Date().toISOString(),
    })
  )

}

async function resolveRepos(
  data: SignalCollectJobData,
  installationDbId: string,
  octokit: Awaited<ReturnType<typeof getInstallationOctokit>>
) {
  if (data.repos?.length) {
    const result: Array<{ repoId: string; owner: string; repo: string }> = []
    for (const r of data.repos) {
      let githubRepoId = BigInt(0)
      try {
        const { data: ghRepo } = await octokit.rest.repos.get({
          owner: r.owner,
          repo: r.repo,
        })
        githubRepoId = BigInt(ghRepo.id)
      } catch {
        // fallback id for upsert key
      }

      const row = await prisma.repo.upsert({
        where: {
          installationId_githubRepoId: {
            installationId: installationDbId,
            githubRepoId,
          },
        },
        create: {
          installationId: installationDbId,
          githubRepoId,
          name: r.repo,
          org: r.owner,
          fullName: `${r.owner}/${r.repo}`,
        },
        update: { fullName: `${r.owner}/${r.repo}` },
      })
      result.push({ repoId: row.id, owner: row.org, repo: row.name })
    }
    return result
  }

  const installation = await prisma.githubInstallation.findUnique({
    where: { id: installationDbId },
    select: { selectedRepos: true },
  })
  const selectedIds = Array.isArray(installation?.selectedRepos)
    ? (installation.selectedRepos as string[])
    : []
  if (selectedIds.length === 0) return []

  const rows = await prisma.repo.findMany({
    where: { id: { in: selectedIds }, installationId: installationDbId },
  })
  return rows.map((row) => ({ repoId: row.id, owner: row.org, repo: row.name }))
}

async function findManifests(
  octokit: Awaited<ReturnType<typeof getInstallationOctokit>>,
  owner: string,
  repo: string,
  filterRepos?: SignalCollectJobData['repos']
) {
  const filterPaths = filterRepos?.find((r) => r.owner === owner && r.repo === repo)?.manifestPaths

  const { data: repoData } = await octokit.rest.repos.get({ owner, repo })
  const branch = repoData.default_branch ?? 'main'
  const { data: ref } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  })

  const { data: tree } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: ref.object.sha,
    recursive: 'true',
  })

  const manifestNodes = (tree.tree ?? []).filter(
    (node) => node.path && node.type === 'blob' && isManifestPath(node.path)
  )

  const toFetch = filterPaths
    ? manifestNodes.filter((n) => filterPaths.includes(n.path!))
    : manifestNodes

  const results: Array<{ path: string; content: string }> = []
  for (const node of toFetch.slice(0, 50)) {
    try {
      const { data: blob } = await octokit.rest.git.getBlob({
        owner,
        repo,
        file_sha: node.sha!,
      })
      const content = Buffer.from(blob.content, 'base64').toString('utf-8')
      results.push({ path: node.path!, content })
    } catch {
      // skip unreadable blobs
    }
  }
  return results
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
