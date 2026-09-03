import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { makeFinding } from '../finding'
import { detectInfraDrift, diffFindings, findingKey } from '../driftMonitor'
import { scanInfra } from '../scanInfra'

function writeTempFile(name: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'beacon-drift-test-'))
  const filePath = join(dir, name)
  writeFileSync(filePath, content)
  return filePath
}

describe('diffFindings', () => {
  it('reports new findings', () => {
    const baseline = [
      makeFinding({
        severity: 'medium',
        category: 'missing_tls',
        file_path: 'a.conf',
        line_range: null,
        description: 'old',
        suggested_fix: 'x',
        auto_fixable: false,
      }),
    ]
    const current = [
      ...baseline,
      makeFinding({
        severity: 'critical',
        category: 'open_security_group',
        file_path: 'b.tf',
        line_range: [1, 2],
        description: 'new issue',
        suggested_fix: 'y',
        auto_fixable: false,
      }),
    ]
    const drift = diffFindings(baseline, current)
    expect(drift).toHaveLength(1)
    expect(drift[0]?.drift).toBe('new')
  })

  it('reports worsened severity', () => {
    const desc = 'same issue'
    const baseline = [
      makeFinding({
        severity: 'medium',
        category: 'weak_tls',
        file_path: 'a.conf',
        line_range: [1, 1],
        description: desc,
        suggested_fix: 'x',
        auto_fixable: false,
      }),
    ]
    const current = [
      makeFinding({
        severity: 'critical',
        category: 'weak_tls',
        file_path: 'a.conf',
        line_range: [1, 1],
        description: desc,
        suggested_fix: 'x',
        auto_fixable: false,
      }),
    ]
    expect(findingKey(baseline[0]!)).toBe(findingKey(current[0]!))
    const drift = diffFindings(baseline, current)
    expect(drift).toHaveLength(1)
    expect(drift[0]?.drift).toBe('worsened')
    expect(drift[0]?.previousSeverity).toBe('medium')
  })
})

describe('detectInfraDrift', () => {
  it('detects newly introduced open security group', () => {
    const clean = writeTempFile(
      'clean.tf',
      `
resource "aws_security_group" "ok" {
  ingress {
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["10.0.0.0/8"]
  }
}
`
    )
    const baseline = scanInfra([clean])

    const bad = writeTempFile(
      'bad.tf',
      `
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }
}
`
    )
    const drift = detectInfraDrift([bad], baseline)
    expect(drift.some((d) => d.drift === 'new' && d.category === 'open_security_group')).toBe(true)
  })
})
