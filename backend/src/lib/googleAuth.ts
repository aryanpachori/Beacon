import { OAuth2Client } from 'google-auth-library'
import { AppError } from '../middleware/error.middleware'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export interface GoogleProfile {
  googleId: string
  email: string
  fullName: string | null
  avatarUrl: string | null
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  let ticket
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
  } catch {
    throw new AppError(401, 'Invalid Google token')
  }

  const payload = ticket.getPayload()
  if (!payload?.sub || !payload.email) {
    throw new AppError(401, 'Invalid Google token')
  }

  return {
    googleId: payload.sub,
    email: payload.email.trim().toLowerCase(),
    fullName: payload.name ?? null,
    avatarUrl: payload.picture ?? null,
  }
}
