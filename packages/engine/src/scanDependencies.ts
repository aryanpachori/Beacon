import { basename } from 'node:path'
import { readFileSync } from 'node:fs'
import { Finding, makeFinding } from './finding'

/** Popular package names used for offline typosquat / slopsquat detection. */
const POPULAR_NPM = [
  'react',
  'react-dom',
  'next',
  'express',
  'lodash',
  'axios',
  'typescript',
  'webpack',
  'vite',
  'eslint',
  'prettier',
  'jest',
  'vitest',
  'mocha',
  'chalk',
  'commander',
  'debug',
  'uuid',
  'moment',
  'dayjs',
  'rxjs',
  'redux',
  'vue',
  'angular',
  'jquery',
  'request',
  'node-fetch',
  'dotenv',
  'cors',
  'helmet',
  'jsonwebtoken',
  'bcrypt',
  'bcryptjs',
  'prisma',
  'mongoose',
  'sequelize',
  'pg',
  'mysql',
  'redis',
  'socket.io',
  'ws',
  'graphql',
  'apollo-server',
  'nodemon',
  'ts-node',
  'rimraf',
  'cross-env',
  'classnames',
  'prop-types',
  'styled-components',
  'tailwindcss',
  'postcss',
  'sass',
  'yaml',
  'js-yaml',
  'minimist',
  'yargs',
  'inquirer',
  'ora',
  'semver',
  'glob',
  'fs-extra',
  'mkdirp',
  'tmp',
  'form-data',
  'multer',
  'passport',
  'bull',
  'bullmq',
  'ioredis',
  'aws-sdk',
  '@aws-sdk/client-s3',
]

const POPULAR_PYPI = [
  'requests',
  'numpy',
  'pandas',
  'flask',
  'django',
  'fastapi',
  'pydantic',
  'sqlalchemy',
  'pytest',
  'boto3',
  'scipy',
  'matplotlib',
  'pillow',
  'httpx',
  'uvicorn',
  'celery',
  'redis',
  'pyyaml',
  'click',
  'rich',
  'torch',
  'tensorflow',
  'scikit-learn',
  'beautifulsoup4',
  'lxml',
  'aiohttp',
  'tornado',
  'jinja2',
  'cryptography',
  'paramiko',
]

const MAX_TYPO_DISTANCE = 2

interface ParsedDep {
  name: string
  version: string
  ecosystem: 'npm' | 'pypi' | 'go' | 'other'
  line: number | null
}

/**
 * Scans dependency manifests for supply-chain risk: typosquat/slopsquat names,
 * suspicious install scripts, and insecure (http) dependency sources.
 */
export function scanDependencies(filePaths: string[]): Finding[] {
  const findings: Finding[] = []

  for (const filePath of filePaths) {
    const name = basename(filePath)
    let content: string
    try {
      content = readFileSync(filePath, 'utf-8')
    } catch {
      continue
    }

    if (name === 'package.json') {
      findings.push(...scanPackageJson(filePath, content))
    } else if (name === 'requirements.txt') {
      findings.push(...scanRequirementsTxt(filePath, content))
    } else if (name === 'pyproject.toml') {
      findings.push(...scanPyprojectToml(filePath, content))
    } else if (name === 'go.mod') {
      findings.push(...scanGoMod(filePath, content))
    } else if (name === 'Cargo.toml' || name === 'composer.json' || name === 'Gemfile' || name === 'pom.xml') {
      // Parse names from simple patterns for slopsquat only
      findings.push(...scanGenericManifest(filePath, content, name))
    }
  }

  return findings
}

function scanPackageJson(filePath: string, content: string): Finding[] {
  const findings: Finding[] = []
  let pkg: {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    scripts?: Record<string, string>
  }
  try {
    pkg = JSON.parse(content) as typeof pkg
  } catch {
    return findings
  }

  const deps: ParsedDep[] = []
  for (const [depName, version] of Object.entries(pkg.dependencies ?? {})) {
    deps.push({ name: depName, version, ecosystem: 'npm', line: findLineForKey(content, depName) })
  }
  for (const [depName, version] of Object.entries(pkg.devDependencies ?? {})) {
    deps.push({ name: depName, version, ecosystem: 'npm', line: findLineForKey(content, depName) })
  }

  findings.push(...checkSlopsquat(filePath, deps, POPULAR_NPM))
  findings.push(...checkInsecureSources(filePath, deps))

  for (const [scriptName, script] of Object.entries(pkg.scripts ?? {})) {
    if (!/^(pre|post)?install$|^prepublish/.test(scriptName)) continue
    if (/(curl|wget|fetch)\s+[^\n|;]*\|\s*(ba)?sh/i.test(script) || /node\s+-e\s+.*https?:\/\//i.test(script)) {
      const line = findLineForKey(content, scriptName)
      findings.push(
        makeFinding({
          severity: 'critical',
          category: 'suspicious_install_script',
          file_path: filePath,
          line_range: line ? [line, line] : null,
          description: `package.json script "${scriptName}" downloads and executes remote code.`,
          suggested_fix: 'Remove remote shell pipes from install scripts. Vendor needed binaries or use a reviewed postinstall.',
          auto_fixable: false,
        })
      )
    }
  }

  return findings
}

