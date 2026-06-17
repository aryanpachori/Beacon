import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { domain, email, apiToken, projectKey, alert, recommendations, effortEstimate } = await req.json()

    if (!domain || !email || !apiToken || !projectKey) {
      return NextResponse.json({ error: 'Missing JIRA configuration credentials.' }, { status: 400 })
    }

    const cleanDomain = domain.replace(/\/$/, '')
    const jiraUrl = `${cleanDomain}/rest/api/3/issue`

    // Pre-filled template with package context, effort estimate, and migration recommendations for JIRA Atlassian Document Format (ADF)
    const description = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: `Dependency Rot Warning: ${alert.packageName}` }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Beacon has detected a critical decay in package ' },
            { type: 'text', text: alert.packageName, marks: [{ type: 'strong' }] },
            { type: 'text', text: '. The Survival Probability Score (SPS) fell from ' },
            { type: 'text', text: String(alert.spsBefore), marks: [{ type: 'strike' }] },
            { type: 'text', text: ' to ' },
            { type: 'text', text: String(alert.spsAfter), marks: [{ type: 'strong' }] },
            { type: 'text', text: '.' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Remediation Effort Estimates' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Estimated Migration Effort: ', marks: [{ type: 'strong' }] },
            { type: 'text', text: `${effortEstimate?.sprintWeeks || 1} sprint week(s) (${effortEstimate?.linesImpacted || 100} lines affected across ${effortEstimate?.filesAffected || 5} files).` },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Ranked Alternative Recommendations' }],
        },
        {
          type: 'bulletList',
          content: (recommendations || []).map((rec: { name: string; sps: number; weeklyDownloads: number }) => ({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: `${rec.name} `, marks: [{ type: 'strong' }] },
                  { type: 'text', text: `(SPS: ${rec.sps}, Weekly Downloads: ${rec.weeklyDownloads.toLocaleString()})` },
                ],
              },
            ],
          })),
        },
      ],
    }

    const issuePayload = {
      fields: {
        project: { key: projectKey },
        summary: `[Beacon] Migrate away from decaying package: ${alert.packageName}`,
        description,
        issuetype: { name: 'Task' },
      },
    }

    const authHeader = 'Basic ' + Buffer.from(`${email}:${apiToken}`).toString('base64')

    const res = await fetch(jiraUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(issuePayload),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `JIRA returned error: ${text}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      issueKey: data.key,
      issueUrl: `${cleanDomain}/browse/${data.key}`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
