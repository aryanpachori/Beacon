import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/jwt'

export interface AuthRequest extends Request {
  user?: { userId: string; email: string }
}

export function resolveAccessToken(req: Request): string | undefined {
  const header = req.headers.authorization?.replace('Bearer ', '')
  if (header) return header

  const query = req.query.access_token
  if (typeof query === 'string') return query
  if (Array.isArray(query) && typeof query[0] === 'string') return query[0]

  return undefined
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = resolveAccessToken(req)
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
