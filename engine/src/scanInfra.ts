import { readFileSync } from 'node:fs'
import { Finding, makeFinding } from './finding'

const SENSITIVE_PORTS = new Set([22, 23, 3389, 3306, 5432, 6379, 27017, 9200])
const OPEN_CIDR = '0.0.0.0/0'

/**
 * Scans Terraform, Docker/Docker Compose, and nginx/Caddy config files for common
 * infra misconfigurations. Line-based pattern matching, not a full HCL/Dockerfile
 * grammar — enough to flag literal risky values without evaluating variables/refs.
 */
export function scanInfra(filePaths: string[]): Finding[] {
  const findings: Finding[] = []

  for (const filePath of filePaths) {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    if (/\.tf$/.test(filePath)) {
      findings.push(...scanTerraformFile(filePath, lines))
    } else if (/docker-compose|compose\.ya?ml$/.test(filePath)) {
      findings.push(...scanComposeFile(filePath, lines))
    } else if (/Dockerfile/.test(filePath)) {
      findings.push(...scanDockerfile(filePath, lines))
    } else if (/nginx.*\.conf$|Caddyfile/.test(filePath)) {
      findings.push(...scanWebServerConfig(filePath, lines))
    }
  }

  return findings
}

function scanTerraformFile(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  let inIngress = false
  let ingressStart = 0
  let sawOpenCidr = false
  let sawSensitivePort = false

  lines.forEach((line, idx) => {
    const lineNo = idx + 1

    if (/\b(ingress|from_port)\b/.test(line) && line.includes('{')) {
      inIngress = true
      ingressStart = lineNo
      sawOpenCidr = false
      sawSensitivePort = false
    }

    if (inIngress) {
      if (line.includes(OPEN_CIDR)) sawOpenCidr = true
      const portMatch = line.match(/(?:from_port|to_port)\s*=\s*(\d+)/)
      if (portMatch && SENSITIVE_PORTS.has(Number(portMatch[1]))) sawSensitivePort = true

      if (line.trim() === '}') {
        if (sawOpenCidr && sawSensitivePort) {
          findings.push(
            makeFinding({
              severity: 'critical',
              category: 'open_security_group',
              file_path: filePath,
              line_range: [ingressStart, lineNo],
              description: `Security group ingress rule allows ${OPEN_CIDR} on a sensitive port.`,
              suggested_fix: 'Restrict cidr_blocks to known IP ranges or a VPN/bastion CIDR instead of 0.0.0.0/0.',
              auto_fixable: false,
            })
          )
        }
        inIngress = false
      }
    }

    if (/default_credential|password\s*=\s*"(admin|password|changeme|root|123456)"/i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'default_credentials',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Hardcoded default or weak credential found in Terraform config.',
          suggested_fix: 'Replace with a reference to a secrets manager (e.g. aws_secretsmanager_secret) instead of a literal value.',
          auto_fixable: false,
        })
      )
    }

    if (/enable_rls\s*=\s*false|row_level_security\s*=\s*false/i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'disabled_rls',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Row-level security is explicitly disabled on a Supabase/Postgres resource.',
          suggested_fix: 'Enable row-level security and define explicit policies before exposing this table.',
          auto_fixable: true,
        })
      )
    }
  })

  return findings
}

function scanComposeFile(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []

  lines.forEach((line, idx) => {
    const lineNo = idx + 1

    const portMatch = line.match(/^\s*-\s*"?(\d+):(\d+)"?/)
    if (portMatch) {
      const hostPort = Number(portMatch[1])
      if (SENSITIVE_PORTS.has(hostPort)) {
        findings.push(
          makeFinding({
            severity: 'high',
            category: 'open_security_group',
            file_path: filePath,
            line_range: [lineNo, lineNo],
            description: `Container publishes sensitive port ${hostPort} to the host.`,
            suggested_fix: `Bind to 127.0.0.1:${hostPort} or remove the port mapping if not needed externally.`,
            auto_fixable: false,
          })
        )
      }
    }

    if (/^\s*-\s*(POSTGRES_PASSWORD|MYSQL_ROOT_PASSWORD|REDIS_PASSWORD)\s*=\s*(admin|password|changeme|root|123456)\s*$/i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'default_credentials',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Default or weak credential set via environment variable.',
          suggested_fix: 'Use a strong generated secret injected via an .env file excluded from version control, or a secrets manager.',
          auto_fixable: false,
        })
      )
    }
  })

  return findings
}

function scanDockerfile(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []

  lines.forEach((line, idx) => {
    const lineNo = idx + 1
    if (/^\s*ENV\s+\w*PASSWORD\w*\s*=?\s*(admin|password|changeme|root|123456)\b/i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'default_credentials',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Hardcoded default credential baked into the image via ENV.',
          suggested_fix: 'Pass secrets at runtime (--env-file, orchestrator secrets) instead of baking them into the image.',
          auto_fixable: false,
        })
      )
    }
  })

  return findings
}

function scanWebServerConfig(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  const hasListen443 = lines.some((l) => /listen\s+443/.test(l))
  const hasHsts = lines.some((l) => /Strict-Transport-Security/i.test(l))

  if (hasListen443 && !hasHsts) {
    findings.push(
      makeFinding({
        severity: 'medium',
        category: 'missing_tls',
        file_path: filePath,
        line_range: null,
        description: 'TLS is configured (listen 443) but no Strict-Transport-Security header is set.',
        suggested_fix: 'Add `add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;` (nginx) or the Caddy equivalent.',
        auto_fixable: true,
      })
    )
  }

  if (!hasListen443) {
    findings.push(
      makeFinding({
        severity: 'high',
        category: 'missing_tls',
        file_path: filePath,
        line_range: null,
        description: 'No TLS listener (port 443) found in this server config.',
        suggested_fix: 'Terminate TLS at this server or confirm it sits behind a TLS-terminating load balancer/CDN.',
        auto_fixable: false,
      })
    )
  }

  return findings
}