function scanRequirementsTxt(filePath: string, content: string): Finding[] {
  const deps: ParsedDep[] = []
  content.split('\n').forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) return
    const match = trimmed.match(/^([a-zA-Z0-9_.-]+)(?:\[.*\])?(?:[=<>!~]+(.+))?/)
    if (match) {
      deps.push({
        name: match[1]!,
        version: match[2]?.trim() || '*',
        ecosystem: 'pypi',
        line: idx + 1,
      })
    }
  })
  return [...checkSlopsquat(filePath, deps, POPULAR_PYPI), ...checkInsecureSources(filePath, deps)]
}

function scanPyprojectToml(filePath: string, content: string): Finding[] {
  const deps: ParsedDep[] = []
  let inDeps = false
  content.split('\n').forEach((line, idx) => {
    if (/^\[project\.dependencies\]|^\[tool\.poetry\.dependencies\]/.test(line.trim())) {
      inDeps = true
      return
    }
    if (line.trim().startsWith('[')) inDeps = false
    if (!inDeps) return
    const match = line.match(/^\s*([a-zA-Z0-9_.-]+)\s*=/)
    if (match && match[1] !== 'python') {
      deps.push({ name: match[1]!, version: '*', ecosystem: 'pypi', line: idx + 1 })
    }
    const listMatch = line.match(/"([a-zA-Z0-9_.-]+)(?:[=<>!~].*)?"/)
    if (listMatch && /^\s*"/.test(line)) {
      deps.push({ name: listMatch[1]!, version: '*', ecosystem: 'pypi', line: idx + 1 })
    }
  })
  return [...checkSlopsquat(filePath, deps, POPULAR_PYPI), ...checkInsecureSources(filePath, deps)]
}

function scanGoMod(filePath: string, content: string): Finding[] {
  const deps: ParsedDep[] = []
  content.split('\n').forEach((line, idx) => {
    const match = line.trim().match(/^(?:require\s+)?([^\s]+)\s+v[0-9]/)
    if (match && !match[1]!.startsWith('//') && match[1] !== 'require') {
      deps.push({ name: match[1]!, version: '*', ecosystem: 'go', line: idx + 1 })
    }
  })
  return checkInsecureSources(filePath, deps)
}

function scanGenericManifest(filePath: string, content: string, _name: string): Finding[] {
  // Only flag clear http:// dependency URLs in generic manifests
  const findings: Finding[] = []
  content.split('\n').forEach((line, idx) => {
    if (/https?:\/\/|git\+http:\/\//i.test(line) && /http:\/\//i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'insecure_dependency_source',
          file_path: filePath,
          line_range: [idx + 1, idx + 1],
          description: 'Dependency source uses unencrypted HTTP.',
          suggested_fix: 'Use HTTPS (or SSH for git) for all dependency sources.',
          auto_fixable: false,
        })
      )
    }
  })
  return findings
}

function checkSlopsquat(filePath: string, deps: ParsedDep[], popular: string[]): Finding[] {
  const findings: Finding[] = []
  const popularSet = new Set(popular.map((p) => p.toLowerCase()))

  for (const dep of deps) {
    const lower = dep.name.toLowerCase()
    if (popularSet.has(lower)) continue

    // Scoped packages: compare unscoped part
    const bare = lower.includes('/') ? lower.split('/').pop()! : lower
    if (bare.length < 4) continue

    for (const known of popular) {
      const knownBare = known.toLowerCase().includes('/')
        ? known.toLowerCase().split('/').pop()!
        : known.toLowerCase()
      if (bare === knownBare) continue
      if (knownBare.length < 4) continue
      // Require shared first character to cut noise (tsx↔ws, ora↔cors, etc.)
      if (bare[0] !== knownBare[0]) continue
      const dist = levenshtein(bare, knownBare)
      if (dist > 0 && dist <= MAX_TYPO_DISTANCE && Math.abs(bare.length - knownBare.length) <= MAX_TYPO_DISTANCE) {
        findings.push(
          makeFinding({
            severity: 'high',
            category: 'slopsquat',
            file_path: filePath,
            line_range: dep.line ? [dep.line, dep.line] : null,
            description: `Package "${dep.name}" is suspiciously similar to popular package "${known}" (edit distance ${dist}) — possible typosquat/slopsquat.`,
            suggested_fix: `Verify this is the intended package. If you meant "${known}", correct the dependency name.`,
            auto_fixable: false,
          })
        )
        break
      }
    }
  }
  return findings
}

function checkInsecureSources(filePath: string, deps: ParsedDep[]): Finding[] {
  const findings: Finding[] = []
  for (const dep of deps) {
    if (/^http:\/\//i.test(dep.version) || /git\+http:\/\//i.test(dep.version)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'insecure_dependency_source',
          file_path: filePath,
          line_range: dep.line ? [dep.line, dep.line] : null,
          description: `Dependency "${dep.name}" is fetched over unencrypted HTTP.`,
          suggested_fix: 'Use an https:// or git+ssh:// source instead of http://.',
          auto_fixable: false,
        })
      )
    }
  }
  return findings
}

function findLineForKey(content: string, key: string): number | null {
  const lines = content.split('\n')
  const re = new RegExp(`["']${escapeRegExp(key)}["']\\s*:`)
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i]!)) return i + 1
  }
  return null
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i)
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]!
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]!
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + cost)
      prev = tmp
    }
  }
  return dp[n]!
}
