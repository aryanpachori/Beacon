import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scanCode } from '../scanCode'

function writeTempFile(name: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'beacon-core-test-'))
  const filePath = join(dir, name)
  writeFileSync(filePath, content)
  return filePath
}

describe('scanCode — secrets', () => {
  it('flags a hardcoded Stripe live key', () => {
    const filePath = writeTempFile(
      'payments.ts',
      `const key = "sk_live_51H8xJ2eZvKYlo2CabcdEFGH1234"\n`
    )
    const findings = scanCode([filePath])
    expect(findings.some((f) => f.category === 'hardcoded_secret')).toBe(true)
  })

  it('does not flag an env var read', () => {
    const filePath = writeTempFile('payments.ts', `const key = process.env.STRIPE_SECRET_KEY\n`)
    expect(scanCode([filePath]).filter((f) => f.category === 'hardcoded_secret')).toHaveLength(0)
  })
})

describe('scanCode — injection', () => {
  it('flags SQL built via template interpolation', () => {
    const filePath = writeTempFile(
      'queries.ts',
      'function findUser(email) {\n  const q = `SELECT * FROM users WHERE email = \'${email}\'`\n  return db.query(q)\n}\n'
    )
    const findings = scanCode([filePath])
    expect(findings.some((f) => f.category === 'sql_injection')).toBe(true)
  })

  it('does not flag a parameterized query', () => {
    const filePath = writeTempFile(
      'queries.ts',
      "function findUser(email) {\n  return db.query('SELECT * FROM users WHERE email = $1', [email])\n}\n"
    )
    expect(scanCode([filePath]).filter((f) => f.category === 'sql_injection')).toHaveLength(0)
  })

  it('flags command injection via exec with interpolation', () => {
    const filePath = writeTempFile(
      'ops.ts',
      'function run(name) {\n  exec(`convert ${name} out.png`)\n}\n'
    )
    const findings = scanCode([filePath])
    expect(findings.some((f) => f.category === 'command_injection')).toBe(true)
  })
})

describe('scanCode — session/token handling', () => {
  it('flags an auth token stored in localStorage', () => {
    const filePath = writeTempFile('auth.tsx', `localStorage.setItem('accessToken', token)\n`)
    const findings = scanCode([filePath])
    expect(findings.some((f) => f.category === 'token_in_local_storage')).toBe(true)
  })

  it('flags a cookie set without httpOnly', () => {
    const filePath = writeTempFile(
      'session.ts',
      "res.cookie('session', token, { secure: true })\n"
    )
    const findings = scanCode([filePath])
    expect(findings.some((f) => f.category === 'missing_httponly_cookie')).toBe(true)
  })

  it('does not flag a properly configured cookie', () => {
    const filePath = writeTempFile(
      'session.ts',
      "res.cookie('session', token, { httpOnly: true, secure: true, sameSite: 'strict' })\n"
    )
    const findings = scanCode([filePath])
    expect(findings.filter((f) => f.category.includes('cookie'))).toHaveLength(0)
  })
})

describe('scanCode — API config', () => {
  it('flags wildcard CORS combined with credentials', () => {
    const filePath = writeTempFile(
      'app.ts',
      "app.use(cors({\n  origin: '*',\n  credentials: true,\n}))\n"
    )
    const findings = scanCode([filePath])
    expect(findings.some((f) => f.category === 'wildcard_cors_with_credentials')).toBe(true)
  })
})

describe('scanCode — SSRF', () => {
  it('flags an outbound fetch built from request input', () => {
    const filePath = writeTempFile(
      'webhooks.ts',
      'app.post("/import", async (req, res) => {\n  const data = await fetch(req.body.url)\n})\n'
    )
    const findings = scanCode([filePath])
    expect(findings.some((f) => f.category === 'ssrf')).toBe(true)
  })
})

describe('scanCode — file upload', () => {
  it('flags multer config with no fileFilter or size limit', () => {
    const filePath = writeTempFile(
      'upload.ts',
      'const upload = multer({\n  dest: "uploads/",\n})\n'
    )
    const findings = scanCode([filePath])
    expect(findings.some((f) => f.category === 'missing_file_type_validation')).toBe(true)
    expect(findings.some((f) => f.category === 'missing_file_size_limit')).toBe(true)
  })
})
