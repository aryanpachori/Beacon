export interface ParsedDependency {
  name: string
  version: string
  ecosystem: string
}

export function parseManifest(
  content: string,
  filename: string,
  ecosystem: string
): ParsedDependency[] {
  switch (filename) {
    case 'package.json':
      return parsePackageJson(content)
    case 'requirements.txt':
      return parseRequirementsTxt(content)
    case 'pyproject.toml':
      return parsePyprojectToml(content)
    case 'go.mod':
      return parseGoMod(content)
    case 'pom.xml':
      return parsePomXml(content)
    case 'Gemfile':
      return parseGemfile(content)
    case 'Cargo.toml':
      return parseCargoToml(content)
    case 'composer.json':
      return parseComposerJson(content)
    default:
      return []
  }
}

function parsePackageJson(content: string): ParsedDependency[] {
  const pkg = JSON.parse(content) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  const deps: ParsedDependency[] = []

  for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
    deps.push({ name, version: cleanVersion(version), ecosystem: 'npm' })
  }
  for (const [name, version] of Object.entries(pkg.devDependencies ?? {})) {
    deps.push({ name, version: cleanVersion(version), ecosystem: 'npm' })
  }
  return deps
}

function parseRequirementsTxt(content: string): ParsedDependency[] {
  const deps: ParsedDependency[] = []
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue
    const match = trimmed.match(/^([a-zA-Z0-9_.-]+)(?:\[.*\])?(?:[=<>!~]+(.+))?/)
    if (match) {
      deps.push({
        name: match[1]!,
        version: match[2]?.trim() || '*',
        ecosystem: 'pypi',
      })
    }
  }
  return deps
}

function parseGoMod(content: string): ParsedDependency[] {
  const deps: ParsedDependency[] = []
  const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/)
  const lines = requireBlock
    ? requireBlock[1]!.split('\n')
    : content.split('\n').filter((l) => l.trim().startsWith('require '))

  for (const line of lines) {
    const match = line.trim().match(/^([^\s]+)\s+([^\s]+)/)
    if (match && !match[1]!.startsWith('//')) {
      deps.push({ name: match[1]!, version: match[2]!, ecosystem: 'go' })
    }
  }
  return deps
}

function parsePomXml(content: string): ParsedDependency[] {
  const deps: ParsedDependency[] = []
  const depRegex =
    /<dependency>[\s\S]*?<groupId>([^<]+)<\/groupId>[\s\S]*?<artifactId>([^<]+)<\/artifactId>[\s\S]*?(?:<version>([^<]*)<\/version>)?[\s\S]*?<\/dependency>/g
  let match: RegExpExecArray | null
  while ((match = depRegex.exec(content)) !== null) {
    deps.push({
      name: `${match[1]}:${match[2]}`,
      version: match[3]?.trim() || '*',
      ecosystem: 'maven',
    })
  }
  return deps
}

function parseGemfile(content: string): ParsedDependency[] {
  const deps: ParsedDependency[] = []
  const gemRegex = /gem\s+['"]([^'"]+)['"](?:,\s*['"]([^'"]+)['"])?/g
  let match: RegExpExecArray | null
  while ((match = gemRegex.exec(content)) !== null) {
    deps.push({
      name: match[1]!,
      version: match[2] || '*',
      ecosystem: 'gem',
    })
  }
  return deps
}

function parsePyprojectToml(content: string): ParsedDependency[] {
  const deps: ParsedDependency[] = []
  const section = content.match(/\[project\.dependencies\]([\s\S]*?)(?:\[|$)/)
  const lines = section ? section[1]!.split('\n') : content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const quoted = trimmed.match(/^["']([^"']+)["']/)
    const bare = trimmed.match(/^([a-zA-Z0-9_.-]+)/)
    const raw = quoted?.[1] ?? bare?.[1]
    if (!raw) continue
    const match = raw.match(/^([a-zA-Z0-9_.-]+)(?:\[.*\])?(?:([=<>!~]+)(.+))?/)
    if (match) {
      deps.push({
        name: match[1]!,
        version: match[3]?.trim() || '*',
        ecosystem: 'pypi',
      })
    }
  }
  return deps
}

function parseComposerJson(content: string): ParsedDependency[] {
  const pkg = JSON.parse(content) as {
    require?: Record<string, string>
    'require-dev'?: Record<string, string>
  }
  const deps: ParsedDependency[] = []
  for (const [name, version] of Object.entries(pkg.require ?? {})) {
    if (name === 'php') continue
    deps.push({ name, version: cleanVersion(version), ecosystem: 'maven' })
  }
  for (const [name, version] of Object.entries(pkg['require-dev'] ?? {})) {
    deps.push({ name, version: cleanVersion(version), ecosystem: 'maven' })
  }
  return deps
}

function parseCargoToml(content: string): ParsedDependency[] {
  const deps: ParsedDependency[] = []
  const section = content.match(/\[dependencies\]([\s\S]*?)(?:\[|$)/)
  if (!section) return deps

  for (const line of section[1]!.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*(?:\{[^}]*version\s*=\s*"([^"]+)"|"([^"]+)")/)
    if (match) {
      deps.push({
        name: match[1]!,
        version: match[2] || match[3] || '*',
        ecosystem: 'cargo',
      })
    }
  }
  return deps
}

function cleanVersion(v: string): string {
  return v.replace(/^[\^~>=<]+/, '').trim() || '*'
}

export function dedupeDependencies(deps: ParsedDependency[]): ParsedDependency[] {
  const map = new Map<string, ParsedDependency>()
  for (const dep of deps) {
    const key = `${dep.ecosystem}:${dep.name}`
    if (!map.has(key)) map.set(key, dep)
  }
  return [...map.values()]
}
