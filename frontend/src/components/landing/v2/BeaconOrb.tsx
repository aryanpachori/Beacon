'use client'

type OrbProps = {
  size?: number
  core?: number
  color?: string
  ring?: string
  duration?: number
  className?: string
}

export function BeaconOrb({
  size = 22,
  core = 9,
  color = '#08090a',
  ring = 'rgba(8,9,10,.55)',
  duration = 2.6,
  className = '',
}: OrbProps) {
  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="bl-orb-ring absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${ring}`,
          animationDuration: `${duration}s`,
        }}
      />
      <div
        className="bl-orb-core rounded-full"
        style={{
          width: core,
          height: core,
          background: color,
          animationDuration: `${duration}s`,
        }}
      />
    </div>
  )
}
