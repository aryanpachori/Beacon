import { NextRequest, NextResponse } from 'next/server'
import { generateInsight } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { totalPackages, critical, atRisk, watch, healthy, avgSps, topDeclining, topImproving, signalAverages } = body

    const decliningStr = (topDeclining as { name: string; spsDrop: number; tier: string }[])
      ?.slice(0, 3)
      .map(p => `${p.name} (${p.tier}${p.spsDrop > 0 ? `, -${p.spsDrop} SPS` : ''})`)
      .join(', ') ?? 'none'

    const improvingStr = (topImproving as { name: string; spsGain: number }[])
      ?.slice(0, 3)
      .map(p => `${p.name}${p.spsGain > 0 ? ` (+${p.spsGain} SPS)` : ''}`)
      .join(', ') ?? 'none'

    const weakSignals = (signalAverages as { signal: string; avg: number }[])
      ?.filter(s => s.avg < 50)
      .map(s => `${s.signal.replace(/_/g, ' ')} (${s.avg})`)
      .join(', ') ?? 'none'

    const prompt = `You are Beacon, an AI stack health analyst. Give a concise 2-3 sentence executive summary of this software stack's dependency health. Highlight the biggest risk. End with the single most impactful action.

Stack: ${totalPackages} packages total — ${critical} critical, ${atRisk} at-risk, ${watch} watch, ${healthy} healthy
Average SPS: ${avgSps ?? 'N/A'}/100
Biggest declines: ${decliningStr}
Biggest improvements: ${improvingStr}
Weak signals (avg <50): ${weakSignals || 'none'}

Rules: Be direct. Executive tone. No markdown. Under 80 words.`

    const insight = await generateInsight(prompt)
    return NextResponse.json({ insight })
  } catch (err) {
    console.error('[ai/stack-insight]', err)
    return NextResponse.json({ error: 'AI insight unavailable' }, { status: 503 })
  }
}
