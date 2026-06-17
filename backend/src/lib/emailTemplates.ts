// ─── Shared design tokens ────────────────────────────────────────────────────
const C = {
  bg: '#f8f9fa',
  card: '#ffffff',
  border: '#e5e7eb',
  primary: '#1a1a2e',       // deep navy
  accent: '#6366f1',        // indigo – Beacon brand
  accentLight: '#eef2ff',
  text: '#111827',
  muted: '#6b7280',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  warningLight: '#fffbeb',
  successLight: '#f0fdf4',
}

const TIER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  critical:  { bg: '#fef2f2', text: '#dc2626', label: 'Critical' },
  at_risk:   { bg: '#fffbeb', text: '#d97706', label: 'At Risk' },
  watch:     { bg: '#fefce8', text: '#ca8a04', label: 'Watch' },
  healthy:   { bg: '#f0fdf4', text: '#16a34a', label: 'Healthy' },
}

function tierBadge(tier: string): string {
  const t = TIER_COLORS[tier] ?? TIER_COLORS.watch
  return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${t.bg};color:${t.text};font-size:12px;font-weight:600;letter-spacing:0.04em">${t.label}</span>`
}

function spsBar(sps: number): string {
  const pct = Math.max(0, Math.min(100, sps))
  const color = sps >= 70 ? C.success : sps >= 40 ? C.warning : C.danger
  return `
    <div style="background:#e5e7eb;border-radius:4px;height:6px;width:100%;margin-top:4px">
      <div style="background:${color};border-radius:4px;height:6px;width:${pct}%"></div>
    </div>`
}

// ─── Shell wrapper ────────────────────────────────────────────────────────────
function shell(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Beacon</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}&nbsp;&zwnj;</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};min-height:100vh">
  <tr><td align="center" style="padding:32px 16px">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

      <!-- Header / Logo -->
      <tr><td style="padding-bottom:24px" align="center">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:${C.primary};border-radius:10px;padding:8px 14px">
              <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;font-family:Georgia,serif">◈</span>
              <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;margin-left:6px">Beacon</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:${C.card};border:1px solid ${C.border};border-radius:12px;overflow:hidden">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:24px 0 8px;text-align:center">
        <p style="margin:0;font-size:12px;color:${C.muted}">
          Beacon — Predictive Dependency Health
        </p>
        <p style="margin:6px 0 0;font-size:12px;color:${C.muted}">
          You're receiving this because alerts are enabled for your installation.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function sectionHeader(title: string, subtitle?: string): string {
  return `<div style="padding:28px 32px 0">
    <h1 style="margin:0;font-size:22px;font-weight:700;color:${C.text};letter-spacing:-0.3px">${title}</h1>
    ${subtitle ? `<p style="margin:6px 0 0;font-size:14px;color:${C.muted}">${subtitle}</p>` : ''}
  </div>`
}

function divider(): string {
  return `<div style="margin:24px 32px;border-top:1px solid ${C.border}"></div>`
}

// ─── 1. Alert Email ───────────────────────────────────────────────────────────
export interface AlertEmailParams {
  packageName: string
  ecosystem: string
  prevSps: number | null
  newSps: number
  tier: string
  prevTier: string | null
  reason: string
  alertType: 'threshold' | 'tier_change' | 'recovery' | 'supply_chain'
  cveId?: string
  packageUrl: string
  signals?: Record<string, number>
}

