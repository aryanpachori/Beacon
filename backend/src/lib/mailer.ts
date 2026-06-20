import nodemailer from 'nodemailer'

// Gmail SMTP transporter — uses an app-specific password (not account password).
// Generate at: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER ?? 'kapoorsamarth7@gmail.com',
    pass: process.env.SMTP_PASS ?? '',
  },
})

// Founders always receive every alert and digest email
export const FOUNDER_EMAILS = [
  'madolkararyan16@gmail.com',
  'aryanpachori03@gmail.com',
  'kapoorsamarth7@gmail.com',
]

export interface MailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendMail(opts: MailOptions): Promise<void> {
  const toAddresses = Array.isArray(opts.to) ? opts.to : [opts.to]

  // Merge user addresses with founders, dedup
  const allRecipients = [...new Set([...toAddresses, ...FOUNDER_EMAILS])]

  await transporter.sendMail({
    from: `"Beacon" <${process.env.SMTP_USER ?? 'kapoorsamarth7@gmail.com'}>`,
    to: allRecipients.join(', '),
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo ?? process.env.SMTP_USER,
  })
}
