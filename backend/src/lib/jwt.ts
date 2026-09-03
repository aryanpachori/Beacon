import jwt, { SignOptions, JwtPayload as JwtStandardPayload } from 'jsonwebtoken'

export interface JwtPayload {
  userId: string
  email: string
}

/** jwt.verify adds exp/iat — strip before re-signing with expiresIn */
export function toTokenPayload(decoded: JwtStandardPayload): JwtPayload {
  if (typeof decoded.userId !== 'string' || typeof decoded.email !== 'string') {
    throw new Error('Invalid token payload')
  }
  return { userId: decoded.userId, email: decoded.email }
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, process.env.JWT_SECRET!, options)
}

/** Long-lived token for CLI/MCP → Agent Activity sync (findings metadata only). */
export function signAgentSyncToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_AGENT_SYNC_EXPIRES_IN || '30d') as SignOptions['expiresIn'],
  }
  return jwt.sign({ ...payload, scope: 'agent_sync' }, process.env.JWT_SECRET!, options)
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as SignOptions['expiresIn'],
  }
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options)
}

export function verifyAccessToken(token: string): JwtPayload {
  return toTokenPayload(jwt.verify(token, process.env.JWT_SECRET!) as JwtStandardPayload)
}

export function verifyRefreshToken(token: string): JwtPayload {
  return toTokenPayload(
    jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtStandardPayload
  )
}
