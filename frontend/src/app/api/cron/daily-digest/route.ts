import { NextRequest, NextResponse } from 'next/server'
import * as React from 'react'
import { DailyDigestEmail } from '@/emails/DailyDigestEmail'
import { packages as mockPackages } from '@/lib/mockData'
import { renderEmail } from '@/lib/emailRenderer'

// Pre-defined organizations for multi-tenant simulation across timezones
interface Organization {
  id: string
  name: string
  timezone: string
  recipientEmail: string
}

const ORGANIZATIONS: Organization[] = [
  {
    id: 'acme-corp',
    name: 'Acme Corp',
    timezone: 'America/New_York', // ET (Eastern Time)
    recipientEmail: 'team@acme.com',
  },
  {
    id: 'stark-industries',
    name: 'Stark Industries',
    timezone: 'Europe/London', // BST / GMT
    recipientEmail: 'security@stark.com',
  },
  {
    id: 'wayne-enterprises',
    name: 'Wayne Enterprises',
    timezone: 'Asia/Kolkata', // IST
    recipientEmail: 'devops@wayne.com',
  },
  {
    id: 'umbrella-corp',
    name: 'Umbrella Corp',
    timezone: 'Asia/Tokyo', // JST
    recipientEmail: 'admin@umbrella.com',
  },
]

// Get local hour in a specific timezone
function getHourInTimezone(timezone: string, baseTime: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    })
    return parseInt(formatter.format(baseTime), 10)
  } catch (error) {
    console.error(`Error formatting timezone ${timezone}:`, error)
    return baseTime.getUTCHours() // Fallback to UTC
  }
}

// Compile stats and aggregate delta score changes for an organization
function compileDigestForOrg(org: Organization) {
  // Map/filter packages dynamically.
  // For 'acme-corp', use the mock data packages directly.
  // For other orgs, dynamically translate repo names and slightly adjust scores for realistic variation.
  const orgPackages = mockPackages.map(p => {
    if (org.id === 'acme-corp') {
      return p
    }

    // Hash-based deterministic SPS offset for variation
    const sSeed = p.name.length + org.name.length
    const spsOffset = (sSeed % 9) - 4 // -4 to +4 SPS variance
    const adjustedSps = Math.max(5, Math.min(100, p.sps + spsOffset))
    
    // Vary the spsHistory accordingly
    const adjustedHistory = p.spsHistory.map(h => Math.max(5, Math.min(100, h + spsOffset)))

    // Determine tier based on varied SPS
    let tier: 'critical' | 'at-risk' | 'watch' | 'healthy' = 'healthy'
    if (adjustedSps < 20) tier = 'critical'
    else if (adjustedSps < 50) tier = 'at-risk'
    else if (adjustedSps < 80) tier = 'watch'

    return {
      ...p,
      repoName: p.repoName.replace('acme-corp', org.id),
      sps: adjustedSps,
      spsHistory: adjustedHistory,
      tier,
    }
  })

  // Calculations for Stack Health Indices
  const totalSps = orgPackages.reduce((sum, p) => sum + p.sps, 0)
  const stackHealthIndex = Math.round(totalSps / orgPackages.length)

  const yesterdayTotalSps = orgPackages.reduce(
    (sum, p) => sum + (p.spsHistory[p.spsHistory.length - 2] ?? p.sps),
    0
  )
  const previousHealthIndex = Math.round(yesterdayTotalSps / orgPackages.length)

  // Aggregate package counts by tier
  let criticalCount = 0
  let atRiskCount = 0
  let watchCount = 0
  let healthyCount = 0

  orgPackages.forEach(p => {
    if (p.tier === 'critical') criticalCount++
    else if (p.tier === 'at-risk') atRiskCount++
    else if (p.tier === 'watch') watchCount++
    else if (p.tier === 'healthy') healthyCount++
  })

  // Calculate score delta changes (today vs yesterday)
  const spsDeltas = orgPackages
    .map(p => {
      const oldSps = p.spsHistory[p.spsHistory.length - 2] ?? p.sps
      const newSps = p.sps
      return {
        name: p.name,
        ecosystem: p.ecosystem,
        oldSps,
        newSps,
        tier: p.tier,
      }
    })
    .filter(d => d.oldSps !== d.newSps)
    // Sort by largest drop first (worst changes at the top)
    .sort((a, b) => (a.newSps - a.oldSps) - (b.newSps - b.oldSps))

  // Date formatting for header
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return {
    orgName: org.name,
    recipientEmail: org.recipientEmail,
    dateString: todayStr,
    stackHealthIndex,
    previousHealthIndex,
    healthIndex: stackHealthIndex, // Compatibility for UI integrations check
    previousIndex: previousHealthIndex, // Compatibility for UI integrations check
    packagesMonitored: orgPackages.length * 21, // Scaled for demo purposes (like dashboard 340 packages)
    criticalCount,
    atRiskCount,
    watchCount,
    healthyCount,
    spsDeltas,
  }
}

