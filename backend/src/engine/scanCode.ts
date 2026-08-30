import { readFileSync } from 'node:fs'
import { Finding, makeFinding } from './finding'

/**
 * Application-layer security engine (BE-1 deliverable).
 * Line-based pattern matching across secrets, injection, auth, file upload,
 * session/token handling, API config, and SSRF — not a full AST parser, but
 * enough to catch the common real-world shapes of each vulnerability class
 * without evaluating variables/imports.
 */
export function scanCode(filePaths: string[]): Finding[] {
  const findings: Finding[] = []

  for (const filePath of filePaths) {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    findings.push(...scanSecrets(filePath, lines))
    findings.push(...scanInjection(filePath, lines))
    findings.push(...scanAuth(filePath, lines))
    findings.push(...scanFileUpload(filePath, lines))
    findings.push(...scanSessionTokens(filePath, lines))
    findings.push(...scanApiConfig(filePath, lines))
    findings.push(...scanSsrf(filePath, lines))
  }

  return findings
}

// ── Secrets & credentials ──────────────────────────────────────────────────
const SECRET_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /sk_live_[0-9a-zA-Z]{16,}/, label: 'Stripe live secret key' },
  { re: /AKIA[0-9A-Z]{16}/, label: 'AWS access key ID' },
  { re: /AIza[0-9A-Za-z\-_]{35}/, label: 'Google API key' },
  { re: /ghp_[0-9a-zA-Z]{36}/, label: 'GitHub personal access token' },
  { re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/, label: 'private key block' },
  { re: /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^:\s'"]+:[^@\s'"]+@/, label: 'DB connection string with embedded credentials' },
  { re: /\b(api[_-]?key|secret|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-./+]{12,}['"]/i, label: 'hardcoded credential-like literal' },
]

function scanSecrets(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  lines.forEach((line, idx) => {
    if (/\.env(\.|$)|\.example$|\.sample$/.test(filePath)) return
    for (const { re, label } of SECRET_PATTERNS) {
      if (re.test(line)) {
        findings.push(
          makeFinding({
            severity: 'critical',
            category: 'hardcoded_secret',
            file_path: filePath,
            line_range: [idx + 1, idx + 1],
            description: `Hardcoded ${label} found in source.`,
            suggested_fix: 'Move this value to an environment variable and load it via process.env, never commit it to source control.',
            auto_fixable: false,
          })
        )
        break
      }
    }
  })
  return findings
}

// ── Injection ───────────────────────────────────────────────────────────────
function scanInjection(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  lines.forEach((line, idx) => {
    // SQL/NoSQL built via string concatenation or template interpolation of a variable
    if (
      (/\b(SELECT|INSERT|UPDATE|DELETE)\b/i.test(line) && /\$\{[^}]+\}/.test(line)) ||
      /\b(SELECT|INSERT|UPDATE|DELETE)\b.*['"]\s*\+\s*\w/i.test(line)
    ) {
      findings.push(
        makeFinding({
          severity: 'critical',
          category: 'sql_injection',
          file_path: filePath,
          line_range: [idx + 1, idx + 1],
          description: 'SQL query built via string concatenation/interpolation of a variable — likely injectable.',
          suggested_fix: 'Use parameterized queries or a query builder/ORM that binds values instead of interpolating them into the SQL string.',
          auto_fixable: false,
        })
      )
    }

    // Mongo $where / find with concatenated JS
    if (/\$where\s*:\s*['"`].*\$\{/.test(line)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'nosql_injection',
          file_path: filePath,
          line_range: [idx + 1, idx + 1],
          description: 'MongoDB $where clause interpolates a variable into a JS string — allows NoSQL injection.',
          suggested_fix: 'Avoid $where with untrusted input; express the condition with standard query operators instead.',
          auto_fixable: false,
        })
      )
    }

    // Command injection: exec/execSync with interpolated input
    if (/\b(child_process\.)?exec(Sync)?\s*\(\s*(`[^`]*\$\{|['"][^'"]*['"]\s*\+)/.test(line)) {
      findings.push(
        makeFinding({
          severity: 'critical',
          category: 'command_injection',
          file_path: filePath,
          line_range: [idx + 1, idx + 1],
          description: 'Shell command built via concatenation/interpolation — likely command injection.',
          suggested_fix: 'Use execFile/spawn with an argument array instead of a shell string, so input is never interpreted by the shell.',
          auto_fixable: false,
        })
      )
    }
  })
  return findings
}

// ── Auth (client-side-only checks, BOLA/IDOR heuristics) ────────────────────
function scanAuth(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  const isFrontend = /\.(tsx|jsx)$/.test(filePath)

  lines.forEach((line, idx) => {
    // Client-side-only privilege gate (role/isAdmin read from local state with no server check nearby)
    if (isFrontend && /\b(isAdmin|userRole|role)\s*===?\s*['"](admin|owner)['"]/.test(line) && !/\/\/\s*server-verified/i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'client_side_auth',
          file_path: filePath,
          line_range: [idx + 1, idx + 1],
          description: 'Privilege check appears to run only in frontend code — client-side checks can be bypassed entirely.',
          suggested_fix: 'Re-verify this authorization check on the server for every request that performs the privileged action.',
          auto_fixable: false,
        })
      )
    }

    // BOLA/IDOR heuristic: route handler reads an id param and queries by it directly, with no ownership/userId filter on the same or next couple lines
    const routeParamMatch = line.match(/req\.params\.(\w*[Ii]d)\b/)
    if (routeParamMatch) {
      const windowStart = idx
      const windowEnd = Math.min(lines.length, idx + 4)
      const window = lines.slice(windowStart, windowEnd).join('\n')
      const queriesById = new RegExp(`findById|findOne|findUnique|where:\\s*\\{[^}]*${routeParamMatch[1]}`, 'i').test(window)
      const checksOwnership = /userId|ownerId|req\.user\.(id|userId)|belongsTo/i.test(window)
      if (queriesById && !checksOwnership) {
        findings.push(
          makeFinding({
            severity: 'high',
            category: 'broken_object_level_authorization',
            file_path: filePath,
            line_range: [idx + 1, windowEnd],
            description: `Handler looks up a resource by ${routeParamMatch[1]} from the URL without verifying the requesting user owns it (BOLA/IDOR).`,
            suggested_fix: 'Add a filter (e.g. WHERE userId = req.user.id) or an explicit ownership check before returning/mutating the resource.',
            auto_fixable: false,
          })
        )
      }
    }
  })
  return findings
}

