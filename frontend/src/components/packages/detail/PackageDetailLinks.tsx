import { ExternalLink } from 'lucide-react'
import type { Package } from '@/types'
import { getPackageLinks } from '@/lib/packageDetailData'

interface PackageDetailLinksProps {
  pkg: Package
}

export function PackageDetailLinks({ pkg }: PackageDetailLinksProps) {
  const links = getPackageLinks(pkg)
  if (links.length === 0) return null

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {links.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-dl-border px-3 py-1 text-[11px] text-dl-muted transition-colors hover:border-dl-teal hover:text-dl-teal"
        >
          {label}
          <ExternalLink className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
        </a>
      ))}
    </div>
  )
}
