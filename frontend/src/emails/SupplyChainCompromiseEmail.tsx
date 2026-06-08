import * as React from 'react'

export interface SupplyChainCompromiseEmailProps {
  packageName?: string
  ecosystem?: string
  compromisedVersion?: string
  remediationAction?: string
  compromiseType?: string
  detailedDescription?: string
  dashboardUrl?: string
}

export function SupplyChainCompromiseEmail({
  packageName = 'request',
  ecosystem = 'npm',
  compromisedVersion = '2.88.3',
  remediationAction = 'Immediately rollback to version 2.88.2 or remove this dependency from your manifests.',
  compromiseType = 'Suspicious release location & credentials',
  detailedDescription = 'A patch release was deployed from an IP address with no previous correlation to requesting maintainers. Code inspection indicates an unauthorized payload that attempts to exfiltrate environmental credentials during post-installation.',
  dashboardUrl = 'https://driftlogg.com/packages/request',
}: SupplyChainCompromiseEmailProps) {
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
          border: '2px solid #C03030', // Urgent red border
          overflow: 'hidden',
          boxShadow: '0 6px 16px rgba(192, 48, 48, 0.08)',
        }}
      >
        {/* Header Section */}
        <tr>
          <td
            style={{
              backgroundColor: '#C03030', // Critical Red
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: '600',
                letterSpacing: '0.1em',
              }}
            >
              DRIFTLOGG SECURITY
            </span>
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '24px',
                fontWeight: '600',
                marginTop: '12px',
              }}
            >
              Supply Chain Compromise Alert
            </div>
          </td>
        </tr>

        {/* Content Section */}
        <tr>
          <td style={{ padding: '32px' }}>
            <div
              style={{
                backgroundColor: '#C03030',
                color: '#FFFFFF',
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                marginBottom: '20px',
              }}
            >
              IMMEDIATE Remediations REQUIRED
            </div>

            <p
              style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#2A5C52',
                margin: '0 0 24px 0',
                fontWeight: '500',
              }}
            >
              DriftLogg has detected a high-probability supply chain compromise targeting one of your active repositories. Urgent developer action is recommended.
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
                <td style={{ padding: '20px' }}>
                  <table width="100%">
                    <tr>
                      <td style={{ paddingBottom: '12px' }} colSpan={2}>
                        <span style={{ fontSize: '11px', color: '#457056', textTransform: 'uppercase', fontWeight: '600' }}>
                          Target Package
                        </span>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1C3B38', marginTop: '2px' }}>
                          {packageName}
                          <span style={{ fontSize: '13px', fontWeight: '400', color: '#457056', marginLeft: '6px' }}>
                            ({ecosystem})
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%">
                        <span style={{ fontSize: '11px', color: '#457056', textTransform: 'uppercase', fontWeight: '600' }}>
                          Detected Version
                        </span>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#C03030', marginTop: '2px', fontFamily: 'monospace' }}>
                          {compromisedVersion}
                        </div>
                      </td>
                      <td width="50%">
                        <span style={{ fontSize: '11px', color: '#457056', textTransform: 'uppercase', fontWeight: '600' }}>
                          Risk Category
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1C3B38', marginTop: '2px' }}>
                          {compromiseType}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            {/* Compromise Details */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#1C3B38', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                COMPROMISE ANALYSIS
              </div>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#2A5C52',
                  margin: '0',
                  padding: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #D4E0C8',
                  borderRadius: '6px',
                }}
              >
                {detailedDescription}
              </p>
            </div>

            {/* Recommended Remediation Action */}
            <div
              style={{
                marginBottom: '28px',
                backgroundColor: 'rgba(192, 48, 48, 0.08)',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '4px solid #C03030',
              }}
            >
              <div style={{ fontSize: '12px', color: '#C03030', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
                RECOMMENDEDRemediation ACTION:
              </div>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#1C3B38',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                {remediationAction}
              </p>
            </div>

            {/* Action Button */}
            <table align="center" border={0} cellPadding="0" cellSpacing="0" style={{ margin: '30px auto' }}>
              <tr>
                <td align="center" style={{ borderRadius: '8px', backgroundColor: '#C03030' }}>
                  <a
                    href={dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '12px 28px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      borderRadius: '8px',
                    }}
                  >
                    Investigate in DriftLogg
                  </a>
                </td>
              </tr>
            </table>

            <hr style={{ border: 'none', borderTop: '1px solid #D4E0C8', margin: '24px 0' }} />

            <p style={{ fontSize: '11px', color: '#457056', margin: '0', textAlign: 'center', lineHeight: '1.5' }}>
              This is an automated high-priority security notification sent by the DriftLogg Threat Detection module. You cannot opt-out of immediate critical security alerts.
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
              © 2026 DriftLogg Security. All rights reserved.
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
