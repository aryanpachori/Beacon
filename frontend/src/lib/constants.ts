import type { Tier } from '@/types'

// Complete string literals so Tailwind JIT scanner includes all classes (D7)
export const TIER_CLASSES = {
  critical: { text: 'text-dl-critical', bg: 'bg-dl-critical', border: 'border-dl-critical' },
  'at-risk': { text: 'text-dl-risk',     bg: 'bg-dl-risk',     border: 'border-dl-risk'     },
  watch:    { text: 'text-dl-watch',    bg: 'bg-dl-watch',    border: 'border-dl-watch'    },
  healthy:  { text: 'text-dl-healthy',  bg: 'bg-dl-healthy',  border: 'border-dl-healthy'  },
} as const

export function tierColor(tier: Tier, variant: 'text' | 'bg' | 'border'): string {
  return TIER_CLASSES[tier][variant]
}

export const TIER_LABELS: Record<Tier, string> = {
  critical: 'Critical',
  'at-risk': 'At risk',
  watch: 'Watch',
  healthy: 'Healthy',
}

export const SPS_THRESHOLDS = {
  critical: 19,
  atRisk: 49,
  watch: 79,
} as const

export function spsToTier(sps: number): Tier {
  if (sps <= SPS_THRESHOLDS.critical) return 'critical'
  if (sps <= SPS_THRESHOLDS.atRisk) return 'at-risk'
  if (sps <= SPS_THRESHOLDS.watch) return 'watch'
  return 'healthy'
}

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Packages',  href: '/packages',  icon: 'Package' },
  { label: 'Alerts',    href: '/alerts',    icon: 'Bell' },
  { label: 'Repos',     href: '/repos',     icon: 'GitBranch' },
] as const
