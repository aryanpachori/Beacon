import { Router } from 'express'
import { prisma } from '../db/client'
import { sendWelcomeEmail } from '../services/digest.service'
import { AppError } from '../middleware/error.middleware'

export const publicRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

publicRouter.post('/subscribe', async (req, res, next) => {
  try {
    const { email } = req.body as { email?: string }
    if (!email || !EMAIL_RE.test(email)) {
      throw new AppError(400, 'Valid email required')
    }

    await prisma.digestSubscriber.upsert({
      where: { email },
      create: { email, subscribed: true },
      update: { subscribed: true, unsubscribedAt: null },
    })

    await sendWelcomeEmail(email)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

publicRouter.get('/unsubscribe', async (req, res, next) => {
  try {
    const token = req.query.token as string | undefined
    if (!token) throw new AppError(400, 'token required')

    const result = await prisma.digestSubscriber.updateMany({
      where: { unsubscribeToken: token },
      data: { subscribed: false, unsubscribedAt: new Date() },
    })

    if (result.count === 0) {
      throw new AppError(404, 'Invalid unsubscribe token')
    }

    res.json({ message: 'You have been unsubscribed' })
  } catch (err) {
    next(err)
  }
})
