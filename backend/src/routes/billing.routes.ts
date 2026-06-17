import { Router } from 'express'
import { Plan, PlanStatus } from '@prisma/client'
import { prisma } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import {
  createOrder,
  createSubscription,
  mapRazorpayError,
  verifyPaymentSignature,
} from '../services/razorpay.service'
import { PRO_PLAN_AMOUNT_PAISE } from '../lib/billing.constants'
import { getPlanLimits } from '../lib/planLimits'
import { trimSelectedReposForUser } from '../services/selectedReposTrim.service'
import { AppError } from '../middleware/error.middleware'

export const billingRouter = Router()

billingRouter.get('/plan', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        plan: true,
        planStatus: true,
        razorpayCustomerId: true,
        repoLimit: true,
        packageLimit: true,
        email: true,
        fullName: true,
      },
    })
    if (!user) throw new AppError(404, 'User not found')
    const limits = getPlanLimits(user.plan)
    res.json({
      plan: user.plan,
      planStatus: user.planStatus,
      razorpayCustomerId: user.razorpayCustomerId,
      repoLimit: limits.repoLimit,
      packageLimit: limits.packageLimit,
      email: user.email,
      fullName: user.fullName,
      proAmountPaise: PRO_PLAN_AMOUNT_PAISE,
    })
  } catch (err) {
    next(err)
  }
})

billingRouter.post('/create-order', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { amount } = req.body as { amount?: number }
    const amountPaise =
      typeof amount === 'number' && Number.isFinite(amount) ? Math.round(amount) : PRO_PLAN_AMOUNT_PAISE

    if (amountPaise < 100) {
      throw new AppError(400, 'Amount must be at least 100 paise')
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { plan: true },
    })
    if (!user) throw new AppError(404, 'User not found')
    if (user.plan === Plan.pro) {
      throw new AppError(400, 'You are already on the Pro plan')
    }

    const receipt = `pro_${req.user!.userId}_${Date.now()}`.slice(0, 40)

    try {
      const order = await createOrder(amountPaise, receipt)
      res.json(order)
    } catch (err) {
      const mapped = mapRazorpayError(err)
      throw new AppError(mapped.status, mapped.message)
    }
  } catch (err) {
    next(err)
  }
})

billingRouter.post('/verify-payment', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
      razorpay_order_id?: string
      razorpay_payment_id?: string
      razorpay_signature?: string
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError(400, 'Missing payment verification fields')
    }

    const valid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!valid) {
      throw new AppError(400, 'Payment signature verification failed')
    }

    const limits = getPlanLimits(Plan.pro)
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        plan: Plan.pro,
        planStatus: PlanStatus.active,
        repoLimit: limits.repoLimit,
        packageLimit: limits.packageLimit,
      },
      select: { plan: true, planStatus: true, repoLimit: true, packageLimit: true },
    })

    res.json({
      success: true,
      plan: user.plan,
      planStatus: user.planStatus,
      repoLimit: limits.repoLimit,
      packageLimit: limits.packageLimit,
    })
  } catch (err) {
    next(err)
  }
})

billingRouter.post('/cancel', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { plan: true },
    })
    if (!user) throw new AppError(404, 'User not found')
    if (user.plan !== Plan.pro) {
      throw new AppError(400, 'You are not on a paid plan')
    }

    const starterLimits = getPlanLimits(Plan.starter)
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        plan: Plan.starter,
        planStatus: PlanStatus.cancelled,
        repoLimit: starterLimits.repoLimit,
        packageLimit: starterLimits.packageLimit,
      },
    })

    await trimSelectedReposForUser(req.user!.userId, starterLimits.repoLimit)

    res.json({ success: true, plan: Plan.starter })
  } catch (err) {
    next(err)
  }
})

billingRouter.post('/subscribe', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { planId } = req.body as { planId?: string }
    if (!planId) throw new AppError(400, 'planId required')

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { razorpayCustomerId: true },
    })
    if (!user?.razorpayCustomerId) {
      throw new AppError(400, 'Razorpay customer not configured')
    }

    const subscription = await createSubscription(user.razorpayCustomerId, planId)
    res.json({ subscription })
  } catch (err) {
    next(err)
  }
})
