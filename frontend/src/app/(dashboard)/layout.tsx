import { NavSidebar } from '@/components/layout/NavSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-dl-bg">
      <NavSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