// ── File upload handling ────────────────────────────────────────────────────
function scanFileUpload(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  lines.forEach((line, idx) => {
    if (/multer\s*\(\s*\{/.test(line)) {
      const window = lines.slice(idx, Math.min(lines.length, idx + 8)).join('\n')
      if (!/fileFilter/.test(window)) {
        findings.push(
          makeFinding({
            severity: 'medium',
            category: 'missing_file_type_validation',
            file_path: filePath,
            line_range: [idx + 1, idx + 1],
            description: 'File upload configured without a fileFilter — any file type/executable can be uploaded.',
            suggested_fix: 'Add a fileFilter that allow-lists expected MIME types/extensions and rejects everything else.',
            auto_fixable: false,
          })
        )
      }
      if (!/limits\s*:\s*\{[^}]*fileSize/.test(window)) {
        findings.push(
          makeFinding({
            severity: 'low',
            category: 'missing_file_size_limit',
            file_path: filePath,
            line_range: [idx + 1, idx + 1],
            description: 'File upload configured without a fileSize limit — vulnerable to large-file DoS.',
            suggested_fix: 'Set limits: { fileSize } to a reasonable maximum for the expected upload type.',
            auto_fixable: true,
          })
        )
      }
    }
  })
  return findings
}

// ── Session/token handling ──────────────────────────────────────────────────
function scanSessionTokens(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  lines.forEach((line, idx) => {
    if (/localStorage\.setItem\s*\(\s*['"](\w*token\w*|jwt|accessToken|refreshToken)['"]/i.test(line)) {
      findings.push(
        makeFinding({
          severity: 'medium',
          category: 'token_in_local_storage',
          file_path: filePath,
          line_range: [idx + 1, idx + 1],
          description: 'Auth token stored in localStorage — readable by any script on the page (XSS-stealable).',
          suggested_fix: 'Store session tokens in an httpOnly, secure cookie instead, or accept the XSS blast-radius tradeoff explicitly.',
          auto_fixable: false,
        })
      )
    }

    if (/res\.cookie\s*\(/.test(line)) {
      const window = lines.slice(idx, Math.min(lines.length, idx + 5)).join('\n')
      if (!/httpOnly\s*:\s*true/.test(window)) {
        findings.push(
          makeFinding({
            severity: 'high',
            category: 'missing_httponly_cookie',
            file_path: filePath,
            line_range: [idx + 1, idx + 1],
            description: 'Cookie set without httpOnly — accessible to client-side JavaScript, increasing XSS impact.',
            suggested_fix: 'Add httpOnly: true (and secure: true, sameSite) to the cookie options.',
            auto_fixable: true,
          })
        )
      }
      if (!/secure\s*:\s*true/.test(window)) {
        findings.push(
          makeFinding({
            severity: 'medium',
            category: 'missing_secure_cookie',
            file_path: filePath,
            line_range: [idx + 1, idx + 1],
            description: 'Cookie set without secure — will be sent over plain HTTP.',
            suggested_fix: 'Add secure: true so the cookie is only sent over HTTPS.',
            auto_fixable: true,
          })
        )
      }
    }
  })
  return findings
}

// ── API config: CORS, rate limiting, error verbosity ────────────────────────
function scanApiConfig(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  const fullText = lines.join('\n')

  lines.forEach((line, idx) => {
    if (/origin\s*:\s*['"]\*['"]/.test(line)) {
      const window = lines.slice(Math.max(0, idx - 3), Math.min(lines.length, idx + 4)).join('\n')
      if (/credentials\s*:\s*true/.test(window)) {
        findings.push(
          makeFinding({
            severity: 'high',
            category: 'wildcard_cors_with_credentials',
            file_path: filePath,
            line_range: [idx + 1, idx + 1],
            description: 'CORS configured with a wildcard origin ("*") alongside credentials: true — most browsers reject this, but where accepted it exposes authenticated responses to any origin.',
            suggested_fix: 'Set an explicit allow-list of trusted origins instead of "*" when credentials are enabled.',
            auto_fixable: false,
          })
        )
      }
    }

    if (/\.stack\b/.test(line) && /res\.(send|json)/.test(lines.slice(idx, idx + 2).join('\n'))) {
      findings.push(
        makeFinding({
          severity: 'medium',
          category: 'verbose_error_leakage',
          file_path: filePath,
          line_range: [idx + 1, idx + 1],
          description: 'Stack trace appears to be returned directly in an API response — leaks internals to clients.',
          suggested_fix: 'Log the stack trace server-side and return a generic error message to the client.',
          auto_fixable: false,
        })
      )
    }
  })

  // Whole-file heuristic: an Express app with routes but no rate-limit middleware anywhere
  const looksLikeExpressApp = /express\(\)/.test(fullText) && /app\.(get|post|put|delete)\s*\(/.test(fullText)
  const hasRateLimit = /rate-limit|rateLimit|express-slow-down/i.test(fullText)
  if (looksLikeExpressApp && !hasRateLimit) {
    findings.push(
      makeFinding({
        severity: 'low',
        category: 'missing_rate_limiting',
        file_path: filePath,
        line_range: null,
        description: 'No rate-limiting middleware detected on this Express app.',
        suggested_fix: 'Add express-rate-limit (or similar) to public and auth-sensitive routes to blunt brute-force and abuse.',
        auto_fixable: false,
      })
    )
  }

  return findings
}

// ── SSRF ─────────────────────────────────────────────────────────────────────
function scanSsrf(filePath: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  lines.forEach((line, idx) => {
    const outboundCall = /\b(fetch|axios\.(get|post)|http\.get|https\.get|request)\s*\(\s*(req\.(body|query|params)\b|url)/.test(line)
    if (outboundCall) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'ssrf',
          file_path: filePath,
          line_range: [idx + 1, idx + 1],
          description: 'Outbound request built directly from user-controlled input (webhook/"import from URL"-style) — can be used to reach internal/metadata endpoints.',
          suggested_fix: 'Validate the target against an allow-list of hosts/schemes and block requests to private/link-local IP ranges before making the call.',
          auto_fixable: false,
        })
      )
    }
  })
  return findings
}
