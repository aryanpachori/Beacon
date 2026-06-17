import { GoogleGenerativeAI } from '@google/generative-ai'

const MODEL_PRIORITY = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
]

let _client: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!_client) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not set')
    _client = new GoogleGenerativeAI(key)
  }
  return _client
}

/**
 * Generate text with automatic model fallback.
 * Tries models in priority order (most capable free → least) until one succeeds.
 */
export async function generateInsight(prompt: string): Promise<string> {
  const client = getClient()
  let lastError: unknown

  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
      })
      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      if (text) return text
    } catch (err) {
      lastError = err
    }
  }

  throw lastError ?? new Error('All Gemini models failed')
}
