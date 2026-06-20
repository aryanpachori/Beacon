import { Router } from 'express'
import { incrementScanScored } from '../services/alert.service'
import { AppError } from '../middleware/error.middleware'
import { prisma } from '../db/client'
import { sendOrgDigest } from '../services/digest.service'

export const internalRouter = Router()

function verifyInternalSecret(req: { headers: Record<string, string | string[] | undefined> }) {
  const secret = process.env.INTERNAL_WEBHOOK_SECRET
  const header = req.headers['x-internal-secret']
  if (!secret || header !== secret) {
    throw new AppError(401, 'Unauthorized')
  }
}

internalRouter.post('/trigger-digest', async (req, res, next) => {
  try {
    verifyInternalSecret(req)
    const installations = await prisma.githubInstallation.findMany({
      select: { id: true },
    })
    const results = await Promise.allSettled(
      installations.map(i => sendOrgDigest(i.id, { force: true }))
    )
    const sent = results.filter(r => r.status === 'fulfilled').length
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason instanceof Error ? r.reason.message : String(r.reason))
    console.log(JSON.stringify({ event: 'trigger-digest', sent, failed: errors.length, errors }))
    res.json({ success: errors.length === 0, sent, failed: errors.length, errors })
  } catch (err) {
    next(err)
  }
})

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
      is_advisory,
      cve_id,
      cisa_url,
      affected_versions,
      safe_versions,
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
      is_advisory?: boolean
      cve_id?: string
      cisa_url?: string
      affected_versions?: string[]
      safe_versions?: string[]
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
      signals ?? {},
      is_advisory,
      cve_id,
      cisa_url,
      affected_versions,
      safe_versions
    )

    void recommendations

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
