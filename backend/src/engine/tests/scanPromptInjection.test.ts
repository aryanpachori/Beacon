import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { scanPromptInjection } from '../scanPromptInjection'

function writeTempFile(name: string, content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'beacon-prompt-test-'))
  const filePath = join(dir, name)
  writeFileSync(filePath, content)
  return filePath
}

describe('scanPromptInjection', () => {
  it('flags req.body interpolated into a prompt near generateContent', () => {
    const filePath = writeTempFile(
      'route.ts',
      `
export async function POST(req: Request) {
  const body = await req.json()
  const prompt = \`Analyze this: \${body.userContent}\`
  await model.generateContent(prompt)
}
`
    )
    const findings = scanPromptInjection([filePath])
    expect(findings.some((f) => f.category === 'prompt_injection')).toBe(true)
    expect(findings[0]?.severity).toMatch(/high|medium/)
  })

  it('flags fetch + LLM without isolation', () => {
    const filePath = writeTempFile(
      'insight.ts',
      `
async function run() {
  const res = await fetch('https://example.com/doc')
  const text = await res.text()
  const prompt = 'Summarize: ' + text
  await openai.chat.completions.create({ messages: [{ role: 'user', content: prompt }] })
}
`
    )
    const findings = scanPromptInjection([filePath])
    expect(findings.some((f) => f.category === 'prompt_injection')).toBe(true)
  })

  it('does not flag a clean typed helper with no untrusted concat', () => {
    const filePath = writeTempFile(
      'safe.ts',
      `
const SYSTEM = 'You are a helpful assistant.'
export function buildMessages(userMessage: string) {
  return [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: userMessage },
  ]
}
`
    )
    // userMessage alone without req.body / fetch may still not match UNTRUSTED_SOURCES
    expect(scanPromptInjection([filePath])).toHaveLength(0)
  })
})
