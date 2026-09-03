import { basename } from 'node:path'
import { readFileSync } from 'node:fs'
import { Finding, makeFinding } from './finding'

/**
 * Network-posture checks across Terraform, compose, nginx, and deploy YAML.
 * Pattern-based heuristics — not a live probe of running infrastructure.
 */
export function scanNetwork(filePaths: string[]): Finding[] {
  const findings: Finding[] = []

  for (const filePath of filePaths) {
    let content: string
    try {
      content = readFileSync(filePath, 'utf-8')
    } catch {
      continue
    }
    const lines = content.split('\n')
    const base = basename(filePath).toLowerCase()

    findings.push(...scanWeakTls(filePath, lines))
    findings.push(...scanMissingMtls(filePath, lines))
    findings.push(...scanDefaultNetworkCreds(filePath, lines))

    if (/\.(ya?ml|yml)$/.test(base) || /\.tf$/.test(base) || /deploy|ingress|helm/.test(base)) {
      findings.push(...scanDeploySignals(filePath, content, lines))
    }
  }

  return findings
}

function scanWeakTls(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  lines.forEach((line, idx) => {
    const lineNo = idx + 1
    if (
      /ssl_protocols\s+[^;]*TLSv1(\s|;|$)/i.test(line) ||
      /ssl_protocols\s+[^;]*TLSv1\.1/i.test(line) ||
      /min_protocol_version\s*=\s*"?TLSv1\.?[01]"?/i.test(line) ||
      /protocol\s*=\s*"?TLSv1\.?[01]"?/i.test(line) ||
      /tls_version\s*=\s*"?1\.[01]"?/i.test(line)
    ) {
      // Allow if line also clearly requires 1.2+ only without 1.0/1.1 — still flag if 1.0/1.1 present
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'weak_tls',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Configuration allows weak or outdated TLS (1.0/1.1).',
          suggested_fix: 'Require TLS 1.2 minimum (prefer TLS 1.3). Remove TLSv1 and TLSv1.1 from allowed protocols.',
          auto_fixable: false,
        })
      )
    }

    if (/ssl_ciphers\s+[^;]*(?:RC4|MD5|DES-CBC3|NULL)/i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'weak_tls',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Weak TLS cipher suites (RC4/MD5/3DES/NULL) are enabled.',
          suggested_fix: 'Use a modern cipher suite list (ECDHE + AEAD only) and disable legacy suites.',
          auto_fixable: false,
        })
      )
    }
  })
  return findings
}

function scanMissingMtls(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  lines.forEach((line, idx) => {
    const lineNo = idx + 1
    if (/verify_client\s+off/i.test(line) || /ssl_verify_client\s+off/i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'medium',
          category: 'missing_mtls',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Client certificate verification is disabled — mTLS is not enforced.',
          suggested_fix: 'Enable verify_client (or equivalent) for internal service listeners that should require mTLS.',
          auto_fixable: false,
        })
      )
    }
  })

  // Internal service listener without any client-cert hint
  const hasInternalListener = lines.some((l) => /listen\s+8443|internal.*listen|upstream.*https/i.test(l))
  const hasClientCert =
    lines.some((l) => /ssl_client_certificate|verify_client|client_auth|mtls|mutual.?tls/i.test(l))
  if (hasInternalListener && !hasClientCert) {
    findings.push(
      makeFinding({
        severity: 'medium',
        category: 'missing_mtls',
        file_path: filePath,
        line_range: null,
        description: 'Internal TLS listener found without client certificate / mTLS configuration.',
        suggested_fix: 'Require client certificates on internal service endpoints or terminate mTLS at the mesh/sidecar.',
        auto_fixable: false,
      })
    )
  }

  return findings
}

function scanDefaultNetworkCreds(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  lines.forEach((line, idx) => {
    const lineNo = idx + 1
    if (
      /(?:admin|root|router)[\s_-]*(?:password|passwd|pwd)\s*[:=]\s*["']?(admin|password|changeme|router|123456)["']?/i.test(
        line
      ) ||
      /default_password\s*=\s*["']?(admin|password|changeme)["']?/i.test(line)
    ) {
      findings.push(
        makeFinding({
          severity: 'critical',
          category: 'default_network_creds',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Default or weak router/admin network credential found in config.',
          suggested_fix: 'Rotate to a unique strong secret and store it in a secrets manager — never commit defaults.',
          auto_fixable: false,
        })
      )
    }
  })
  return findings
}

function scanDeploySignals(filePath: string, content: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  const hasPublicLb =
    /aws_lb|aws_alb|load_balancer|type\s*=\s*"application"|LoadBalancer|ingress\.|kubernetes\.io\/ingress/i.test(
      content
    )
  const hasWaf =
    /aws_waf|wafv2|cloudflare|fastly|akamai|azure.?front.?door|securitypolicy|web.?application.?firewall/i.test(
      content
    )
  const hasDnssec = /dnssec|route53.*dnssec|cloudflare.*dnssec/i.test(content)

  if (hasPublicLb && !hasWaf) {
    findings.push(
      makeFinding({
        severity: 'medium',
        category: 'missing_waf',
        file_path: filePath,
        line_range: null,
        description: 'Public load balancer / ingress present without an associated WAF or CDN security signal.',
        suggested_fix: 'Attach AWS WAFv2, Cloudflare WAF, or equivalent in front of public entry points.',
        auto_fixable: false,
      })
    )
  }

  // Explicit DNS zone without DNSSEC
  const hasDnsZone = /aws_route53_zone|cloudflare_zone|google_dns_managed_zone/i.test(content)
  if (hasDnsZone && !hasDnssec) {
    const zoneLine = lines.findIndex((l) => /aws_route53_zone|cloudflare_zone|google_dns_managed_zone/i.test(l))
    findings.push(
      makeFinding({
        severity: 'low',
        category: 'missing_dnssec',
        file_path: filePath,
        line_range: zoneLine >= 0 ? [zoneLine + 1, zoneLine + 1] : null,
        description: 'DNS zone defined without DNSSEC enablement signals.',
        suggested_fix: 'Enable DNSSEC on the hosted zone and publish DS records at the registrar.',
        auto_fixable: false,
      })
    )
  }

  return findings
}
