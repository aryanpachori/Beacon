import * as React from 'react'

export interface DailyDigestEmailProps {
  orgName?: string
  dateString?: string
  stackHealthIndex?: number
  previousHealthIndex?: number
  packagesMonitored?: number
  criticalCount?: number
  atRiskCount?: number
  watchCount?: number
  healthyCount?: number
  spsDeltas?: Array<{
    name: string
    ecosystem: string
    oldSps: number
    newSps: number
    tier: 'critical' | 'at-risk' | 'watch' | 'healthy'
  }>
  dashboardUrl?: string
}

export function DailyDigestEmail({
  orgName = 'Acme Corp',
  dateString = 'Monday, Jun 8, 2026',
  stackHealthIndex = 72,
  previousHealthIndex = 76,
  packagesMonitored = 340,
  criticalCount = 3,
  atRiskCount = 8,
  watchCount = 24,
  healthyCount = 305,
  spsDeltas = [
    { name: 'moment', ecosystem: 'npm', oldSps: 24, newSps: 11, tier: 'critical' },
    { name: 'node-sass', ecosystem: 'npm', oldSps: 41, newSps: 32, tier: 'at-risk' },
    { name: 'rxjs', ecosystem: 'npm', oldSps: 45, newSps: 38, tier: 'at-risk' },
    { name: 'lodash', ecosystem: 'npm', oldSps: 80, newSps: 84, tier: 'healthy' },
  ],
  dashboardUrl = 'https://driftlogg.com/dashboard',
}: DailyDigestEmailProps) {
  const indexDelta = stackHealthIndex - previousHealthIndex
  const indexDeltaColor = indexDelta < 0 ? '#C03030' : '#35858E'
  const indexDeltaSign = indexDelta < 0 ? `${indexDelta}` : `+${indexDelta}`

  return (
    <div
      style={{
        backgroundColor: '#F0F5E8',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px 20px',
        margin: '0',
        width: '100%',
      }}
    >
      <table
        align="center"
        border={0}
        cellPadding="0"
        cellSpacing="0"
        width="100%"
        style={{
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #D4E0C8',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(28, 59, 56, 0.04)',
        }}
      >
        {/* Header Section */}
        <tr>
          <td
            style={{
              backgroundColor: '#1C3B38',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                color: '#C2D099',
                fontSize: '18px',
                fontWeight: '600',
                letterSpacing: '0.05em',
              }}
            >
              DRIFTLOGG
            </span>
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: '500',
                marginTop: '12px',
              }}
            >
              Daily Dependency Digest
            </div>
            <div
              style={{
                color: '#457056',
                fontSize: '13px',
                marginTop: '6px',
              }}
            >
              {orgName} · {dateString}
            </div>
          </td>
        </tr>

        {/* Content Section */}
        <tr>
          <td style={{ padding: '32px' }}>
            {/* Stack Health Overview */}
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{
                backgroundColor: '#F4F8EC',
                borderRadius: '10px',
                border: '1px solid #D4E0C8',
                marginBottom: '28px',
                padding: '20px',
              }}
            >
              {/* Stack Health Score row */}
              <tr>
                <td style={{ paddingBottom: '16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#457056', fontWeight: '600', letterSpacing: '0.05em' }}>
                    Stack Health Index
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '6px' }}>
                    <span style={{ fontSize: '36px', fontWeight: '700', color: '#1C3B38' }}>
                      {stackHealthIndex}
                    </span>
                    <span style={{ fontSize: '16px', color: '#457056', marginLeft: '4px' }}>
                      /100
                    </span>
                    <span style={{ fontSize: '12px', color: '#457056', marginLeft: '12px' }}>
                      ({packagesMonitored} packages monitored)
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: indexDeltaColor, marginLeft: '12px' }}>
                      {indexDeltaSign} since yesterday
                    </span>
                  </div>
                </td>
              </tr>
              {/* Stats Grid row */}
              <tr>
                <td style={{ borderTop: '1px solid #D4E0C8', paddingTop: '16px' }}>
                  <table width="100%" cellPadding="0" cellSpacing="0">
                    <tr>
                      <td width="25%">
                        <div style={{ fontSize: '10px', color: '#9BB8A0', textTransform: 'uppercase' }}>Critical</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#C03030', marginTop: '2px' }}>{criticalCount}</div>
                      </td>
                      <td width="25%">
                        <div style={{ fontSize: '10px', color: '#9BB8A0', textTransform: 'uppercase' }}>At Risk</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#E8963A', marginTop: '2px' }}>{atRiskCount}</div>
                      </td>
                      <td width="25%">
                        <div style={{ fontSize: '10px', color: '#9BB8A0', textTransform: 'uppercase' }}>Watch</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#4A7A30', marginTop: '2px' }}>{watchCount}</div>
                      </td>
                      <td width="25%">
                        <div style={{ fontSize: '10px', color: '#9BB8A0', textTransform: 'uppercase' }}>Healthy</div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#35858E', marginTop: '2px' }}>{healthyCount}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            {/* Score Deltas List */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1C3B38', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                Key Package Deltas (Past 24 Hours)
              </div>
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
                {spsDeltas.map((delta, i) => {
                  const isDrop = delta.newSps < delta.oldSps
                  const deltaVal = delta.newSps - delta.oldSps
                  const changeText = isDrop ? `${deltaVal}` : `+${deltaVal}`
                  const changeColor = isDrop ? '#C03030' : '#35858E'
                  const tierColorMap = {
                    critical: '#C03030',
                    'at-risk': '#E8963A',
                    watch: '#4A7A30',
                    healthy: '#35858E',
                  }

                  return (
                    <tr
                      key={delta.name}
                      style={{
                        borderBottom: i === spsDeltas.length - 1 ? 'none' : '1px solid #F0F5E8',
                      }}
                    >
                      <td style={{ padding: '10px 0', verticalAlign: 'middle' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1C3B38' }}>
                          {delta.name}
                        </span>
                        <span style={{ fontSize: '11px', color: '#457056', marginLeft: '6px', fontFamily: 'monospace' }}>
                          {delta.ecosystem}
                        </span>
                      </td>
                      <td style={{ padding: '10px 0', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            color: '#FFFFFF',
                            backgroundColor: tierColorMap[delta.tier],
                            padding: '2px 8px',
                            borderRadius: '99px',
                          }}
                        >
                          {delta.tier}
                        </span>
                      </td>
                      <td style={{ padding: '10px 0', textAlign: 'right', verticalAlign: 'middle' }}>
                        <span style={{ fontSize: '13px', color: '#457056', marginRight: '8px' }}>
                          {delta.oldSps} → <strong style={{ color: '#1C3B38' }}>{delta.newSps}</strong>
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: changeColor }}>
                          ({changeText})
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </table>
            </div>

            {/* Action Button */}
            <table align="center" border={0} cellPadding="0" cellSpacing="0" style={{ margin: '30px auto' }}>
              <tr>
                <td align="center" style={{ borderRadius: '8px', backgroundColor: '#35858E' }}>
                  <a
                    href={dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '12px 28px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    Go To Org Dashboard
                  </a>
                </td>
              </tr>
            </table>

            <hr style={{ border: 'none', borderTop: '1px solid #D4E0C8', margin: '24px 0' }} />

            <p style={{ fontSize: '12px', color: '#457056', margin: '0', textAlign: 'center' }}>
              You are receiving this digest because daily summary digests are enabled for your organization profile. You can configure digest delivery settings in your repository settings panel.
            </p>
          </td>
        </tr>

        {/* Footer Section */}
        <tr>
          <td
            style={{
              backgroundColor: '#F4F8EC',
              padding: '24px 32px',
              textAlign: 'center',
              borderTop: '1px solid #D4E0C8',
            }}
          >
            <p style={{ fontSize: '11px', color: '#9BB8A0', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              © 2026 DriftLogg. All rights reserved.
            </p>
            <p style={{ fontSize: '11px', color: '#9BB8A0', margin: '0' }}>
              Predict dependency rot before it becomes a production incident.
            </p>
          </td>
        </tr>
      </table>
    </div>
  )
}