export function buildAlertEmail(p: AlertEmailParams): { subject: string; html: string } {
  const isRecovery = p.alertType === 'recovery'
  const isSupplyChain = p.alertType === 'supply_chain'

  const emoji = isRecovery ? '🟢' : isSupplyChain ? '🚨' : p.tier === 'critical' ? '🔴' : '🟠'
  const verb = isRecovery ? 'recovered to' : isSupplyChain ? 'security advisory —' : 'dropped to'

  const subject = isSupplyChain
    ? `🚨 Security Advisory: ${p.packageName} (${p.cveId ?? 'CVE'})`
    : `${emoji} ${p.packageName} ${verb} ${p.tier} tier`

  const accentBg = isRecovery ? C.successLight : isSupplyChain ? C.dangerLight : C.warningLight
  const accentColor = isRecovery ? C.success : isSupplyChain ? C.danger : C.warning

  const signalRows = p.signals
    ? Object.entries(p.signals)
        .filter(([, v]) => typeof v === 'number')
        .map(([key, val]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          const color = val >= 70 ? C.success : val >= 40 ? C.warning : C.danger
          return `<tr>
            <td style="padding:6px 0;font-size:13px;color:${C.muted}">${label}</td>
            <td style="padding:6px 0 6px 12px;text-align:right">
              <span style="font-size:13px;font-weight:600;color:${color}">${Math.round(val)}</span>
            </td>
          </tr>`
        })
        .join('')
    : ''

  const html = shell(
    `${sectionHeader(`${emoji} Package Health Alert`, new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}

    <!-- Package card -->
    <div style="margin:20px 32px;background:${accentBg};border:1px solid ${accentColor}33;border-radius:10px;padding:20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div>
          <div style="font-size:18px;font-weight:700;color:${C.text}">${p.packageName}</div>
          <div style="font-size:12px;color:${C.muted};margin-top:2px;text-transform:uppercase;letter-spacing:0.05em">${p.ecosystem}</div>
        </div>
        <div style="text-align:right;margin-left:16px">
          ${tierBadge(p.tier)}
        </div>
      </div>

      <!-- SPS score -->
      <div style="margin-top:16px;background:#fff;border-radius:8px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;font-weight:600;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em">SPS Score</span>
          <span style="font-size:24px;font-weight:800;color:${accentColor}">${p.newSps}</span>
        </div>
        ${spsBar(p.newSps)}
        ${p.prevSps !== null ? `<div style="margin-top:8px;font-size:12px;color:${C.muted}">Previously: <strong>${p.prevSps}</strong> → Now: <strong>${p.newSps}</strong></div>` : ''}
      </div>
    </div>

    ${p.cveId ? `
    <div style="margin:0 32px 20px;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px">
      <div style="font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Security Advisory</div>
      <div style="font-size:14px;font-weight:600;color:${C.text}">${p.cveId}</div>
    </div>` : ''}

    <!-- Why section -->
    <div style="padding:0 32px 20px">
      <div style="font-size:12px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Why this alert</div>
      <div style="font-size:14px;color:${C.text};line-height:1.6;background:${C.bg};border-radius:8px;padding:14px">${p.reason}</div>
    </div>

    ${signalRows ? `
    <div style="padding:0 32px 24px">
      <div style="font-size:12px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Signal breakdown</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
        ${signalRows}
      </table>
    </div>` : ''}

    ${divider()}

    <!-- CTA -->
    <div style="padding:0 32px 32px;text-align:center">
      <a href="${p.packageUrl}" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px">View Package →</a>
    </div>`,
    `${p.packageName} health alert — SPS ${p.newSps}`
  )

  return { subject, html }
}

// ─── 2. Digest Email ──────────────────────────────────────────────────────────
export interface DigestPackage {
  name: string
  ecosystem: string
  sps: number | null
  tier: string
}

export interface DigestEmailParams {
  frequency: 'daily' | 'weekly'
  accountLogin: string
  criticalPackages: DigestPackage[]
  atRiskPackages: DigestPackage[]
  watchPackages: DigestPackage[]
  healthyCount: number
  totalPackages: number
  dashboardUrl: string
}

