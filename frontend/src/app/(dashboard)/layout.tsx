import { Suspense } from 'react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { AppDataProvider } from '@/context/AppDataContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-dl-bg text-sm text-dl-muted">
          Loading…
        </div>
      }
    >
      <AppDataProvider>
        <DashboardShell>{children}</DashboardShell>
      </AppDataProvider>
    </Suspense>
  )
}
