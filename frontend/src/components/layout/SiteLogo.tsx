import Image from 'next/image'
import Link from 'next/link'

type SiteLogoProps = {
  href?: string
  className?: string
  iconClassName?: string
  wordmarkClassName?: string
  onClick?: () => void
  showWordmark?: boolean
  /** Dark surfaces use white mark; light surfaces use black mark. */
  variant?: 'default' | 'onDark'
  size?: number
  wordmark?: string
  priority?: boolean
}

export function BeaconMark({
  size = 28,
  className = '',
  priority = false,
  onDark = false,
}: {
  size?: number
  className?: string
  priority?: boolean
  onDark?: boolean
}) {
  return (
    <Image
      src={onDark ? '/beacon-mark.png' : '/beacon-mark-on-light.png'}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 object-cover ${className}`}
      priority={priority}
    />
  )
}

export function SiteLogo({
  href = '/',
  className = '',
  iconClassName = '',
  wordmarkClassName = '',
  onClick,
  showWordmark = true,
  variant = 'default',
  size,
  wordmark = 'beacon',
  priority = true,
}: SiteLogoProps) {
  const onDark = variant === 'onDark'
  // Nav default 40px; sidebar can pass size={34}
  const tile = size ?? (onDark ? 34 : 40)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex min-w-0 items-center gap-3 ${className}`}
    >
      <span
        className={
          onDark
            ? `relative flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] ${iconClassName}`
            : `flex shrink-0 items-center justify-center overflow-hidden rounded-full ${iconClassName}`
        }
        style={{ width: tile, height: tile }}
      >
        <BeaconMark
          size={tile}
          priority={priority}
          onDark={onDark}
          className="h-full w-full"
        />
      </span>
      {showWordmark && (
        <span
          className={
            wordmarkClassName ||
            (onDark
              ? 'whitespace-nowrap text-[18px] font-bold tracking-[-0.01em] text-white'
              : 'text-[22px] font-semibold tracking-[-0.025em] text-[#08090a]')
          }
        >
          {wordmark}
        </span>
      )}
    </Link>
  )
}
