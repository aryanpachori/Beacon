// ─── Shared design tokens ────────────────────────────────────────────────────
const C = {
  bg:           '#f4f6f9',
  card:         '#ffffff',
  border:       '#e2e8f0',
  primary:      '#0f172a',
  accent:       '#6366f1',
  accentDark:   '#4f46e5',
  accentLight:  '#eef2ff',
  text:         '#0f172a',
  muted:        '#64748b',
  subtle:       '#94a3b8',
  success:      '#16a34a',
  successLight: '#f0fdf4',
  warning:      '#d97706',
  warningLight: '#fffbeb',
  danger:       '#dc2626',
  dangerLight:  '#fef2f2',
  info:         '#0284c7',
  infoLight:    '#f0f9ff',
}

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; label: string; emoji: string }> = {
  critical: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', label: 'Critical',  emoji: '🔴' },
  at_risk:  { bg: '#fffbeb', text: '#d97706', border: '#fcd34d', label: 'At Risk',   emoji: '🟠' },
  watch:    { bg: '#fefce8', text: '#ca8a04', border: '#fde68a', label: 'Watch',     emoji: '🟡' },
  healthy:  { bg: '#f0fdf4', text: '#16a34a', border: '#86efac', label: 'Healthy',   emoji: '🟢' },
}

function tierBadge(tier: string): string {
  const t = TIER_COLORS[tier] ?? TIER_COLORS.watch
  return `<span style="display:inline-block;padding:3px 12px;border-radius:999px;background:${t.bg};color:${t.text};border:1px solid ${t.border};font-size:12px;font-weight:700;letter-spacing:0.04em">${t.emoji} ${t.label}</span>`
}

function spsBar(sps: number): string {
  const pct = Math.max(0, Math.min(100, sps))
  const color = sps >= 70 ? C.success : sps >= 40 ? C.warning : C.danger
  return `
    <div style="background:#e2e8f0;border-radius:6px;height:8px;width:100%;margin-top:6px;overflow:hidden">
      <div style="background:linear-gradient(90deg,${color}cc,${color});border-radius:6px;height:8px;width:${pct}%;transition:width .3s"></div>
    </div>`
}

function scoreCell(label: string, value: string | number, color: string): string {
  return `<td align="center" style="padding:0 6px">
    <div style="background:${C.bg};border:1px solid ${C.border};border-radius:12px;padding:16px 10px;min-width:80px">
      <div style="font-size:28px;font-weight:800;color:${color};line-height:1">${value}</div>
      <div style="font-size:10px;color:${C.muted};margin-top:5px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">${label}</div>
    </div>
  </td>`
}

// ─── Shell ────────────────────────────────────────────────────────────────────
function shell(content: string, preheader = ''): string {
  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://beacon.forgefastlabs.com'
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>Beacon</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};min-height:100vh">
  <tr><td align="center" style="padding:36px 16px 48px">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">

      <!-- Logo header -->
      <tr><td style="padding-bottom:28px" align="center">
        <a href="${FRONTEND_URL}" style="text-decoration:none;display:inline-block">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:${C.primary};border-radius:12px;padding:10px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.18)" align="center" valign="middle">
                <img src="${FRONTEND_URL}/logo.png" alt="Beacon" width="32" height="32" style="display:inline-block;vertical-align:middle;border:0;margin-right:10px;border-radius:6px" />
                <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;vertical-align:middle;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">Beacon</span>
              </td>
            </tr>
          </table>
        </a>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:${C.card};border:1px solid ${C.border};border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
        ${content}
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:28px 0 8px;text-align:center">
        <p style="margin:0 0 4px;font-size:12px;color:${C.muted};font-weight:600">Beacon — Predictive Dependency Health</p>
        <p style="margin:0 0 4px;font-size:12px;color:${C.subtle}">Know which dependencies are becoming tomorrow's incidents.</p>
        <p style="margin:8px 0 0;font-size:11px;color:${C.subtle}">
          <a href="${FRONTEND_URL}/dashboard" style="color:${C.accent};text-decoration:none">Dashboard</a>
          &nbsp;·&nbsp;
          <a href="${FRONTEND_URL}/settings" style="color:${C.accent};text-decoration:none">Settings</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function sectionHeader(title: string, subtitle?: string, accentColor = C.accent): string {
  return `<div style="padding:32px 32px 0">
    <div style="display:inline-block;padding:3px 10px;background:${accentColor}15;border-radius:6px;margin-bottom:12px">
      <span style="font-size:11px;font-weight:700;color:${accentColor};text-transform:uppercase;letter-spacing:0.08em">Beacon Alert</span>
    </div>
    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:${C.text};letter-spacing:-0.5px;line-height:1.2">${title}</h1>
    ${subtitle ? `<p style="margin:0;font-size:13px;color:${C.muted}">${subtitle}</p>` : ''}
  </div>`
}

