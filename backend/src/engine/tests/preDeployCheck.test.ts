import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { preDeployCheck } from '../preDeployCheck'

function writeTempFile(dir: string, name: string, content: string): string {
  const filePath = join(dir, name)
  writeFileSync(filePath, content)
  return filePath
}

describe('preDeployCheck', () => {
  it('fails when critical infra findings exist', () => {
    const dir = mkdtempSync(join(tmpdir(), 'beacon-predeploy-'))
    const tf = writeTempFile(
      dir,
      'main.tf',
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
    const result = preDeployCheck([tf])
    expect(result.ok).toBe(false)
    expect(result.criticalCount).toBeGreaterThan(0)
    expect(result.findings.length).toBeGreaterThan(0)
  })

  it('passes a clean package.json with known packages', () => {
    const dir = mkdtempSync(join(tmpdir(), 'beacon-predeploy-'))
    const pkg = writeTempFile(
      dir,
      'package.json',
      JSON.stringify({
        dependencies: { lodash: '^4.17.21', express: '^4.18.0' },
      })
    )
    const result = preDeployCheck([pkg])
    expect(result.ok).toBe(true)
    expect(result.criticalCount).toBe(0)
  })

  it('can ignore high findings when failOnHigh is false', () => {
    const dir = mkdtempSync(join(tmpdir(), 'beacon-predeploy-'))
    const pkg = writeTempFile(
      dir,
      'package.json',
      JSON.stringify({
        dependencies: { lodsh: '^1.0.0' },
      })
    )
    const block = preDeployCheck([pkg])
    expect(block.ok).toBe(false)
    const allow = preDeployCheck([pkg], { failOnHigh: false })
    expect(allow.highCount).toBeGreaterThan(0)
    expect(allow.ok).toBe(true)
  })
})
