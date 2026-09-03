import { readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  '.turbo',
  'vendor',
  '__pycache__',
])

export type CollectOptions = {
  /** Absolute or relative roots to walk. Defaults to cwd. */
  roots?: string[]
  /** Max files to return (default 2000). */
  maxFiles?: number
  /** Optional predicate; when set, only matching paths are kept. */
  include?: (absPath: string) => boolean
}

/**
 * Recursively collect file paths under roots for local scanners.
 */
export function collectFiles(options: CollectOptions = {}): string[] {
  const roots = (options.roots?.length ? options.roots : ['.']).map((r) => resolve(r))
  const maxFiles = options.maxFiles ?? 2000
  const out: string[] = []

  function walk(dir: string): void {
    if (out.length >= maxFiles) return
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const name of entries) {
      if (out.length >= maxFiles) return
      if (name.startsWith('.') && name !== '.env' && name !== '.env.example') continue
      if (SKIP_DIRS.has(name)) continue
      const full = join(dir, name)
      let st
      try {
        st = statSync(full)
      } catch {
        continue
      }
      if (st.isDirectory()) {
        walk(full)
      } else if (st.isFile()) {
        if (!options.include || options.include(full)) {
          out.push(full)
        }
      }
    }
  }

  for (const root of roots) {
    try {
      const st = statSync(root)
      if (st.isFile()) {
        if (!options.include || options.include(root)) out.push(root)
      } else {
        walk(root)
      }
    } catch {
      // skip missing roots
    }
  }

  return out
}

export function isCodeFile(p: string): boolean {
  return /\.(ts|tsx|js|jsx|mjs|cjs|py)$/i.test(p)
}

export function isManifestFile(p: string): boolean {
  const base = p.split(/[/\\]/).pop() ?? ''
  return (
    base === 'package.json' ||
    base === 'requirements.txt' ||
    base === 'pyproject.toml' ||
    base === 'go.mod' ||
    base === 'Cargo.toml' ||
    base === 'composer.json' ||
    base === 'Gemfile' ||
    base === 'pom.xml'
  )
}

export function isInfraFile(p: string): boolean {
  const base = (p.split(/[/\\]/).pop() ?? '').toLowerCase()
  return (
    /\.(tf|hcl)$/i.test(p) ||
    /docker-compose.*\.ya?ml$/i.test(base) ||
    base === 'dockerfile' ||
    base.startsWith('dockerfile.') ||
    /nginx|caddy|traefik/i.test(base) ||
    /\.(conf|nginx)$/i.test(p) ||
    /(deploy|ingress|helm).*\.ya?ml$/i.test(base)
  )
}

export function relPath(abs: string, cwd = process.cwd()): string {
  return relative(cwd, abs) || abs
}
