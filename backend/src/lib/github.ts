import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'

function getGitHubAppPrivateKey(): string | undefined {
  const inline = process.env.GITHUB_APP_PRIVATE_KEY
  if (inline) return inline.replace(/\\n/g, '\n')

  const keyPath = process.env.GITHUB_APP_PRIVATE_KEY_PATH
  if (!keyPath) return undefined

  const candidates = [
    resolve(keyPath),
    resolve('/app', keyPath),
    '/app/driftlogg.2026-06-10.private-key.pem',
  ]

  for (const path of candidates) {
    try {
      return readFileSync(path, 'utf8')
    } catch {
      // try next path
    }
  }

  return undefined
}

function getAppAuthConfig() {
  const appId = process.env.GITHUB_APP_ID
  const privateKey = getGitHubAppPrivateKey()
  if (!appId || !privateKey) {
    throw new Error('GitHub App credentials not configured')
  }
  return { appId, privateKey }
}

const MANIFEST_FILES = [
  'package.json',
  'requirements.txt',
  'pyproject.toml',
  'go.mod',
  'pom.xml',
  'Gemfile',
  'Cargo.toml',
  'composer.json',
]

export function isManifestPath(path: string): boolean {
  if (path.includes('node_modules/')) return false
  const basename = path.split('/').pop() ?? ''
  if (basename === 'Gemfile.lock') return false
  return MANIFEST_FILES.includes(basename)
}

export function getManifestEcosystem(filename: string): string | null {
  const map: Record<string, string> = {
    'package.json': 'npm',
    'requirements.txt': 'pypi',
    'pyproject.toml': 'pypi',
    'go.mod': 'go',
    'pom.xml': 'maven',
    Gemfile: 'gem',
    'Cargo.toml': 'cargo',
    'composer.json': 'maven',
  }
  return map[filename] ?? null
}

export async function getAppOctokit(): Promise<Octokit> {
  const { appId, privateKey } = getAppAuthConfig()
  const auth = createAppAuth({ appId, privateKey })
  const { token } = await auth({ type: 'app' })
  return new Octokit({ auth: token })
}

export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
  const { appId, privateKey } = getAppAuthConfig()
  const auth = createAppAuth({
    appId,
    privateKey,
    installationId,
  })

  const { token } = await auth({ type: 'installation' })
  return new Octokit({ auth: token })
}

export function getApiPublicUrl(): string {
  return (process.env.API_PUBLIC_URL || 'http://localhost:4000').replace(/\/$/, '')
}

export function parseOAuthState(state: string): { userId: string; origin?: string } {
  const sep = state.indexOf('::')
  if (sep === -1) return { userId: state }
  return {
    userId: state.slice(0, sep),
    origin: decodeURIComponent(state.slice(sep + 2)),
  }
}

export function buildOAuthState(userId: string, origin?: string): string {
  if (!origin) return userId
  return `${userId}::${encodeURIComponent(origin.replace(/\/$/, ''))}`
}

export function resolveFrontendUrl(origin?: string): string {
  if (origin) return origin.replace(/\/$/, '')
  return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function getOAuthAuthorizeUrl(state: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    throw new Error('GitHub OAuth not configured')
  }

  const redirectUri = `${getApiPublicUrl()}/api/github/oauth/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user',
    state,
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export function getOAuthRedirectUri(): string {
  return `${getApiPublicUrl()}/api/github/oauth/callback`
}

export function getInstallUrl(state?: string): string {
  const appName = process.env.GITHUB_APP_NAME || 'driftlogg'
  const base = `https://github.com/apps/${appName}/installations/new`
  return state ? `${base}?state=${encodeURIComponent(state)}` : base
}

export async function exchangeOAuthCode(code: string): Promise<{ accessToken: string }> {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth not configured')
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: getOAuthRedirectUri(),
    }),
  })

  const data = (await res.json()) as { access_token?: string; error?: string }
  if (!data.access_token) {
    throw new Error(data.error || 'OAuth exchange failed')
  }
  return { accessToken: data.access_token }
}
