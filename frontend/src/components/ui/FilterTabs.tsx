'use client'

import { cn } from '@/lib/utils'

export interface FilterTab<T extends string> {
  label: string
  value: T
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function FilterTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: FilterTabsProps<T>) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'filter-tab',
            value === tab.value && 'filter-tab-active'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
