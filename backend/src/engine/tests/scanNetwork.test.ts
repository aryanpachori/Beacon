import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scanNetwork } from '../scanNetwork'

function writeTempFile(name: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'beacon-net-test-'))
  const filePath = join(dir, name)
  writeFileSync(filePath, content)
  return filePath
}

describe('scanNetwork — weak TLS', () => {
  it('flags TLSv1 in nginx ssl_protocols', () => {
    const filePath = writeTempFile(
      'nginx.conf',
      `
server {
  listen 443 ssl;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
}
`
    )
    const findings = scanNetwork([filePath])
    expect(findings.some((f) => f.category === 'weak_tls')).toBe(true)
  })

  it('flags weak ciphers', () => {
    const filePath = writeTempFile('nginx.conf', 'ssl_ciphers RC4-SHA:DES-CBC3-SHA;\n')
    expect(scanNetwork([filePath]).some((f) => f.category === 'weak_tls')).toBe(true)
  })
})

describe('scanNetwork — mTLS', () => {
  it('flags verify_client off', () => {
    const filePath = writeTempFile('nginx.conf', 'verify_client off;\n')
    const findings = scanNetwork([filePath])
    expect(findings.some((f) => f.category === 'missing_mtls')).toBe(true)
  })
})

describe('scanNetwork — default creds', () => {
  it('flags default router password', () => {
    const filePath = writeTempFile('router.conf', 'admin_password = "admin"\n')
    const findings = scanNetwork([filePath])
    expect(findings[0]).toMatchObject({
      category: 'default_network_creds',
      severity: 'critical',
    })
  })
})

describe('scanNetwork — deploy signals', () => {
  it('flags public LB without WAF', () => {
    const filePath = writeTempFile(
      'deploy.tf',
      `
resource "aws_lb" "public" {
  load_balancer_type = "application"
}
`
    )
    const findings = scanNetwork([filePath])
    expect(findings.some((f) => f.category === 'missing_waf')).toBe(true)
  })

  it('flags DNS zone without DNSSEC', () => {
    const filePath = writeTempFile(
      'dns.tf',
      `
resource "aws_route53_zone" "main" {
  name = "example.com"
}
`
    )
    expect(scanNetwork([filePath]).some((f) => f.category === 'missing_dnssec')).toBe(true)
  })
})
