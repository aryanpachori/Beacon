import { Ecosystem } from '@prisma/client'

const ECOSYSTEM_MAP: Record<string, Ecosystem> = {
  npm: Ecosystem.npm,
  pypi: Ecosystem.pypi,
  cargo: Ecosystem.cargo,
  maven: Ecosystem.maven,
  gem: Ecosystem.gem,
  go: Ecosystem.go,
}

export function toEcosystem(value: string): Ecosystem {
  const eco = ECOSYSTEM_MAP[value]
  if (!eco) throw new Error(`Unknown ecosystem: ${value}`)
  return eco
}
