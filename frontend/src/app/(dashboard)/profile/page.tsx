'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  User,
  Shield,
  CreditCard,
  Trash2,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAppData } from '@/context/AppDataContext'
import {
  ApiError,
  fetchBillingPlan,
  type BillingPlanResponse,
  updateProfile,
  updateSelectedRepos,
} from '@/lib/api'
import { formatInr, PRO_PLAN_PRICE_INR } from '@/lib/billing'

const AVATAR_BACKGROUNDS = [
  'bg-gradient-to-tr from-dl-teal to-dl-sage-light',
  'bg-gradient-to-tr from-[#00b4db] to-[#0083b0]',
  'bg-gradient-to-tr from-[#8A2387] to-[#E94057]',
  'bg-gradient-to-tr from-[#11998e] to-[#38ef7d]',
  'bg-gradient-to-tr from-[#FF512F] to-[#DD2476]',
]

function planLabel(plan: string): string {
  return plan === 'pro' ? 'Pro' : 'Starter'
}

function planPrice(plan: string): string {
  return plan === 'pro' ? `${formatInr(PRO_PLAN_PRICE_INR)}/month` : 'Free'
}

function displayInitials(fullName: string | null, email: string): string {
  if (fullName?.trim()) {
    return fullName
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export default function ProfilePage() {
  const { user, repos, repoLimit, loading: appLoading, refresh } = useAppData()

  const [billing, setBilling] = useState<BillingPlanResponse | null>(null)
  const [billingLoading, setBillingLoading] = useState(true)

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatarIdx, setAvatarIdx] = useState(0)
  const [personalLoading, setPersonalLoading] = useState(false)
  const [personalSuccess, setPersonalSuccess] = useState(false)
  const [personalError, setPersonalError] = useState<string | null>(null)

  const [repoRemovingId, setRepoRemovingId] = useState<string | null>(null)
  const [repoStatus, setRepoStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const loadBilling = useCallback(async () => {
    setBillingLoading(true)
    try {
      const plan = await fetchBillingPlan()
      setBilling(plan)
    } finally {
      setBillingLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBilling()
  }, [loadBilling])

  useEffect(() => {
    if (!user) return
    setName(user.fullName ?? '')
    setNickname(user.nickname ?? user.email.split('@')[0] ?? '')
    setAvatarIdx(user.avatarThemeIndex ?? 0)
  }, [user])

  const activePlan = billing?.plan ?? user?.plan ?? 'starter'
  const totalSlots = billing?.repoLimit ?? user?.repoLimit ?? repoLimit
  const utilizedSlots = repos.length
  const freeSlots = Math.max(0, totalSlots - utilizedSlots)
  const slotsPercentage = totalSlots > 0 ? Math.min(100, (utilizedSlots / totalSlots) * 100) : 0

  const avatarBg = AVATAR_BACKGROUNDS[avatarIdx] ?? AVATAR_BACKGROUNDS[0]
  const initials = useMemo(
    () => displayInitials(name || (user?.fullName ?? null), user?.email ?? ''),
    [name, user?.fullName, user?.email]
  )

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault()
    setPersonalLoading(true)
    setPersonalSuccess(false)
    setPersonalError(null)
    try {
      await updateProfile({
        fullName: name.trim(),
        nickname: nickname.trim(),
        avatarThemeIndex: avatarIdx,
      })
      await refresh()
      setPersonalSuccess(true)
      setTimeout(() => setPersonalSuccess(false), 3000)
    } catch (err) {
      setPersonalError(err instanceof ApiError ? err.message : 'Failed to save profile')
    } finally {
      setPersonalLoading(false)
    }
  }

  const handleRemoveRepo = async (id: string, repoName: string) => {
    setRepoRemovingId(id)
    setRepoStatus(null)
    try {
      const remaining = repos.filter((r) => r.id !== id).map((r) => r.id)
      await updateSelectedRepos(remaining)
      await refresh()
      setRepoStatus({
        type: 'success',
        message: `Repository "${repoName}" was removed from monitoring. Slot freed.`,
      })
      setTimeout(() => setRepoStatus(null), 4000)
    } catch (err) {
      setRepoStatus({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Failed to remove repository',
      })
    } finally {
      setRepoRemovingId(null)
    }
  }

  if (appLoading && !user) {
    return (
      <div className="app-page flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dl-teal" />
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="mb-8">
        <h1 className="page-heading text-[24px] font-semibold text-dl-forest">Profile Settings</h1>
        <p className="page-description text-dl-muted">
          Manage your personal details, repository allocations, and billing settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="dl-card flex flex-col gap-5 lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-dl-border pb-3">
            <User className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Personal Details</h2>
          </div>

          <form onSubmit={handleSavePersonal} className="flex flex-col gap-5">
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
                      onClick={() => setAvatarIdx(idx)}
                      className={`h-6 w-6 rounded-full border transition-all ${bg} ${
                        avatarIdx === idx
                          ? 'border-white scale-110 ring-2 ring-dl-teal/50'
                          : 'border-transparent hover:scale-105'
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
                  placeholder="Your name"
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
                  placeholder="dev-handle"
                  pattern="[a-zA-Z0-9._-]+"
                  title="Letters, numbers, dots, hyphens, and underscores only"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Personal Email</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email ?? ''}
                  className="dash-input w-full cursor-not-allowed opacity-70"
                  aria-describedby="email-readonly-hint"
                />
                <p id="email-readonly-hint" className="mt-1 text-[11px] text-dl-hint">
                  Email is tied to your login and billing account.
                </p>
              </div>
            </div>

            {personalError && (
              <p className="text-xs text-dl-critical">{personalError}</p>
            )}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={personalLoading}
                className="btn-dash-primary flex w-fit items-center gap-2"
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

        <div className="dl-card flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-dl-border pb-3">
            <CreditCard className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Billing Info</h2>
          </div>

          {billingLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-dl-teal" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-dl-muted">
                Current Plan Details
              </div>

              <div className="flex items-center justify-between rounded-lg border border-dl-m-border bg-dl-cream/5 px-4 py-3">
                <div>
                  <div className="text-xs text-dl-muted">Subscription Plan</div>
                  <div className="text-sm font-semibold text-dl-forest">{planLabel(activePlan)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-dl-muted">Billing Period Price</div>
                  <div className="text-sm font-semibold text-dl-forest">{planPrice(activePlan)}</div>
                </div>
              </div>

              <div className="rounded-lg border border-dl-border bg-dl-card/50 px-4 py-3 text-[12px] leading-relaxed text-dl-muted">
                {activePlan === 'pro' ? (
                  <>
                    Your Pro subscription is active. Payments are handled securely through Razorpay.
                  </>
                ) : (
                  <>
                    You are on the free Starter plan. Upgrade to Pro for more repos and alerts.
                  </>
                )}
              </div>

              <Link href="/billing" className="btn-dash-secondary w-full text-center text-sm">
                Manage billing & upgrade
              </Link>
            </div>
          )}
        </div>

        <div className="dl-card flex flex-col gap-5 lg:col-span-3">
          <div className="flex items-center gap-3 border-b border-dl-border pb-3">
            <Shield className="h-5 w-5 text-dl-teal" />
            <h2 className="card-heading">Repository Slots Allocation</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-dl-m-border/40 bg-gradient-to-br from-[#1c3b38] via-[#243f3c] to-[#142e2b] p-5 shadow-lg text-white md:col-span-1">
              <div className="pointer-events-none absolute inset-0 bg-white/[0.02]" />
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-dl-teal/10 blur-xl" />

              <span className="relative z-10 text-xs font-semibold uppercase tracking-wider text-dl-sage-light">
                Slot Capacity
              </span>

              <div className="relative z-10 flex flex-col gap-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-white">{utilizedSlots}</span>
                  <span className="text-sm text-white/60">/ {totalSlots}</span>
                  <span className="ml-1 text-xs text-white/50">repos utilized</span>
                </div>
                <div className="text-xs text-white/70">
                  Free slots remaining:{' '}
                  <span className="font-semibold text-dl-sage-light">{freeSlots}</span>
                </div>
              </div>

              <div className="relative z-10 mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-dl-teal to-dl-sage-light transition-all duration-500 ease-out"
                  style={{ width: `${slotsPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-dl-muted">
                Active Monitored Repositories
              </span>

              {repoStatus && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-3 text-xs leading-relaxed ${
                    repoStatus.type === 'success'
                      ? 'border-dl-healthy/30 bg-dl-healthy/10 text-dl-healthy'
                      : 'border-dl-critical/30 bg-dl-critical/10 text-dl-critical'
                  }`}
                >
                  {repoStatus.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{repoStatus.message}</span>
                </div>
              )}

              {repos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dl-border bg-dl-card p-8 text-center">
                  <AlertCircle className="mb-2 h-8 w-8 text-dl-muted" />
                  <p className="text-sm font-semibold text-dl-forest">No repositories connected</p>
                  <p className="mt-1 text-xs text-dl-muted">
                    Connect repos from{' '}
                    <Link href="/repos" className="text-dl-teal hover:underline">
                      Repos
                    </Link>{' '}
                    to begin predictive scans.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      className="relative flex items-center justify-between overflow-hidden rounded-xl border border-dl-m-border/40 bg-gradient-to-br from-[#1c3b38] via-[#243f3c] to-[#142e2b] px-4 py-3.5 text-white shadow-md transition-all duration-150 hover:opacity-95"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-white/[0.02]" />
                      <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-dl-teal/5 blur-lg" />

                      <div className="relative z-10">
                        <div className="text-sm font-semibold text-white">{repo.name}</div>
                        <div className="mt-0.5 text-xs text-white/60">
                          Org: <span className="text-dl-sage-light">{repo.org}</span> · Scanned:{' '}
                          {repo.packageCount} dependencies
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={repoRemovingId === repo.id}
                        onClick={() => void handleRemoveRepo(repo.id, repo.name)}
                        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/60 transition-all duration-150 hover:bg-white/10 hover:text-dl-danger disabled:opacity-50"
                        title="Remove from monitoring"
                      >
                        {repoRemovingId === repo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
