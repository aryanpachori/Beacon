import Link from 'next/link'

type SiteLogoProps = {
  className?: string
  onClick?: () => void
}

export function SiteLogo({ className = '', onClick }: SiteLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`text-[17px] font-semibold ${className || 'text-dl-forest'}`}
    >
      DriftLogg
    </Link>
  )
}
