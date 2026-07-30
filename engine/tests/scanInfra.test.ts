import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scanInfra } from '../src/scanInfra'

function writeTempFile(name: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'beacon-core-test-'))
  const filePath = join(dir, name)
  writeFileSync(filePath, content)
  return filePath
}

describe('scanInfra — terraform', () => {
  it('flags an open security group on a sensitive port', () => {
    const filePath = writeTempFile(
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

    const findings = scanInfra([filePath])
    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({
      severity: 'critical',
      category: 'open_security_group',
      status: 'open',
    })
  })

  it('does not flag a security group restricted to a private CIDR', () => {
    const filePath = writeTempFile(
      'main.tf',
      `
resource "aws_security_group" "ok" {
  ingress {
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["10.0.0.0/16"]
  }
}
`
    )

    expect(scanInfra([filePath])).toHaveLength(0)
  })

  it('flags a hardcoded default credential', () => {
    const filePath = writeTempFile(
      'main.tf',
      `
resource "aws_db_instance" "db" {
  password = "admin"
}
`
    )

    const findings = scanInfra([filePath])
    expect(findings).toHaveLength(1)
    expect(findings[0]?.category).toBe('default_credentials')
  })

  it('flags disabled row-level security', () => {
    const filePath = writeTempFile(
      'main.tf',
      `
resource "supabase_table" "users" {
  enable_rls = false
}
`
    )

    const findings = scanInfra([filePath])
    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({ category: 'disabled_rls', auto_fixable: true })
  })
})

describe('scanInfra — docker compose', () => {
  it('flags a sensitive port published to the host', () => {
    const filePath = writeTempFile(
      'docker-compose.yml',
      `
services:
  db:
    image: postgres
    ports:
      - "5432:5432"
`
    )

    const findings = scanInfra([filePath])
    expect(findings).toHaveLength(1)
    expect(findings[0]?.category).toBe('open_security_group')
  })

  it('flags a default password environment variable', () => {
    const filePath = writeTempFile(
      'docker-compose.yml',
      `
services:
  db:
    environment:
      - POSTGRES_PASSWORD=admin
`
    )

    const findings = scanInfra([filePath])
    expect(findings).toHaveLength(1)
    expect(findings[0]?.category).toBe('default_credentials')
  })
})

describe('scanInfra — nginx', () => {
  it('flags missing HSTS when TLS is configured', () => {
    const filePath = writeTempFile(
      'nginx.conf',
      `
server {
  listen 443 ssl;
}
`
    )

    const findings = scanInfra([filePath])
    expect(findings.map((f) => f.category)).toContain('missing_tls')
  })

  it('does not flag when HSTS header is present', () => {
    const filePath = writeTempFile(
      'nginx.conf',
      `
server {
  listen 443 ssl;
  add_header Strict-Transport-Security "max-age=63072000" always;
}
`
    )

    expect(scanInfra([filePath])).toHaveLength(0)
  })
})

describe('scanInfra — finding schema', () => {
  it('every finding matches the shared schema shape', () => {
    const filePath = writeTempFile(
      'main.tf',
      `
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 3389
    to_port     = 3389
    cidr_blocks = ["0.0.0.0/0"]
  }
}
`
    )

    const [finding] = scanInfra([filePath])
    expect(finding).toBeDefined()
    expect(finding).toMatchObject({
      id: expect.any(String),
      severity: expect.stringMatching(/^(critical|high|medium|low)$/),
      category: expect.any(String),
      file_path: filePath,
      description: expect.any(String),
      suggested_fix: expect.any(String),
      auto_fixable: expect.any(Boolean),
      detected_at: expect.any(String),
      status: 'open',
    })
  })
})
