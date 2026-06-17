import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { webhookUrl, alert } = await req.json()

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Google Chat Webhook URL is required.' }, { status: 400 })
    }

    if (!webhookUrl.startsWith('https://chat.googleapis.com/')) {
      return NextResponse.json({ error: 'Invalid Google Chat Webhook URL format. Must start with https://chat.googleapis.com/' }, { status: 400 })
    }

    // Google Chat Card V2 Payload
    const googleChatPayload = {
      cardsV2: [
        {
          cardId: 'beacon-alert',
          card: {
            header: {
              title: `Beacon Alert: ${alert.packageName}`,
              subtitle: `${alert.tier.toUpperCase()} SPS Drop`,
              imageUrl: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/warning/default/48px.svg',
              imageType: 'CIRCLE',
            },
            sections: [
              {
                header: 'Impact Details',
                widgets: [
                  {
                    decoratedText: {
                      text: `<b>Package:</b> <code>${alert.packageName}</code>`,
                    },
                  },
                  {
                    decoratedText: {
                      text: `<b>SPS Health Drop:</b> ${alert.spsBefore} ➔ <b>${alert.spsAfter}</b>`,
                    },
                  },
                  {
                    decoratedText: {
                      text: `<b>Estimated Remediation:</b> ${alert.effortEstimate?.sprintWeeks || 1} sprint week(s)`,
                    },
                  },
                ],
              },
              {
                header: 'Detected Signals',
                widgets: [
                  {
                    decoratedText: {
                      text: alert.triggerReason || 'Suspicious release or maintainer inactivity detected.',
                    },
                  },
                ],
              },
              {
                widgets: [
                  {
                    buttonList: {
                      buttons: [
                        {
                          text: 'View Survival Breakdown',
                          onClick: {
                            openLink: {
                              url: `https://beacon.com/packages/${alert.packageId || 'moment'}`,
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleChatPayload),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Google Chat integration failed: ${text}` }, { status: res.status })
    }

    return NextResponse.json({ success: true, message: 'Google Chat alert dispatched successfully.' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
