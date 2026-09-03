import { readFileSync } from 'node:fs'
import { Finding, makeFinding } from './finding'

const LLM_SINKS =
  /\b(generateContent|generateText|chat\.completions|messages\s*[:=]|completion\.create|openai|anthropic|Gemini|GenerativeModel|prompt\s*[:=])/i

const UNTRUSTED_SOURCES =
  /\b(req\.body|request\.body|userContent|user_input|userMessage|user_message|searchParams|query\.|fetchedText|externalContent|htmlContent|markdownContent|untrusted)\b/

/**
 * Flags LLM call sites that appear to concatenate or interpolate untrusted
 * external content into prompts without isolation delimiters.
 */
export function scanPromptInjection(filePaths: string[]): Finding[] {
  const findings: Finding[] = []

  for (const filePath of filePaths) {
    if (!/\.(ts|tsx|js|jsx|py|mjs|cjs)$/.test(filePath)) continue

    let content: string
    try {
      content = readFileSync(filePath, 'utf-8')
    } catch {
      continue
    }

    const lines = content.split('\n')
    findings.push(...scanFile(filePath, content, lines))
  }

  return findings
}

function scanFile(filePath: string, content: string, lines: string[]): Finding[] {
  const findings: Finding[] = []
  const hasIsolation =
    /<<\s*END|<\/?(system|user|assistant)>|INSTRUCTION_BOUNDARY|SAFE_DELIMITER|sanitize(Prompt|Input)|stripHtml|DOMPurify/i.test(
      content
    )

  lines.forEach((line, idx) => {
    const lineNo = idx + 1
    const window = lines.slice(Math.max(0, idx - 3), Math.min(lines.length, idx + 4)).join('\n')

    // Direct interpolation of untrusted input into a prompt-like string near an LLM sink
    if (
      UNTRUSTED_SOURCES.test(line) &&
      (/\$\{[^}]+\}/.test(line) || /\+\s*\w+/.test(line) || /`[^`]*\$\{/.test(line)) &&
      (LLM_SINKS.test(window) || /prompt|messages|systemInstruction/i.test(window))
    ) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'prompt_injection',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description:
            'Untrusted input appears interpolated into an LLM prompt without clear instruction isolation.',
          suggested_fix:
            'Separate system instructions from user/external content with explicit delimiters, sanitize HTML/markdown, and never concatenate raw req.body into the system prompt.',
          auto_fixable: false,
        })
      )
      return
    }

    // Building a prompt template that embeds body fields
    if (
      /prompt\s*(\+|=|\+=)/i.test(line) &&
      UNTRUSTED_SOURCES.test(line) &&
      LLM_SINKS.test(content)
    ) {
      findings.push(
        makeFinding({
          severity: 'high',
          category: 'prompt_injection',
          file_path: filePath,
          line_range: [lineNo, lineNo],
          description: 'Prompt is built by concatenating untrusted request/user content.',
          suggested_fix:
            'Pass user content as a clearly labeled user message role; keep system instructions immutable and isolated.',
          auto_fixable: false,
        })
      )
    }
  })

  // File talks to an LLM and pulls external fetch text into the same prompt blob without isolation helpers
  if (
    LLM_SINKS.test(content) &&
    /await\s+fetch\(|\.text\(\)|\.json\(\)/.test(content) &&
    /prompt|generateContent|messages/i.test(content) &&
    !hasIsolation
  ) {
    // Only add once per file if no line-level finding yet
    if (!findings.some((f) => f.file_path === filePath)) {
      findings.push(
        makeFinding({
          severity: 'medium',
          category: 'prompt_injection',
          file_path: filePath,
          line_range: null,
          description:
            'File fetches external content and sends data to an LLM without detectable sanitization or instruction isolation.',
          suggested_fix:
            'Sanitize fetched content, wrap it in delimiters, and keep it out of the system instruction channel.',
          auto_fixable: false,
        })
      )
    }
  }

  return findings
}
