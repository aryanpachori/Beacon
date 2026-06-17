import { prisma } from '../db/client'

const HEALTHY_SPS_THRESHOLD = 75
const MAX_RECOMMENDATIONS = 3

type RecommendationRow = {
  toPackageId: string
  reason: string | null
  confidence: number | null
  isOfficial: boolean
  toPackage: {
    id: string
    name: string
    ecosystem: string
    currentSps: number | null
    weeklyDownloads: bigint | null
  }
}

export function formatRecommendations(recs: RecommendationRow[]) {
  return recs.map((r) => ({
    id: r.toPackage.id,
    toPackageId: r.toPackageId,
    name: r.toPackage.name,
    ecosystem: r.toPackage.ecosystem,
    sps: r.toPackage.currentSps ?? 0,
    reason: r.reason ?? undefined,
    confidence: r.confidence ?? 0,
    weeklyDownloads: r.toPackage.weeklyDownloads ? Number(r.toPackage.weeklyDownloads) : 0,
    isOfficial: r.isOfficial,
  }))
}

export async function listPackageRecommendations(packageId: string) {
  const recs = await prisma.recommendation.findMany({
    where: { fromPackageId: packageId },
    include: {
      toPackage: {
        select: {
          id: true,
          name: true,
          ecosystem: true,
          currentSps: true,
          weeklyDownloads: true,
        },
      },
    },
    orderBy: { confidence: 'desc' },
  })
  return formatRecommendations(recs)
}

export async function generateRecommendations(
  packageId: string,
  currentSps: number
): Promise<void> {
  if (currentSps > HEALTHY_SPS_THRESHOLD) {
    await prisma.recommendation.deleteMany({ where: { fromPackageId: packageId } })
    return
  }

  const source = await prisma.package.findUnique({
    where: { id: packageId },
    select: { ecosystem: true },
  })
  if (!source) return

  const candidates = await prisma.package.findMany({
    where: {
      ecosystem: source.ecosystem,
      id: { not: packageId },
      isDeprecated: false,
      currentSps: { gt: HEALTHY_SPS_THRESHOLD },
    },
    select: { id: true, currentSps: true },
    orderBy: { currentSps: 'desc' },
    take: MAX_RECOMMENDATIONS,
  })

  await prisma.$transaction(async (tx) => {
    await tx.recommendation.deleteMany({ where: { fromPackageId: packageId } })
    if (candidates.length === 0) return

    await tx.recommendation.createMany({
      data: candidates.map((candidate) => ({
        fromPackageId: packageId,
        toPackageId: candidate.id,
        reason: `Healthy alternative with SPS ${candidate.currentSps}.`,
        confidence: (candidate.currentSps ?? 0) / 100,
        isOfficial: false,
      })),
    })
  })
}
