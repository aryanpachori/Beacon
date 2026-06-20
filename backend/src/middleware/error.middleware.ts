import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

async function notifySlack(req: Request, err: Error, statusCode: number): Promise<void> {
  const webhook = process.env.ALERT_SLACK_WEBHOOK
  if (!webhook) return
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `*API Error ${statusCode}* on \`${req.method} ${req.path}\`\n\`\`\`${err.message}\`\`\``,
      }),
    })
  } catch {
    // Never let Slack failure affect the response
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) void notifySlack(req, err, err.statusCode)
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.code ? { code: err.code } : {}),
    })
  }
  console.error(err)
  void notifySlack(req, err, 500)
  return res.status(500).json({ error: 'Internal server error' })
}