function divider(): string {
  return `<div style="margin:24px 32px;border-top:1px solid ${C.border}"></div>`
}

function ctaButton(href: string, label: string, color = C.accent): string {
  return `<div style="text-align:center;padding:0 32px 36px">
    <a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;letter-spacing:0.01em;box-shadow:0 2px 8px ${color}55">${label}</a>
  </div>`
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;font-size:13px;color:${C.muted};font-weight:600;border-bottom:1px solid ${C.border};white-space:nowrap;width:40%">${label}</td>
    <td style="padding:10px 0 10px 16px;font-size:13px;color:${C.text};font-weight:600;border-bottom:1px solid ${C.border}">${value}</td>
  </tr>`
}

// ─── 1 & 2. Alert Email (threshold + tier_change + recovery + supply_chain) ──
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
  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://beacon.forgefastlabs.com'
  const isRecovery    = p.alertType === 'recovery'
  const isSupplyChain = p.alertType === 'supply_chain'
  const isTierChange  = p.alertType === 'tier_change'

  const tc = TIER_COLORS[p.tier] ?? TIER_COLORS.watch
  const prevTc = p.prevTier ? (TIER_COLORS[p.prevTier] ?? TIER_COLORS.watch) : null

  const accentColor = isRecovery ? C.success : isSupplyChain ? C.danger : tc.text
  const accentBg    = isRecovery ? C.successLight : isSupplyChain ? C.dangerLight : tc.bg

  const topLabel = isSupplyChain
    ? '🚨 Security Advisory'
    : isRecovery
      ? '✅ Health Recovery'
      : isTierChange
        ? '⚠️ Tier Change'
        : '⚠️ Threshold Alert'

  const title = isSupplyChain
    ? `Security Advisory: ${p.packageName}`
    : isRecovery
      ? `${p.packageName} has recovered`
      : isTierChange
        ? `${p.packageName} tier worsened`
        : `${p.packageName} crossed risk threshold`

  const subtitle = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const subject = isSupplyChain
    ? `🚨 Security Advisory: ${p.packageName}${p.cveId ? ` (${p.cveId})` : ''}`
    : isRecovery
      ? `✅ ${p.packageName} recovered — SPS now ${p.newSps}/100`
      : `${tc.emoji} ${p.packageName} ${isTierChange ? 'tier worsened' : 'crossed threshold'} — SPS ${p.newSps}/100`

  const signalRows = p.signals
    ? Object.entries(p.signals)
        .filter(([, v]) => typeof v === 'number')
        .sort(([, a], [, b]) => a - b)
        .map(([key, val]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          const pct = Math.max(0, Math.min(100, val))
          const color = val >= 70 ? C.success : val >= 40 ? C.warning : C.danger
          const barBg = val >= 70 ? '#dcfce7' : val >= 40 ? '#fef9c3' : '#fee2e2'
          return `<tr>
            <td style="padding:9px 0;font-size:13px;color:${C.text};width:45%;border-bottom:1px solid ${C.border}">${label}</td>
            <td style="padding:9px 0 9px 12px;border-bottom:1px solid ${C.border};width:45%">
              <div style="background:${barBg};border-radius:4px;height:6px;overflow:hidden">
                <div style="background:${color};height:6px;width:${pct}%;border-radius:4px"></div>
              </div>
            </td>
            <td style="padding:9px 0 9px 10px;border-bottom:1px solid ${C.border};text-align:right;white-space:nowrap">
              <span style="font-size:13px;font-weight:700;color:${color}">${Math.round(val)}</span><span style="font-size:11px;color:${C.muted}">/100</span>
            </td>
          </tr>`
        })
        .join('')
    : ''

  const html = shell(`
    <!-- Top accent bar -->
    <div style="height:5px;background:linear-gradient(90deg,${accentColor},${accentColor}88)"></div>

    ${sectionHeader(title, subtitle, accentColor)}

    <!-- Alert type badge -->
    <div style="padding:12px 32px 0">
      <span style="display:inline-block;padding:4px 12px;background:${accentBg};border:1px solid ${accentColor}44;border-radius:6px;font-size:12px;font-weight:700;color:${accentColor}">${topLabel}</span>
    </div>

    <!-- Package card -->
    <div style="margin:20px 32px 0;background:${accentBg};border:1px solid ${accentColor}33;border-radius:12px;padding:20px 24px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top">
            <div style="font-size:22px;font-weight:800;color:${C.text};letter-spacing:-0.3px">${p.packageName}</div>
            <div style="font-size:12px;color:${C.muted};margin-top:3px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">${p.ecosystem}</div>
            <div style="margin-top:12px">${tierBadge(p.tier)}</div>
          </td>
          <td valign="top" align="right" style="padding-left:16px;white-space:nowrap">
            <div style="font-size:48px;font-weight:900;color:${accentColor};line-height:1;letter-spacing:-2px">${p.newSps}</div>
            <div style="font-size:11px;color:${C.muted};font-weight:600;text-transform:uppercase;letter-spacing:0.05em">SPS Score</div>
            ${spsBar(p.newSps)}
            ${p.prevSps !== null ? `<div style="font-size:11px;color:${C.muted};margin-top:6px">was <strong style="color:${C.text}">${p.prevSps}</strong> → now <strong style="color:${accentColor}">${p.newSps}</strong></div>` : ''}
          </td>
        </tr>
      </table>
    </div>

    ${isSupplyChain && p.cveId ? `
    <div style="margin:16px 32px 0;background:#fef2f2;border:1.5px solid #fca5a5;border-radius:10px;padding:16px 20px">
      <div style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">⚠️ Security Advisory ID</div>
      <div style="font-size:18px;font-weight:800;color:${C.text};letter-spacing:0.03em">${p.cveId}</div>
      <div style="font-size:12px;color:${C.muted};margin-top:4px">This security event overrides normal risk scoring and requires immediate attention.</div>
    </div>` : ''}

    ${prevTc ? `
    <div style="margin:16px 32px 0">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="background:${prevTc.bg};border:1px solid ${prevTc.border};border-radius:10px;padding:12px">
            <div style="font-size:10px;color:${C.muted};font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Previous Tier</div>
            <div style="font-size:14px;font-weight:700;color:${prevTc.text}">${prevTc.emoji} ${prevTc.label}</div>
          </td>
          <td align="center" style="padding:0 12px;font-size:20px;color:${C.muted}">→</td>
          <td align="center" style="background:${tc.bg};border:1.5px solid ${tc.border};border-radius:10px;padding:12px">
            <div style="font-size:10px;color:${C.muted};font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Current Tier</div>
            <div style="font-size:14px;font-weight:700;color:${tc.text}">${tc.emoji} ${tc.label}</div>
          </td>
        </tr>
      </table>
    </div>` : ''}

    <!-- Reason -->
    <div style="margin:20px 32px 0">
      <div style="font-size:11px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Analysis</div>
      <div style="font-size:14px;color:${C.text};line-height:1.7;background:${C.bg};border-radius:10px;padding:16px 18px;border:1px solid ${C.border}">${p.reason}</div>
    </div>

    ${signalRows ? `
    <div style="margin:20px 32px 0">
      <div style="font-size:11px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Signal Breakdown</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
        ${signalRows}
      </table>
    </div>` : ''}

    ${divider()}
    ${ctaButton(`${FRONTEND_URL}/packages`, 'View Full Analysis →', accentColor)}
  `, `${p.packageName} — SPS ${p.newSps}/100 · ${tc.label}`)

  return { subject, html }
}

// ─── 2. Digest Email (daily + weekly) ────────────────────────────────────────
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
  topChange?: { name: string; prevSps: number; newSps: number } | null
  newHighRisk?: number
  recovered?: number
  advisories?: number
}

export function buildDigestEmail(p: DigestEmailParams): { subject: string; html: string } {
  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://beacon.forgefastlabs.com'
  const isWeekly = p.frequency === 'weekly'
  const dateStr  = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const subject  = `Beacon ${isWeekly ? 'Weekly' : 'Daily'} Digest — ${dateStr}`

  const noIssues = p.criticalPackages.length === 0 && p.atRiskPackages.length === 0

  function packageRow(pkg: DigestPackage, idx: number): string {
    const tc = TIER_COLORS[pkg.tier] ?? TIER_COLORS.watch
    const sps = pkg.sps ?? 0
    const spsColor = sps >= 70 ? C.success : sps >= 40 ? C.warning : C.danger
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#fafafa'
    return `<tr style="background:${rowBg}">
      <td style="padding:11px 16px;font-size:13px;font-weight:700;color:${C.text};border-bottom:1px solid ${C.border}">${pkg.name}
        <div style="font-size:10px;color:${C.muted};font-weight:500;margin-top:1px;text-transform:uppercase;letter-spacing:0.05em">${pkg.ecosystem}</div>
      </td>
      <td style="padding:11px 16px;border-bottom:1px solid ${C.border};text-align:right;white-space:nowrap">
        <span style="font-size:16px;font-weight:800;color:${spsColor}">${sps}</span>
        <span style="font-size:10px;color:${C.muted};font-weight:600">/100</span>
      </td>
      <td style="padding:11px 16px;border-bottom:1px solid ${C.border};text-align:right">
        <span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${tc.bg};color:${tc.text};font-size:11px;font-weight:700;border:1px solid ${tc.border}">${tc.emoji} ${tc.label}</span>
      </td>
    </tr>`
  }

  function packageSection(title: string, emoji: string, pkgs: DigestPackage[], color: string, bg: string): string {
    if (pkgs.length === 0) return ''
    return `
    <div style="margin:0 32px 20px">
      <div style="display:flex;align-items:center;margin-bottom:10px">
        <span style="font-size:16px;margin-right:8px">${emoji}</span>
        <span style="font-size:13px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:0.06em">${title}</span>
        <span style="margin-left:8px;background:${bg};color:${color};font-size:11px;font-weight:700;padding:1px 8px;border-radius:999px">${pkgs.length}</span>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid ${C.border}">
        ${pkgs.map(packageRow).join('')}
      </table>
    </div>`
  }

  const scorecard = `
  <div style="padding:24px 32px 20px">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        ${scoreCell('Total', p.totalPackages, C.text)}
        ${scoreCell('Critical', p.criticalPackages.length, p.criticalPackages.length > 0 ? C.danger : C.muted)}
        ${scoreCell('At Risk', p.atRiskPackages.length, p.atRiskPackages.length > 0 ? C.warning : C.muted)}
        ${scoreCell('Watch', p.watchPackages.length, p.watchPackages.length > 0 ? '#ca8a04' : C.muted)}
        ${scoreCell('Healthy', p.healthyCount, C.success)}
      </tr>
    </table>
  </div>`

  const weeklyExtra = isWeekly ? `
    <div style="margin:0 32px 20px;background:${C.accentLight};border:1px solid ${C.accent}33;border-radius:12px;padding:20px 24px">
      <div style="font-size:11px;font-weight:700;color:${C.accent};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px">Weekly Summary</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${p.newHighRisk !== undefined ? infoRow('New High-Risk', `${p.newHighRisk} dependenc${p.newHighRisk === 1 ? 'y' : 'ies'}`) : ''}
        ${p.recovered !== undefined ? infoRow('Recovered', `${p.recovered} dependenc${p.recovered === 1 ? 'y' : 'ies'}`) : ''}
        ${p.advisories !== undefined ? infoRow('Security Advisories', `${p.advisories} detected`) : ''}
        ${infoRow('Repositories Covered', p.accountLogin)}
        ${infoRow('Dependencies Monitored', `${p.totalPackages.toLocaleString()}`)}
      </table>
    </div>` : ''

  const topChangeBlock = p.topChange ? `
    <div style="margin:0 32px 20px;background:${C.dangerLight};border:1px solid #fca5a544;border-radius:10px;padding:16px 20px">
      <div style="font-size:11px;font-weight:700;color:${C.danger};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Most Significant Change</div>
      <div style="font-size:15px;font-weight:700;color:${C.text}">${p.topChange.name}</div>
      <div style="font-size:13px;color:${C.muted};margin-top:4px">
        SPS dropped <strong style="color:${C.danger}">${p.topChange.prevSps} → ${p.topChange.newSps}</strong>
      </div>
    </div>` : ''

  const html = shell(`
    <div style="height:5px;background:linear-gradient(90deg,${C.accent},${C.accentDark})"></div>

    <div style="padding:32px 32px 0">
      <div style="display:inline-block;padding:3px 10px;background:${C.accentLight};border-radius:6px;margin-bottom:12px">
        <span style="font-size:11px;font-weight:700;color:${C.accent};text-transform:uppercase;letter-spacing:0.08em">${isWeekly ? '📊 Weekly' : '📋 Daily'} Digest</span>
      </div>
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:${C.text};letter-spacing:-0.5px">${isWeekly ? 'Weekly Health Report' : 'Daily Health Summary'}</h1>
      <p style="margin:0;font-size:13px;color:${C.muted}">${p.accountLogin} · ${dateStr}</p>
    </div>

    ${scorecard}
    ${divider()}
    ${weeklyExtra}

    ${noIssues
      ? `<div style="padding:40px 32px;text-align:center">
           <div style="font-size:48px;margin-bottom:12px">🎉</div>
           <div style="font-size:20px;font-weight:800;color:${C.success};margin-bottom:6px">All Clear</div>
           <div style="font-size:14px;color:${C.muted}">No critical or at-risk dependencies detected. Your stack looks healthy.</div>
         </div>`
      : `
    ${packageSection('Critical', '🔴', p.criticalPackages, C.danger, C.dangerLight)}
    ${packageSection('At Risk', '🟠', p.atRiskPackages, C.warning, C.warningLight)}
    ${packageSection('Watch', '🟡', p.watchPackages, '#ca8a04', '#fefce8')}
    `}

    ${topChangeBlock}
    ${divider()}
    ${ctaButton(`${FRONTEND_URL}/dashboard`, 'Open Dashboard →')}
  `, noIssues ? 'All packages healthy — no action needed' : `${p.criticalPackages.length} critical · ${p.atRiskPackages.length} at-risk packages need attention`)

  return { subject, html }
}

// ─── 3. Welcome Email ─────────────────────────────────────────────────────────
export function buildWelcomeEmail(email: string): { subject: string; html: string } {
  const FRONTEND_URL = process.env.FRONTEND_URL ?? 'https://beacon.forgefastlabs.com'
  const subject = 'Welcome to Beacon — your dependency watchdog is active'
  const html = shell(`
    <div style="height:5px;background:linear-gradient(90deg,${C.accent},${C.accentDark})"></div>

    <div style="padding:36px 32px 0">
      <div style="font-size:40px;margin-bottom:16px">👋</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:${C.text};letter-spacing:-0.5px">Welcome to Beacon</h1>
      <p style="margin:0;font-size:14px;color:${C.muted}">Your dependency health monitoring is now active for <strong>${email}</strong></p>
    </div>

    <div style="padding:24px 32px">
      <div style="background:${C.accentLight};border:1px solid ${C.accent}22;border-radius:12px;padding:22px 24px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;color:${C.accent};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px">What Beacon does for you</div>
        ${[
          ['📊', 'SPS Scoring', 'Every dependency scored 0–100 based on maintenance, security, and ecosystem signals'],
          ['🚨', 'Instant Alerts', 'Get notified the moment a package crosses into critical or at-risk territory'],
          ['🔮', 'Predictive Analysis', 'Know which packages will go critical 60 days before they do'],
          ['📧', 'Daily Digests', 'Morning summary of your entire dependency health landscape'],
        ].map(([emoji, title, desc]) => `
          <div style="display:flex;align-items:flex-start;margin-bottom:14px">
            <span style="font-size:20px;margin-right:12px;flex-shrink:0">${emoji}</span>
            <div>
              <div style="font-size:14px;font-weight:700;color:${C.text};margin-bottom:2px">${title}</div>
              <div style="font-size:12px;color:${C.muted};line-height:1.5">${desc}</div>
            </div>
          </div>`).join('')}
      </div>

      ${ctaButton(`${FRONTEND_URL}/dashboard`, 'Go to Dashboard →')}
    </div>
  `, 'Your Beacon account is ready — start monitoring your dependencies')
  return { subject, html }
}
