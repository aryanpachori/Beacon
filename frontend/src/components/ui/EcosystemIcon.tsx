import type { Ecosystem } from '@/types'
import { cn } from '@/lib/utils'

const ECOSYSTEM_LABELS: Record<Ecosystem, string> = {
  npm:   'npm',
  pypi:  'py',
  cargo: 'rs',
  maven: 'mvn',
  gem:   'gem',
  go:    'go',
}

const ECOSYSTEM_COLORS: Record<Ecosystem, string> = {
  npm:   'bg-red-900/40 text-red-400',
  pypi:  'bg-blue-900/40 text-blue-400',
  cargo: 'bg-orange-900/40 text-orange-400',
  maven: 'bg-purple-900/40 text-purple-400',
  gem:   'bg-pink-900/40 text-pink-400',
  go:    'bg-cyan-900/40 text-cyan-400',
}

interface EcosystemIconProps {
  ecosystem: Ecosystem
  className?: string
}

export function EcosystemIcon({ ecosystem, className }: EcosystemIconProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold font-mono uppercase',
        ECOSYSTEM_COLORS[ecosystem],
        className
      )}
    >
      {ECOSYSTEM_LABELS[ecosystem]}
    </span>
  )
}
