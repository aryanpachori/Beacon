import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string   // CSS colour variable or Tailwind class
  className?: string
}

export function StatCard({ label, value, sub, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-dash-border bg-dash-surface p-4',
        className
      )}
    >
      <p className="text-xs text-dash-muted uppercase tracking-wide mb-1">{label}</p>
      <p
        className="text-2xl font-bold font-mono tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-dash-muted mt-1">{sub}</p>}
    </div>
  )
}
