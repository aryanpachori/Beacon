import Image from 'next/image'
import Link from 'next/link'

type SiteLogoProps = {
  className?: string
  iconClassName?: string
  onClick?: () => void
  showWordmark?: boolean
}

export function SiteLogo({
  className = '',
  iconClassName = '',
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
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center ${iconClassName}`}
      >
        <Image
          src="/beacon-mark.png"
          alt=""
          width={32}
          height={32}
          className="h-7 w-7 shrink-0 object-contain"
          priority
        />
      </span>
      {showWordmark && (
        <span
          className={`text-[19px] font-semibold tracking-[-0.025em] ${wordmarkClass}`}
        >
          beacon
        </span>
      )}
    </Link>
  )
}
