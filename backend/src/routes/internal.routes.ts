import { Router } from 'express'
import { incrementScanScored } from '../services/alert.service'
import { AppError } from '../middleware/error.middleware'

export const internalRouter = Router()

function verifyInternalSecret(req: { headers: Record<string, string | string[] | undefined> }) {
  const secret = process.env.INTERNAL_WEBHOOK_SECRET
  const header = req.headers['x-internal-secret']
  if (!secret || header !== secret) {
    throw new AppError(401, 'Unauthorized')
  }
}

internalRouter.post('/score-complete', async (req, res, next) => {
  try {
    verifyInternalSecret(req)

    const {
      package_id,
      installation_id,
      new_sps,
      tier,
      prev_sps,
      prev_tier,
      prediction_reason,
      recommendations,
      signals,
    } = req.body as {
      package_id: string
      installation_id: string
      new_sps: number
      tier: string
      prev_sps?: number | null
      prev_tier?: string | null
      prediction_reason?: string
      recommendations?: unknown
      signals?: Record<string, number>
    }

    if (!package_id || !installation_id || new_sps === undefined || !tier) {
      throw new AppError(400, 'Missing required fields')
    }

    await incrementScanScored(
      installation_id,
      package_id,
      new_sps,
      tier,
      prev_sps ?? null,
      prev_tier ?? null,
      prediction_reason ?? 'Score updated by intelligence service',
      signals ?? {}
    )

    void recommendations

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