interface CompiledDigestData {
  orgName: string
  recipientEmail: string
  dateString: string
  stackHealthIndex: number
  previousHealthIndex: number
  healthIndex?: number
  previousIndex?: number
  packagesMonitored: number
  criticalCount: number
  atRiskCount: number
  watchCount: number
  healthyCount: number
  spsDeltas: Array<{
    name: string
    ecosystem: string
    oldSps: number
    newSps: number
    tier: 'critical' | 'at-risk' | 'watch' | 'healthy'
  }>
}

// Core execution handler for a compiled digest
async function sendDigestEmail(compiledData: CompiledDigestData, apiKey?: string) {
  // Render JSX component to static HTML string
  const emailHtml = await renderEmail(
    React.createElement(DailyDigestEmail, {
      orgName: compiledData.orgName,
      dateString: compiledData.dateString,
      stackHealthIndex: compiledData.stackHealthIndex,
      previousHealthIndex: compiledData.previousHealthIndex,
      packagesMonitored: compiledData.packagesMonitored,
      criticalCount: compiledData.criticalCount,
      atRiskCount: compiledData.atRiskCount,
      watchCount: compiledData.watchCount,
      healthyCount: compiledData.healthyCount,
      spsDeltas: compiledData.spsDeltas,
      dashboardUrl: 'https://driftlogg.com/dashboard',
    })
  )

  if (!apiKey) {
    return {
      success: true,
      simulated: true,
      message: `Daily digest compiled in simulation mode. No RESEND_API_KEY found.`,
      data: compiledData,
    }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'digests@driftlogg.com',
      to: compiledData.recipientEmail,
      subject: `[DriftLogg] Daily Digest for ${compiledData.orgName}`,
      html: emailHtml,
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Resend API error: ${errorText}`)
  }

  return {
    success: true,
    simulated: false,
    message: `Daily digest sent successfully via Resend.`,
    data: {
      recipientEmail: compiledData.recipientEmail,
      orgName: compiledData.orgName,
    },
  }
}

// Handler for GET and POST requests
async function handleRequest(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    
    // Parse body or query params
    interface RequestBody {
      orgName?: string
      recipientEmail?: string
      bypassTimezone?: boolean
      targetHour?: string
      currentTime?: string
    }
    let body: RequestBody = {}
    if (req.method === 'POST') {
      body = await req.json().catch(() => ({}))
    }

    const searchParams = req.nextUrl.searchParams
    const bypassTimezone = searchParams.get('bypassTimezone') === 'true' || body.bypassTimezone === true
    const targetHourStr = searchParams.get('targetHour') || body.targetHour
    const targetHour = targetHourStr ? parseInt(targetHourStr, 10) : 8 // Default to 8am local time

    const currentTimeParam = searchParams.get('currentTime') || body.currentTime
    const baseTime = currentTimeParam ? new Date(currentTimeParam) : new Date()

    // 1. Manual dashboard test trigger (single org + custom email in body)
    if (body.orgName && body.recipientEmail) {
      const compiledData = compileDigestForOrg({
        id: 'acme-corp',
        name: body.orgName,
        timezone: 'America/New_York',
        recipientEmail: body.recipientEmail,
      })
      const result = await sendDigestEmail(compiledData, apiKey)
      return NextResponse.json(result)
    }

    // 2. Cron scheduler run (multiple timezone matching / batch send)
    const processedOrgs = []
    const skippedOrgs = []

    for (const org of ORGANIZATIONS) {
      const localHour = getHourInTimezone(org.timezone, baseTime)
      const matchesSchedule = localHour === targetHour

      if (matchesSchedule || bypassTimezone) {
        const compiledData = compileDigestForOrg(org)
        const result = await sendDigestEmail(compiledData, apiKey)
        processedOrgs.push({
          org: org.id,
          name: org.name,
          timezone: org.timezone,
          localTime: `${localHour}:00`,
          ...result,
        })
      } else {
        skippedOrgs.push({
          org: org.id,
          name: org.name,
          timezone: org.timezone,
          localTime: `${localHour}:00`,
          reason: `Local hour ${localHour}:00 does not match target hour ${targetHour}:00`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      cronRun: true,
      timestamp: baseTime.toISOString(),
      targetHour: `${targetHour}:00`,
      summary: {
        totalOrganizationsChecked: ORGANIZATIONS.length,
        processed: processedOrgs.length,
        skipped: skippedOrgs.length,
      },
      processed: processedOrgs,
      skipped: skippedOrgs,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req)
}

export async function POST(req: NextRequest) {
  return handleRequest(req)
}
