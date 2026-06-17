import { NextRequest, NextResponse } from 'next/server'
import { generateInsight } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, ecosystem, sps, tier, signals, facts } = body

    const signalLines = signals
      ? Object.entries(signals as Record<string, { value: number; trend: string }>)
          .map(([k, v]) => `  • ${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${v.value}/100 (${v.trend})`)
          .join('\n')
      : ''

    const factsLine = facts
      ? `Last commit: ${facts.daysSinceLastCommit ?? '?'}d ago, open issues: ${facts.openIssues ?? '?'}, close rate: ${facts.closeRatePct ?? '?'}%, CVEs: ${facts.cveCount ?? 0}, stars: ${facts.stars ?? '?'}, contributors: ${facts.contributorCount ?? '?'}`
      : ''

    const prompt = `You are Beacon, an AI dependency health analyst. Analyze this open-source package and give a concise, direct 2-3 sentence verdict. Focus on the most critical risk or positive signal. End with one specific, actionable recommendation.

Package: ${name} (${ecosystem})
Health score (SPS): ${sps}/100 — tier: ${tier}
${signalLines ? `Signals:\n${signalLines}` : ''}
${factsLine ? `Stats: ${factsLine}` : ''}

Rules: Be direct. No fluff. No markdown. Under 80 words.`

    const insight = await generateInsight(prompt)
    return NextResponse.json({ insight })
  } catch (err) {
    console.error('[ai/package-insight]', err)
    return NextResponse.json({ error: 'AI insight unavailable' }, { status: 503 })
  }
}
