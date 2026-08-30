import { Router } from 'express'
import { prisma } from '../db/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import type { Finding } from '../engine'
import type { Prisma } from '@prisma/client'

export const agentActivityRouter = Router()

const VALID_TRIGGERS = new Set(['cli', 'mcp', 'extension', 'github_oauth'])

/**
 * Sync contract for local scans (CLI/MCP/extension). Only finding metadata is
 * ever transmitted — never raw source code — matching the local-first design:
 * scanning always happens on the user's machine via scan_code()/scan_infra().
 */
agentActivityRouter.post('/scans', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { repo_id, findings, scan_type, triggered_by } = req.body as {
      repo_id?: string
      findings?: Finding[]
      scan_type?: string
      triggered_by?: string
    }

    const triggeredBy = triggered_by === 'github-oauth' ? 'github_oauth' : triggered_by
    if (!triggeredBy || !VALID_TRIGGERS.has(triggeredBy)) {
      throw new AppError(400, 'triggered_by must be one of cli, mcp, extension, github-oauth')
    }
    if (!Array.isArray(findings)) {
      throw new AppError(400, 'findings must be an array')
    }

    const userId = req.user!.userId

    const rows: Prisma.AgentEventCreateManyInput[] = findings.map((f) => ({
      userId,
      repoId: repo_id ?? null,
      triggeredBy: triggeredBy as Prisma.AgentEventCreateManyInput['triggeredBy'],
      eventType: 'finding',
      scanType: scan_type ?? null,
      severity: f.severity,
      category: f.category,
      filePath: f.file_path,
      lineRangeStart: f.line_range?.[0] ?? null,
      lineRangeEnd: f.line_range?.[1] ?? null,
      description: f.description,
      suggestedFix: f.suggested_fix,
      autoFixable: f.auto_fixable ?? false,
      status: f.status ?? 'open',
      rawFinding: f as unknown as Prisma.InputJsonValue,
      detectedAt: f.detected_at ? new Date(f.detected_at) : new Date(),
    }))

    if (rows.length > 0) {
      await prisma.agentEvent.createMany({ data: rows })
    }

    // A scan with zero findings is still a real event worth showing in the feed.
    if (rows.length === 0) {
      await prisma.agentEvent.create({
        data: {
          userId,
          repoId: repo_id ?? null,
          triggeredBy: triggeredBy as Prisma.AgentEventCreateManyInput['triggeredBy'],
          eventType: 'scan',
          scanType: scan_type ?? null,
          status: 'resolved',
        },
      })
    }

    res.status(201).json({ success: true, received: findings.length })
  } catch (err) {
    next(err)
  }
})

agentActivityRouter.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const events = await prisma.agentEvent.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { repo: { select: { name: true, fullName: true } } },
    })

    res.json({
      events: events.map((e) => ({
        id: e.id,
        triggeredBy: e.triggeredBy,
        eventType: e.eventType,
        scanType: e.scanType,
        severity: e.severity,
        category: e.category,
        filePath: e.filePath,
        lineRange: e.lineRangeStart != null ? [e.lineRangeStart, e.lineRangeEnd] : null,
        description: e.description,
        suggestedFix: e.suggestedFix,
        autoFixable: e.autoFixable,
        status: e.status,
        repoName: e.repo?.fullName ?? e.repo?.name ?? null,
        detectedAt: e.detectedAt,
        createdAt: e.createdAt,
      })),
    })
  } catch (err) {
    next(err)
  }
})

agentActivityRouter.patch('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body as { status?: string }
    if (!status || !['open', 'fixed', 'ignored', 'resolved'].includes(status)) {
      throw new AppError(400, 'status must be one of open, fixed, ignored, resolved')
    }

    const id = String(req.params.id)
    const event = await prisma.agentEvent.findUnique({ where: { id } })
    if (!event || event.userId !== req.user!.userId) {
      throw new AppError(404, 'Finding not found')
    }

    const updated = await prisma.agentEvent.update({
      where: { id },
      data: { status: status as Prisma.AgentEventUpdateInput['status'] },
    })

    res.json({ id: updated.id, status: updated.status })
  } catch (err) {
    next(err)
  }
})
