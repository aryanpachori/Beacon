import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../db/client'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { createRazorpayCustomer } from '../services/razorpay.service'
import { AppError } from '../middleware/error.middleware'
import { getPlanLimits } from '../lib/planLimits'
import { Plan } from '@prisma/client'

export const authRouter = Router()

const SALT_ROUNDS = 12

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function refreshExpiresAt(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d
}

async function storeRefreshToken(userId: string, refreshToken: string) {
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshExpiresAt(),
    },
  })
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, fullName, nickname } = req.body as {
      email?: string
      password?: string
      fullName?: string
      nickname?: string
    }

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required')
    }
    if (password.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters')
    }

    const normalizedEmail = normalizeEmail(email)
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      throw new AppError(409, 'An account with this email already exists. Sign in instead.', 'EMAIL_EXISTS')
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const razorpayCustomerId = await createRazorpayCustomer({ email: normalizedEmail, fullName })

    const starterLimits = getPlanLimits(Plan.starter)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName: fullName?.trim() || null,
        nickname: nickname?.trim() || null,
        razorpayCustomerId,
        repoLimit: starterLimits.repoLimit,
        packageLimit: starterLimits.packageLimit,
      },
      select: { id: true, email: true, plan: true, onboardingStep: true },
    })

    const payload = { userId: user.id, email: user.email }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    await storeRefreshToken(user.id, refreshToken)

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        onboardingStep: user.onboardingStep,
      },
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required')
    }

    const normalizedEmail = normalizeEmail(email)
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        plan: true,
        passwordHash: true,
        onboardingStep: true,
      },
    })
    // Legacy accounts may have mixed-case emails stored before normalization
    if (!user) {
      user = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
        select: {
          id: true,
          email: true,
          plan: true,
          passwordHash: true,
          onboardingStep: true,
        },
      })
    }
    if (!user) {
      throw new AppError(
        404,
        'No account found with this email. Create an account to continue.',
        'USER_NOT_FOUND'
      )
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'Incorrect password. Please try again.', 'INVALID_PASSWORD')
    }

    if (user.email !== normalizedEmail) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: normalizedEmail },
      })
      user = { ...user, email: normalizedEmail }
    }

    const payload = { userId: user.id, email: user.email }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    await storeRefreshToken(user.id, refreshToken)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        onboardingStep: user.onboardingStep,
      },
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string }
    if (!refreshToken) {
      throw new AppError(400, 'Refresh token required')
    }

    const payload = verifyRefreshToken(refreshToken)
    const tokenHash = hashRefreshToken(refreshToken)

    const stored = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.userId,
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    })
    if (!stored) {
      throw new AppError(401, 'Invalid refresh token')
    }

    res.json({ accessToken: signAccessToken(payload) })
  } catch (err) {
    next(err)
  }
})

authRouter.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string }
    if (!refreshToken) {
      throw new AppError(400, 'Refresh token required')
    }

    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashRefreshToken(refreshToken) },
      data: { revokedAt: new Date() },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

const profileSelect = {
  id: true,
  email: true,
  fullName: true,
  nickname: true,
  avatarThemeIndex: true,
  plan: true,
  planStatus: true,
  onboardingStep: true,
  repoLimit: true,
} as const

function serializeUser(user: {
  id: string
  email: string
  fullName: string | null
  nickname: string | null
  avatarThemeIndex: number
  plan: Plan
  planStatus: string
  onboardingStep: number
  repoLimit: number
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    nickname: user.nickname,
    avatarThemeIndex: user.avatarThemeIndex,
    plan: user.plan,
    planStatus: user.planStatus,
    onboardingStep: user.onboardingStep,
    repoLimit: user.repoLimit,
  }
}

authRouter.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: profileSelect,
    })
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    res.json(serializeUser(user))
  } catch (err) {
    next(err)
  }
})

authRouter.patch('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { fullName, nickname, avatarThemeIndex } = req.body as {
      fullName?: string
      nickname?: string
      avatarThemeIndex?: number
    }

    const data: {
      fullName?: string | null
      nickname?: string | null
      avatarThemeIndex?: number
    } = {}

    if (fullName !== undefined) {
      const trimmed = fullName.trim()
      if (!trimmed) throw new AppError(400, 'Full name cannot be empty')
      if (trimmed.length > 120) throw new AppError(400, 'Full name is too long')
      data.fullName = trimmed
    }

    if (nickname !== undefined) {
      const trimmed = nickname.trim()
      if (!trimmed) throw new AppError(400, 'Nickname cannot be empty')
      if (trimmed.length > 40) throw new AppError(400, 'Nickname is too long')
      if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
        throw new AppError(400, 'Nickname may only contain letters, numbers, dots, hyphens, and underscores')
      }
      data.nickname = trimmed
    }

    if (avatarThemeIndex !== undefined) {
      if (!Number.isInteger(avatarThemeIndex) || avatarThemeIndex < 0 || avatarThemeIndex > 4) {
        throw new AppError(400, 'Avatar theme must be between 0 and 4')
      }
      data.avatarThemeIndex = avatarThemeIndex
    }

    if (Object.keys(data).length === 0) {
      throw new AppError(400, 'No profile fields to update')
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: profileSelect,
    })

    res.json(serializeUser(user))
  } catch (err) {
    next(err)
  }
})
