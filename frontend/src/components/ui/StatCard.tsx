interface StatCardProps {
  label: string
  value: number
  valueClass: string
}

export function StatCard({ label, value, valueClass }: StatCardProps) {
  return (
    <div className="dash-card">
      <div className="dash-section-label mb-2">{label}</div>
      <div className={`stat-value ${valueClass}`}>{value}</div>
    </div>
  )
}
