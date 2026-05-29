import { NavSidebar } from '@/components/layout/NavSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell flex min-h-screen bg-dl-page">
      <NavSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
