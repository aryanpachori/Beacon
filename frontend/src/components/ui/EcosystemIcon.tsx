import type { Ecosystem } from '@/types'
import { cn } from '@/lib/utils'

const ECOSYSTEM_LABELS: Record<Ecosystem, string> = {
  npm: 'npm',
  pypi: 'py',
  cargo: 'rs',
  maven: 'mvn',
  gem: 'gem',
  go: 'go',
}

interface EcosystemIconProps {
  ecosystem: Ecosystem
  className?: string
}

export function EcosystemIcon({ ecosystem, className }: EcosystemIconProps) {
  return (
    <span
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-dl-teal/15 font-mono text-[12px] font-medium uppercase text-dl-teal',
        className
      )}
    >
      {ECOSYSTEM_LABELS[ecosystem]}
    </span>
  )
}
