import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

export type BeaconSyncConfig = {
  apiUrl?: string
  token?: string
  autoSync?: boolean
}

export type BeaconConfigFile = {
  version: number
  sync?: BeaconSyncConfig & {
    apiUrlEnv?: string
    tokenEnv?: string
  }
}

function readJson(path: string): BeaconConfigFile | null {
  try {
    if (!existsSync(path)) return null
    return JSON.parse(readFileSync(path, 'utf-8')) as BeaconConfigFile
  } catch {
    return null
  }
}

/** Walk cwd → parents for `.beacon/config.json`, then `~/.beacon/config.json`. */
export function findConfigPath(startDir = process.cwd()): string | null {
  let dir = resolve(startDir)
  for (;;) {
    const candidate = join(dir, '.beacon', 'config.json')
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  const home = join(homedir(), '.beacon', 'config.json')
  return existsSync(home) ? home : null
}

export function loadBeaconConfig(startDir = process.cwd()): BeaconConfigFile {
  const path = findConfigPath(startDir)
  return path ? readJson(path) ?? { version: 1 } : { version: 1 }
}

/**
 * Resolve API URL + token for dashboard sync.
 * Priority: explicit opts → env → .beacon/config.json
 */
export function resolveSyncCredentials(opts?: {
  apiUrl?: string
  token?: string
}): { apiUrl: string; token: string; autoSync: boolean } | null {
  const file = loadBeaconConfig()
  const apiUrl = (
    opts?.apiUrl ||
    process.env.BEACON_API_URL ||
    file.sync?.apiUrl ||
    ''
  ).replace(/\/$/, '')
  const token =
    opts?.token ||
    process.env.BEACON_API_TOKEN ||
    process.env.BEACON_ACCESS_TOKEN ||
    file.sync?.token ||
    ''

  if (!apiUrl || !token) return null

  const autoSync =
    process.env.BEACON_AUTO_SYNC === '0'
      ? false
      : file.sync?.autoSync !== false

  return { apiUrl, token, autoSync }
}

/** Write sync credentials to project `.beacon/config.json` and `~/.beacon/config.json`. */
export function writeSyncCredentials(apiUrl: string, token: string): { project: string; home: string } {
  const payload: BeaconConfigFile = {
    version: 1,
    sync: {
      apiUrl: apiUrl.replace(/\/$/, ''),
      token,
      autoSync: true,
    },
  }
  const body = JSON.stringify(payload, null, 2) + '\n'

  const projectDir = join(process.cwd(), '.beacon')
  mkdirSync(projectDir, { recursive: true })
  const project = join(projectDir, 'config.json')
  writeFileSync(project, body)

  const homeDir = join(homedir(), '.beacon')
  mkdirSync(homeDir, { recursive: true })
  const home = join(homeDir, 'config.json')
  writeFileSync(home, body)

  return { project, home }
}
