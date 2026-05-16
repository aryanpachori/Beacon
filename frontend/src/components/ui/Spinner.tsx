import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)} role="status">
      <div
        className={cn(
          'animate-spin rounded-full border-dl-teal/25 border-t-dl-teal',
          sizeMap[size]
        )}
        aria-hidden
      />
      {label && <p className="text-sm text-dash-muted">{label}</p>}
      <span className="sr-only">{label ?? 'Loading'}</span>
    </div>
  )
}
