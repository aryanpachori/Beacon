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
        'rounded-[14px] border border-dash-border bg-dash-surface p-5',
        className
      )}
    >
      <p className="dash-section-label mb-2">{label}</p>
      <p
        className="stat-value"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-dash-muted mt-1">{sub}</p>}
    </div>
  )
}
