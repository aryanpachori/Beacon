import Image from 'next/image'
import Link from 'next/link'

type SiteLogoProps = {
  className?: string
  onClick?: () => void
  showWordmark?: boolean
}

export function SiteLogo({
  className = '',
  onClick,
  showWordmark = true,
}: SiteLogoProps) {
  const wordmarkClass = className || 'text-dl-forest'

  return (
    <Link
      href="/"
      onClick={onClick}
      className="inline-flex items-center gap-2.5"
    >
      <Image
        src="/logo.png"
        alt="DriftLogg"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-md"
        priority
      />
      {showWordmark && (
        <span className={`text-[17px] font-semibold ${wordmarkClass}`}>
          DriftLogg
        </span>
      )}
    </Link>
  )
}
