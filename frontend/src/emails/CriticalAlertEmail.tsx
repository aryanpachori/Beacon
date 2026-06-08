import * as React from 'react'

export interface CriticalAlertEmailProps {
  packageName?: string
  ecosystem?: string
  previousSps?: number
  currentSps?: number
  triggerReason?: string
  cveId?: string
  severity?: 'critical' | 'high'
  viewUrl?: string
}

export function CriticalAlertEmail({
  packageName = 'request',
  ecosystem = 'npm',
  previousSps = 45,
  currentSps = 17,
  triggerReason = 'Maintainer account transfer to unverified user & all repository funding links removed.',
  cveId = 'CVE-2026-9812',
  viewUrl = 'https://driftlogg.com/packages/request',
}: CriticalAlertEmailProps) {
  const spsDelta = previousSps - currentSps

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
              Critical Health Drop Alert
            </div>
          </td>
        </tr>

        {/* Content Section */}
        <tr>
          <td style={{ padding: '32px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#C03030',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '99px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              CRITICAL INCIDENT
            </div>

            <p
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#2A5C52',
                margin: '0 0 24px 0',
              }}
            >
              A dependency in your stack has experienced a sudden health decline. Our XGBoost
              survival model predicts abandonment risk has increased significantly.
            </p>

            {/* Package Details Box */}
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              style={{
                backgroundColor: '#F4F8EC',
                borderRadius: '8px',
                border: '1px solid #D4E0C8',
                marginBottom: '28px',
              }}
            >
              <tr>
                <td style={{ padding: '16px 20px' }}>
                  <table width="100%">
                    <tr>
                      <td style={{ verticalAlign: 'middle' }}>
                        <span style={{ fontSize: '12px', color: '#457056', textTransform: 'uppercase', fontWeight: '500' }}>
                          Package
                        </span>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#1C3B38', marginTop: '2px' }}>
                          {packageName}
                          <span style={{ fontSize: '13px', fontWeight: '400', color: '#457056', marginLeft: '6px' }}>
                            ({ecosystem})
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                        <span style={{ fontSize: '12px', color: '#457056', textTransform: 'uppercase', fontWeight: '500' }}>
                          Current SPS
                        </span>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#C03030', marginTop: '2px' }}>
                          {currentSps}
                          <span style={{ fontSize: '13px', fontWeight: '400', color: '#457056', textDecoration: 'line-through', marginLeft: '6px' }}>
                            {previousSps}
                          </span>
                          <span style={{ fontSize: '12px', color: '#C03030', marginLeft: '8px', fontWeight: '600' }}>
                            (-{spsDelta})
                          </span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            {/* Delta and Warning details */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1C3B38', marginBottom: '6px' }}>
                DECAY SIGNALS DETECTED
              </div>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#2A5C52',
                  margin: '0',
                  paddingLeft: '12px',
                  borderLeft: '3px solid #C03030',
                }}
              >
                {triggerReason}
              </p>
            </div>

            {cveId && (
              <div style={{ marginBottom: '28px', backgroundColor: '#E05252/10', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #E05252' }}>
                <span style={{ fontSize: '12px', color: '#E05252', fontWeight: '600' }}>
                  Associated Security Vulnerability:
                </span>
                <span style={{ fontSize: '12px', color: '#2A5C52', marginLeft: '6px', fontFamily: 'monospace' }}>
                  {cveId}
                </span>
              </div>
            )}

            {/* Action Button */}
            <table align="center" border={0} cellPadding="0" cellSpacing="0" style={{ margin: '30px auto' }}>
              <tr>
                <td align="center" style={{ borderRadius: '8px', backgroundColor: '#35858E' }}>
                  <a
                    href={viewUrl}
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
                    View Survival Breakdown
                  </a>
                </td>
              </tr>
            </table>

            <hr style={{ border: 'none', borderTop: '1px solid #D4E0C8', margin: '24px 0' }} />

            <p style={{ fontSize: '12px', color: '#457056', margin: '0', textAlign: 'center' }}>
              You are receiving this immediate alert because your DriftLogg alert thresholds are configured to trigger on any package dropping into the Critical tier (SPS &lt; 20).
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
