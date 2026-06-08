import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    const body = await req.json().catch(() => ({}))
    const { orgName = 'Acme Corp', recipientEmail = 'team@company.com' } = body

    // Mock calculations for daily score delta aggregates
    const aggregatedData = {
      orgName,
      recipientEmail,
      packagesMonitored: 340,
      healthIndex: 72,
      previousIndex: 76,
      criticalCount: 3,
      atRiskCount: 8,
      watchCount: 24,
      healthyCount: 305,
      spsDeltas: [
        { name: 'moment', ecosystem: 'npm', oldSps: 24, newSps: 11, tier: 'critical' },
        { name: 'node-sass', ecosystem: 'npm', oldSps: 41, newSps: 32, tier: 'at-risk' },
        { name: 'rxjs', ecosystem: 'npm', oldSps: 45, newSps: 38, tier: 'at-risk' },
        { name: 'lodash', ecosystem: 'npm', oldSps: 80, newSps: 84, tier: 'healthy' },
      ],
    }

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'Resend API key not configured. Daily digest compiled and aggregated in simulation mode.',
        data: aggregatedData,
      })
    }

    // Dispatch batch emails using Resend REST API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'digests@driftlogg.com',
        to: recipientEmail,
        subject: `[DriftLogg] Daily Digest for ${orgName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Daily Dependency Health Digest for ${orgName}</h2>
            <p><strong>Stack Health Index:</strong> ${aggregatedData.healthIndex}/100 (-4 points change)</p>
            <p>Monitored Packages: ${aggregatedData.packagesMonitored}</p>
            <h3>Key deltas:</h3>
            <ul>
              ${aggregatedData.spsDeltas.map(d => `<li><strong>${d.name}</strong> (${d.ecosystem}): ${d.oldSps} -> ${d.newSps} (${d.tier})</li>`).join('')}
            </ul>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Resend returned error: ${text}` }, { status: res.status })
    }

    return NextResponse.json({
      success: true,
      message: 'Daily digest compiled and batch sent successfully via Resend.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
