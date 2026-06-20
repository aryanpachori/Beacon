export const FOUNDER_EMAILS = [
  'madolkararyan16@gmail.com',
  'aryanpachori03@gmail.com',
  'kapoorsamarth7@gmail.com',
]

export interface MailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendMail(opts: MailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')

  const toAddresses = Array.isArray(opts.to) ? opts.to : [opts.to]
  const allRecipients = [...new Set([...toAddresses, ...FOUNDER_EMAILS])]

  const from = opts.from ?? 'Beacon Alerts <alerts@beacon.forgefastlabs.com>'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: allRecipients,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend API error ${res.status}: ${body}`)
  }
}