export function buildDigestEmail(p: DigestEmailParams): { subject: string; html: string } {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const subject = `Beacon ${p.frequency === 'weekly' ? 'Weekly' : 'Daily'} Digest — ${dateStr}`

  function packageRow(pkg: DigestPackage): string {
    const tc = TIER_COLORS[pkg.tier] ?? TIER_COLORS.watch
    const sps = pkg.sps ?? 0
    const spsColor = sps >= 70 ? C.success : sps >= 40 ? C.warning : C.danger
    return `<tr>
      <td style="padding:12px 0;border-bottom:1px solid ${C.border}">
        <div style="font-size:14px;font-weight:600;color:${C.text}">${pkg.name}</div>
        <div style="font-size:11px;color:${C.muted};margin-top:2px;text-transform:uppercase;letter-spacing:0.05em">${pkg.ecosystem}</div>
      </td>
      <td style="padding:12px 0 12px 12px;border-bottom:1px solid ${C.border};text-align:right;white-space:nowrap">
        <span style="font-size:16px;font-weight:700;color:${spsColor}">${sps}</span>
        <span style="font-size:11px;color:${C.muted}"> sps</span>
      </td>
      <td style="padding:12px 0 12px 12px;border-bottom:1px solid ${C.border};text-align:right">
        <span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${tc.bg};color:${tc.text};font-size:11px;font-weight:600">${tc.label}</span>
      </td>
    </tr>`
  }

  function packageSection(title: string, emoji: string, pkgs: DigestPackage[], color: string): string {
    if (pkgs.length === 0) return ''
    return `
    <div style="padding:0 32px;margin-bottom:8px">
      <div style="font-size:13px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">${emoji} ${title} (${pkgs.length})</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
        ${pkgs.map(packageRow).join('')}
      </table>
    </div>`
  }

  const scorecard = `
  <div style="padding:20px 32px">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        ${[
          { label: 'Total', value: p.totalPackages, color: C.text },
          { label: 'Critical', value: p.criticalPackages.length, color: C.danger },
          { label: 'At Risk', value: p.atRiskPackages.length, color: C.warning },
          { label: 'Watch', value: p.watchPackages.length, color: '#ca8a04' },
          { label: 'Healthy', value: p.healthyCount, color: C.success },
        ].map(s => `
        <td align="center" style="padding:0 8px">
          <div style="background:${C.bg};border:1px solid ${C.border};border-radius:10px;padding:14px 8px">
            <div style="font-size:24px;font-weight:800;color:${s.color}">${s.value}</div>
            <div style="font-size:11px;color:${C.muted};margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">${s.label}</div>
          </div>
        </td>`).join('')}
      </tr>
    </table>
  </div>`

  const noIssues = p.criticalPackages.length === 0 && p.atRiskPackages.length === 0

  const html = shell(
    `${sectionHeader(
      `${p.frequency === 'weekly' ? '📊 Weekly' : '📋 Daily'} Health Digest`,
      `${p.accountLogin} · ${dateStr}`
    )}

    ${scorecard}
    ${divider()}

    ${noIssues
      ? `<div style="padding:32px;text-align:center">
           <div style="font-size:40px;margin-bottom:12px">🎉</div>
           <div style="font-size:18px;font-weight:700;color:${C.success}">All packages healthy</div>
           <div style="font-size:14px;color:${C.muted};margin-top:6px">No critical or at-risk dependencies detected.</div>
         </div>`
      : `
    ${packageSection('Critical', '🔴', p.criticalPackages, C.danger)}
    ${p.criticalPackages.length > 0 && p.atRiskPackages.length > 0 ? `<div style="height:16px"></div>` : ''}
    ${packageSection('At Risk', '🟠', p.atRiskPackages, C.warning)}
    ${p.watchPackages.length > 0 ? `<div style="height:16px"></div>` : ''}
    ${packageSection('Watch', '🟡', p.watchPackages, '#ca8a04')}
    `}

    ${divider()}
    <div style="padding:0 32px 32px;text-align:center">
      <a href="${p.dashboardUrl}" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px">Open Dashboard →</a>
    </div>`,
    `${p.criticalPackages.length > 0 ? `${p.criticalPackages.length} critical package${p.criticalPackages.length > 1 ? 's' : ''} need attention` : 'All packages healthy'}`
  )

  return { subject, html }
}

// ─── 3. Welcome Email ─────────────────────────────────────────────────────────
export function buildWelcomeEmail(email: string): { subject: string; html: string } {
  const subject = 'Welcome to Beacon — your dependency watchdog is active'
  const html = shell(
    `${sectionHeader('Welcome to Beacon 👋', 'Your dependency health monitoring is now active')}
    <div style="padding:24px 32px 32px">
      <p style="margin:0 0 16px;font-size:15px;color:${C.text};line-height:1.6">
        Beacon continuously monitors the health of your open source dependencies and alerts you before they become production incidents.
      </p>
      <div style="background:${C.accentLight};border-radius:10px;padding:20px;margin-bottom:20px">
        <div style="font-size:13px;font-weight:700;color:${C.accent};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">What Beacon does for you</div>
        ${['Scores every dependency with an SPS (Software Package Score)', 'Alerts you when a package crosses into critical or at-risk territory', 'Tracks maintainer activity and funding signals', 'Predicts which packages will go critical 60 days before they do'].map(item =>
          `<div style="display:flex;align-items:flex-start;margin-bottom:8px">
             <span style="color:${C.accent};margin-right:8px;margin-top:1px">✓</span>
             <span style="font-size:14px;color:${C.text}">${item}</span>
           </div>`
        ).join('')}
      </div>
      <div style="text-align:center">
        <a href="${process.env.FRONTEND_URL ?? 'https://beaconapp.dev'}/dashboard" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px">Go to Dashboard →</a>
      </div>
    </div>`,
    'Your Beacon account is ready'
  )
  return { subject, html }
}
