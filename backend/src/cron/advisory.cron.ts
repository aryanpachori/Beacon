import axios from 'axios'
import { Ecosystem, Tier } from '@prisma/client'
import { prisma } from '../db/client'
import { enqueueScan } from '../lib/scanQueue'

// OSV.dev ecosystem names that map to our Ecosystem enum
const OSV_ECOSYSTEM: Partial<Record<Ecosystem, string>> = {
  npm: 'npm',
  pypi: 'PyPI',
  cargo: 'crates.io',
  maven: 'Maven',
  gem: 'RubyGems',
  go: 'Go',
}

interface OsvVuln {
  id: string
  aliases?: string[]
  summary?: string
}

interface OsvResponse {
  vulns?: OsvVuln[]
}

async function fetchOsvVulns(packageName: string, ecosystem: Ecosystem): Promise<OsvVuln[]> {
  const osvEco = OSV_ECOSYSTEM[ecosystem]
  if (!osvEco) return []
  try {
    const { data } = await axios.post<OsvResponse>(
      'https://api.osv.dev/v1/query',
      { package: { name: packageName, ecosystem: osvEco } },
      { timeout: 8000 }
    )
    return data.vulns ?? []
  } catch {
    return []
  }
}

function pickCveId(vulns: OsvVuln[]): string | undefined {
  for (const v of vulns) {
    if (v.id.startsWith('CVE-')) return v.id
    const alias = v.aliases?.find((a) => a.startsWith('CVE-'))
    if (alias) return alias
  }
  return vulns[0]?.id
}

export async function runAdvisoryCheck(): Promise<void> {
  // Only re-check packages not scored in the last 20 hours (advisory now runs once daily).
  const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000)

  const packages = await prisma.package.findMany({
    where: {
      tier: { in: [Tier.critical, Tier.at_risk] },
      lastScoredAt: { lt: twentyHoursAgo },
      repoPackages: {
        some: { repo: { installation: { suspendedAt: null } } },
      },
    },
    orderBy: { lastScoredAt: 'asc' },
    take: 20,
    select: {
      id: true,
      name: true,
      ecosystem: true,
      latestVersion: true,
      repoPackages: {
        take: 1,
        select: {
          repo: {
            select: {
              installationId: true,
              installation: {
                select: { installationId: true, suspendedAt: true },
              },
            },
          },
        },
      },
    },
  })

  let queued = 0
  for (const pkg of packages) {
    const link = pkg.repoPackages[0]
    const installation = link?.repo.installation
    if (!installation || installation.suspendedAt) continue

    // Query OSV.dev for known vulnerabilities
    const vulns = await fetchOsvVulns(pkg.name, pkg.ecosystem)
    const cveId = vulns.length > 0 ? pickCveId(vulns) : undefined

    enqueueScan({
      installation_id: Number(installation.installationId),
      installationDbId: link.repo.installationId,
      triggered_by: 'advisory',
      packageId: pkg.id,
      ...(cveId ? { cveId } : {}),
    })
    queued++
  }

  console.log(`Advisory check: queued ${queued} packages (${packages.filter((p) => p.repoPackages[0]?.repo.installation?.suspendedAt === null).length} active)`)
}
