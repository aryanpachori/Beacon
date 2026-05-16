import { SiteLogo } from '@/components/layout/SiteLogo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell flex min-h-screen flex-col">
      <header className="flex h-[60px] items-center px-6">
        <SiteLogo />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}
