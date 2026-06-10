import { PrismaClient, Tier } from '@prisma/client'

export const prisma = new PrismaClient()

prisma
  .$connect()
  .then(() => {
    console.log('PostgreSQL connected')
  })
  .catch((err) => {
    console.error('PostgreSQL connection failed:', err)
    process.exit(1)
  })

/** Map Prisma Tier enum to frontend/API hyphenated form */
export function toApiTier(tier: Tier | null | undefined): string | null {
  if (!tier) return null
  if (tier === Tier.at_risk) return 'at-risk'
  return tier
}

/** Map API tier string to Prisma Tier enum */
export function fromApiTier(tier: string): Tier {
  if (tier === 'at-risk') return Tier.at_risk
  return tier as Tier
}

export function tierRank(tier: Tier | string | null): number {
  const normalized =
    typeof tier === 'string' ? fromApiTier(tier) : tier ?? Tier.healthy
  const ranks: Record<Tier, number> = {
    [Tier.healthy]: 4,
    [Tier.watch]: 3,
    [Tier.at_risk]: 2,
    [Tier.critical]: 1,
  }
  return ranks[normalized] ?? 0
}
