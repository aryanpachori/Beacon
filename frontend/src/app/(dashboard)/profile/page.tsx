'use client'

import { useState, useEffect } from 'react'
import { User, Shield, CreditCard, Trash2, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { repos as mockRepos } from '@/lib/mockData'

const PLAN_CAPACITIES: Record<string, number> = {
  'Starter': 1,
  'Pro': 5,
  'Team': 25,
  'Enterprise': 999999, // Representing unlimited
}

const PLAN_PRICES: Record<string, string> = {
  'Starter': '$0 (Free)',
  'Pro': '$49/month',
  'Team': '$199/month',
  'Enterprise': 'Custom Enterprise Contract',
}

const AVATAR_BACKGROUNDS = [
  'bg-gradient-to-tr from-dl-teal to-dl-sage-light',
  'bg-gradient-to-tr from-[#00b4db] to-[#0083b0]', // Ocean blue gradient
  'bg-gradient-to-tr from-[#8A2387] to-[#E94057]',
  'bg-gradient-to-tr from-[#11998e] to-[#38ef7d]',
  'bg-gradient-to-tr from-[#FF512F] to-[#DD2476]',
]

export default function ProfilePage() {
  // Plan state from cookie
  const [activePlan, setActivePlan] = useState('Pro')

  // Load active plan from cookie on mount
  useEffect(() => {
    const cookies = document.cookie.split('; ')
    const planCookie = cookies.find(row => row.startsWith('driftlogg_plan='))
    if (planCookie) {
      setActivePlan(planCookie.split('=')[1])
    }
  }, [])

  // Personal details state
  const [name, setName] = useState('Samarth Kapoor')
  const [email, setEmail] = useState('you@driftlogg.io')
  const [nickname, setNickname] = useState('devops-guru')
  const [avatarBg, setAvatarBg] = useState(AVATAR_BACKGROUNDS[0])
  const [personalLoading, setPersonalLoading] = useState(false)
  const [personalSuccess, setPersonalSuccess] = useState(false)

  // Repos state
  const [reposList, setReposList] = useState(mockRepos)
  const [repoStatus, setRepoStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Handlers
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault()
    setPersonalLoading(true)
    setPersonalSuccess(false)

    setTimeout(() => {
      setPersonalLoading(false)
      setPersonalSuccess(true)
      setTimeout(() => setPersonalSuccess(false), 3000)
    }, 800000 / 1000000) // ~800ms simulation
  }

  const handleRemoveRepo = (id: string, name: string) => {
    setReposList(prev => prev.filter(r => r.id !== id))
    setRepoStatus({
      type: 'success',
      message: `Repository "${name}" was disconnected successfully. Slot freed!`,
    })
    setTimeout(() => setRepoStatus(null), 3000)
  }

  // Derived limits calculations
  const totalSlots = PLAN_CAPACITIES[activePlan] || 5
  const utilizedSlots = reposList.length
  const freeSlots = totalSlots === 999999 ? 'Unlimited' : Math.max(0, totalSlots - utilizedSlots)
  const slotsPercentage = totalSlots === 999999 ? 100 : Math.min(100, (utilizedSlots / totalSlots) * 100)

  // Initials for avatar
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="app-page">
      <div className="mb-8">
        <h1 className="page-heading text-[24px] font-semibold text-dl-forest">Profile Settings</h1>
        <p className="page-description text-dl-muted">
          Manage your personal details, repository allocations, and billing settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Component 1: Personal Details */}
        <div className="dl-card flex flex-col gap-5 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-dl-border pb-3">
            <User className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Personal Details</h2>
          </div>

          <form onSubmit={handleSavePersonal} className="flex flex-col gap-5">
            {/* Avatar Selector row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[22px] font-bold text-white shadow-inner transition-all duration-300 ${avatarBg}`}
              >
                {initials || 'DL'}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-dl-muted">Avatar Theme Gradient</span>
                <div className="flex items-center gap-2">
                  {AVATAR_BACKGROUNDS.map((bg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarBg(bg)}
                      className={`h-6 w-6 rounded-full border transition-all ${bg} ${
                        avatarBg === bg ? 'border-white scale-110 ring-2 ring-dl-teal/50' : 'border-transparent hover:scale-105'
                      }`}
                      aria-label={`Select avatar theme gradient ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dash-input w-full"
                />
              </div>

              <div>
                <label className="form-label">Nickname / Handle</label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="dash-input w-full"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Personal Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dash-input w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={personalLoading}
                className="btn-dash-primary w-fit flex items-center gap-2"
              >
                {personalLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Save Personal Details
              </button>

              {personalSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-dl-healthy">
                  <CheckCircle className="h-4 w-4" />
                  <span>Changes saved successfully!</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Component 3: Billing Info */}
        <div className="dl-card flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-dl-border pb-3">
            <CreditCard className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Billing Info</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-dl-muted">
              Current Plan Details
            </div>
            
            <div className="flex items-center justify-between rounded-lg border border-dl-m-border bg-dl-cream/5 px-4 py-3">
              <div>
                <div className="text-xs text-dl-muted">Subscription Plan</div>
                <div className="text-sm font-semibold text-dl-forest">{activePlan}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-dl-muted">Billing Period Price</div>
                <div className="text-sm font-semibold text-dl-forest">{PLAN_PRICES[activePlan] || '$49/mo'}</div>
              </div>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-dl-muted mt-2">
              Payment Method Card
            </div>

            {/* Premium Credit Card Graphic */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1c3b38] via-[#243f3c] to-[#142e2b] p-5 shadow-lg border border-dl-m-border/40 text-white min-h-[160px] flex flex-col justify-between">
              {/* Glassmorphic overlay highlights */}
              <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-dl-teal/10 blur-xl" />

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-dl-sage-light">DRIFTLOGG SECURE</span>
                  <div className="text-[14px] font-semibold tracking-wide mt-1">VISA DEBIT</div>
                </div>
                <div className="flex h-7 w-9 items-center justify-center rounded bg-white/10 font-bold italic text-white/90 text-xs">
                  VISA
                </div>
              </div>

              <div className="text-lg font-medium tracking-[0.25em] font-mono my-2 text-white/90">
                •••• •••• •••• 4242
              </div>

              <div className="flex items-end justify-between text-[11px] text-white/70">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-white/50 block">Cardholder</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] uppercase tracking-wider text-white/50 block">Expires</span>
                  <span className="font-medium">12/28</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-dl-hint mt-1 leading-relaxed">
              Visa ending in 4242 will be charged automatically on the next billing date. Details encrypted under SSL AES-256.
            </div>
          </div>
        </div>

        {/* Component 2: Repo Slots and Management */}
        <div className="dl-card flex flex-col gap-5 lg:col-span-3">
          <div className="flex items-center gap-3 border-b border-dl-border pb-3">
            <Shield className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Repository Slots Allocation</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Limit breakdown metrics */}
            <div className="flex flex-col gap-3 rounded-xl border border-dl-border bg-dl-page/30 p-5 md:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-dl-muted">Slot Capacity</span>
              
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-dl-forest">{utilizedSlots}</span>
                  <span className="text-sm text-dl-muted">/ {totalSlots === 999999 ? '∞' : totalSlots}</span>
                  <span className="text-xs text-dl-muted ml-1">repos utilized</span>
                </div>
                <div className="text-xs text-dl-hint">
                  Free slots remaining: <span className="font-semibold text-dl-teal">{freeSlots}</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-dl-m-border/20 mt-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-dl-teal to-dl-sage transition-all duration-500 ease-out"
                  style={{ width: `${slotsPercentage}%` }}
                />
              </div>
            </div>

            {/* Repos lists management */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-dl-muted">Active Monitored Repositories</span>

              {repoStatus && (
                <div className="flex items-center gap-2 rounded-lg border border-dl-healthy/30 bg-dl-healthy/10 p-3 text-xs text-dl-healthy leading-relaxed">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{repoStatus.message}</span>
                </div>
              )}

              {reposList.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dl-border p-8 text-center bg-dl-card">
                  <AlertCircle className="h-8 w-8 text-dl-muted mb-2" />
                  <p className="text-sm font-semibold text-dl-forest">No repositories connected</p>
                  <p className="text-xs text-dl-muted mt-1">Connect repos to begin predictive scans.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {reposList.map(repo => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between rounded-xl border border-dl-border bg-dl-card/40 px-4 py-3.5 hover:bg-dl-card transition-all duration-150"
                    >
                      <div>
                        <div className="text-sm font-semibold text-dl-forest">{repo.name}</div>
                        <div className="text-xs text-dl-muted mt-0.5">
                          Org: {repo.org} · Scanned: {repo.packageCount} dependencies
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRepo(repo.id, repo.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-dl-muted hover:border-dl-critical/30 hover:bg-dl-critical/10 hover:text-dl-critical transition-all duration-150"
                        title="Remove repository"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
