'use client'

import { useState } from 'react'
import { Mail, ShieldAlert, Sparkles, Send, Check } from 'lucide-react'
import { CriticalAlertEmail } from '@/emails/CriticalAlertEmail'
import { DailyDigestEmail } from '@/emails/DailyDigestEmail'
import { SupplyChainCompromiseEmail } from '@/emails/SupplyChainCompromiseEmail'

type EmailType = 'critical' | 'digest' | 'compromise'

export default function EmailPreviewsPage() {
  const [selectedEmail, setSelectedEmail] = useState<EmailType>('critical')

  // State for Critical Alert Customization
  const [criticalPkg, setCriticalPkg] = useState('request')
  const [criticalCurrentSps, setCriticalCurrentSps] = useState(17)
  const [criticalPrevSps, setCriticalPrevSps] = useState(45)
  const [criticalReason, setCriticalReason] = useState(
    'Maintainer account transfer to unverified user & all repository funding links removed.'
  )

  // State for Daily Digest Customization
  const [digestOrg, setDigestOrg] = useState('Acme Corp')
  const [digestHealthIndex, setDigestHealthIndex] = useState(72)
  const [digestPrevIndex, setDigestPrevIndex] = useState(76)

  // State for Supply Chain Customization
  const [compromisePkg, setCompromisePkg] = useState('request')
  const [compromiseVersion, setCompromiseVersion] = useState('2.88.3')
  const [compromiseRemediation, setCompromiseRemediation] = useState(
    'Immediately rollback to version 2.88.2 or remove this dependency from your manifests.'
  )
  const [compromiseDetails, setCompromiseDetails] = useState(
    'A patch release was deployed from an IP address with no previous correlation to requesting maintainers. Code inspection indicates an unauthorized payload that attempts to exfiltrate environmental credentials.'
  )

  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    // Simply copy mock code structure
    navigator.clipboard.writeText(
      selectedEmail === 'critical'
        ? `import { CriticalAlertEmail } from '@/emails/CriticalAlertEmail';\nimport { Resend } from 'resend';\n\nconst resend = new Resend(process.env.RESEND_API_KEY);\n\nawait resend.emails.send({\n  from: 'security@driftlogg.com',\n  to: 'devops@company.com',\n  subject: 'Critical Health Drop Alert: ${criticalPkg}',\n  react: <CriticalAlertEmail packageName="${criticalPkg}" currentSps={${criticalCurrentSps}} previousSps={${criticalPrevSps}} />,\n});`
        : selectedEmail === 'digest'
        ? `import { DailyDigestEmail } from '@/emails/DailyDigestEmail';\nimport { Resend } from 'resend';\n\nconst resend = new Resend(process.env.RESEND_API_KEY);\n\nawait resend.emails.send({\n  from: 'digest@driftlogg.com',\n  to: 'team@company.com',\n  subject: 'DriftLogg Daily Digest - ${digestOrg}',\n  react: <DailyDigestEmail orgName="${digestOrg}" stackHealthIndex={${digestHealthIndex}} previousHealthIndex={${digestPrevIndex}} />,\n});`
        : `import { SupplyChainCompromiseEmail } from '@/emails/SupplyChainCompromiseEmail';\nimport { Resend } from 'resend';\n\nconst resend = new Resend(process.env.RESEND_API_KEY);\n\nawait resend.emails.send({\n  from: 'security@driftlogg.com',\n  to: 'devops@company.com',\n  subject: 'URGENT: Supply Chain Compromise in ${compromisePkg}',\n  react: <SupplyChainCompromiseEmail packageName="${compromisePkg}" compromisedVersion="${compromiseVersion}" />,\n});`
    )
  }

  return (
    <div className="app-page">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="page-heading text-dl-forest">Email Templates</h1>
          <p className="page-description text-dl-muted">
            Preview and configure React Email templates sent via Resend
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="btn-dash-primary flex items-center gap-2"
        >
          {copied ? <Check className="h-4 w-4 text-white" /> : <Send className="h-4 w-4" />}
          {copied ? 'Copied Code snippet!' : 'Copy Send Code'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar Controls */}
        <div className="flex flex-col gap-5">
          {/* Template Selector Card */}
          <div className="dl-card bg-dl-card">
            <span className="label-overline text-dl-sage">Select Template</span>
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={() => setSelectedEmail('critical')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedEmail === 'critical'
                    ? 'bg-dl-teal text-white font-medium'
                    : 'bg-transparent text-dl-muted border border-dl-border hover:bg-dl-cream hover:text-dl-forest'
                }`}
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                Critical Alert
              </button>

              <button
                onClick={() => setSelectedEmail('digest')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedEmail === 'digest'
                    ? 'bg-dl-teal text-white font-medium'
                    : 'bg-transparent text-dl-muted border border-dl-border hover:bg-dl-cream hover:text-dl-forest'
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                Daily Digest
              </button>

              <button
                onClick={() => setSelectedEmail('compromise')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedEmail === 'compromise'
                    ? 'bg-dl-teal text-white font-medium'
                    : 'bg-transparent text-dl-muted border border-dl-border hover:bg-dl-cream hover:text-dl-forest'
                }`}
              >
                <Mail className="h-4 w-4 shrink-0" />
                Supply Chain Compromise
              </button>
            </div>
          </div>

          {/* Customize Params Card */}
          <div className="dl-card">
            <span className="label-overline text-dl-sage">Variables</span>

            {selectedEmail === 'critical' && (
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="form-label text-xs">Package Name</label>
                  <input
                    type="text"
                    value={criticalPkg}
                    onChange={(e) => setCriticalPkg(e.target.value)}
                    className="dash-input w-full text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label text-xs">Prev SPS</label>
                    <input
                      type="number"
                      value={criticalPrevSps}
                      onChange={(e) => setCriticalPrevSps(Number(e.target.value))}
                      className="dash-input w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Current SPS</label>
                    <input
                      type="number"
                      value={criticalCurrentSps}
                      onChange={(e) => setCriticalCurrentSps(Number(e.target.value))}
                      className="dash-input w-full text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-xs">Decay Reason</label>
                  <textarea
                    value={criticalReason}
                    onChange={(e) => setCriticalReason(e.target.value)}
                    className="dash-input w-full text-sm h-20 resize-none"
                  />
                </div>
              </div>
            )}

            {selectedEmail === 'digest' && (
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="form-label text-xs">Organization</label>
                  <input
                    type="text"
                    value={digestOrg}
                    onChange={(e) => setDigestOrg(e.target.value)}
                    className="dash-input w-full text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label text-xs">Prev Index</label>
                    <input
                      type="number"
                      value={digestPrevIndex}
                      onChange={(e) => setDigestPrevIndex(Number(e.target.value))}
                      className="dash-input w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Current Index</label>
                    <input
                      type="number"
                      value={digestHealthIndex}
                      onChange={(e) => setDigestHealthIndex(Number(e.target.value))}
                      className="dash-input w-full text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedEmail === 'compromise' && (
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="form-label text-xs">Package Name</label>
                  <input
                    type="text"
                    value={compromisePkg}
                    onChange={(e) => setCompromisePkg(e.target.value)}
                    className="dash-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Detected Version</label>
                  <input
                    type="text"
                    value={compromiseVersion}
                    onChange={(e) => setCompromiseVersion(e.target.value)}
                    className="dash-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Remediation Action</label>
                  <input
                    type="text"
                    value={compromiseRemediation}
                    onChange={(e) => setCompromiseRemediation(e.target.value)}
                    className="dash-input w-full text-sm"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Threat Details</label>
                  <textarea
                    value={compromiseDetails}
                    onChange={(e) => setCompromiseDetails(e.target.value)}
                    className="dash-input w-full text-sm h-24 resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="flex flex-col rounded-xl border border-dl-border bg-dl-card shadow-sm overflow-hidden min-h-[500px]">
          <div className="flex items-center justify-between border-b border-dl-border px-5 py-3.5 bg-dl-card">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-dl-teal" />
              <span className="text-xs font-semibold text-dl-forest uppercase tracking-wider">
                DriftLogg Notification Mailbox Preview
              </span>
            </div>
            <span className="text-xs text-dl-muted">Sender: Resend Engine</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 md:p-6 bg-dl-page">
            {selectedEmail === 'critical' && (
              <CriticalAlertEmail
                packageName={criticalPkg}
                currentSps={criticalCurrentSps}
                previousSps={criticalPrevSps}
                triggerReason={criticalReason}
              />
            )}
            {selectedEmail === 'digest' && (
              <DailyDigestEmail
                orgName={digestOrg}
                stackHealthIndex={digestHealthIndex}
                previousHealthIndex={digestPrevIndex}
              />
            )}
            {selectedEmail === 'compromise' && (
              <SupplyChainCompromiseEmail
                packageName={compromisePkg}
                compromisedVersion={compromiseVersion}
                remediationAction={compromiseRemediation}
                detailedDescription={compromiseDetails}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
