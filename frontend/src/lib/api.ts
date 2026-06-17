import type {
  ApiAlert,
  ApiDashboard,
  ApiPackageDetail,
  ApiPackageListItem,
  ApiRepo,
  ApiUser,
} from '@/lib/adapters'
import {
  adaptAlert,
  adaptPackageDetail,
  adaptPackageListItem,
  adaptRepo,
} from '@/lib/adapters'
import type { Alert, Package, Repo } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const ACCESS_TOKEN_KEY = 'driftlogg_access_token'
const REFRESH_TOKEN_KEY = 'driftlogg_refresh_token'

export function getApiUrl(): string {
  return API_URL.replace(/\/$/, '')
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem('driftlogg_slack_url')
  localStorage.removeItem('driftlogg_google_chat_url')
  localStorage.removeItem('dl_intended_url')

  // Proactively clear any other driftlogg or session keys in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.startsWith('driftlogg_') || key === 'dl_intended_url')) {
      localStorage.removeItem(key)
      i--
    }
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!getAccessToken() && !!getRefreshToken()
}

export class ApiError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

function shouldSkipTokenRefresh(path: string): boolean {
  return (
    path.startsWith('/api/auth/login') ||
    path.startsWith('/api/auth/register') ||
    path.startsWith('/api/auth/refresh')
  )
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${getApiUrl()}${path}`, { ...options, headers })
  if (res.status === 401 && getRefreshToken() && !shouldSkipTokenRefresh(path)) {
    try {
      const refreshed = await fetch(`${getApiUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: getRefreshToken() }),
      })
      if (refreshed.ok) {
        const { accessToken } = (await refreshed.json()) as { accessToken: string }
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        headers.set('Authorization', `Bearer ${accessToken}`)
        const retry = await fetch(`${getApiUrl()}${path}`, { ...options, headers })
        if (!retry.ok) {
          const body = await retry.json().catch(() => ({}))
          throw new ApiError(
            (body as { error?: string }).error ?? `Request failed (${retry.status})`,
            (body as { code?: string }).code
          )
        }
        return retry.json() as Promise<T>
      }
    } catch {
      clearAuthTokens()
    }
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(
      (body as { error?: string }).error ?? `Request failed (${res.status})`,
      (body as { code?: string }).code
    )
  }
  return res.json() as Promise<T>
}

export async function fetchMe(): Promise<ApiUser> {
  return apiFetch<ApiUser>('/api/auth/me')
}

export async function updateProfile(body: {
  fullName?: string
  nickname?: string
  avatarThemeIndex?: number
}): Promise<ApiUser> {
  return apiFetch<ApiUser>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function updateSelectedRepos(repoIds: string[]): Promise<void> {
  await apiFetch('/api/repos/selected', {
    method: 'PATCH',
    body: JSON.stringify({ repos: repoIds }),
  })
}

export async function fetchDashboard(): Promise<ApiDashboard> {
  return apiFetch<ApiDashboard>('/api/dashboard')
}

export async function fetchPackages(params?: {
  tier?: string
  ecosystem?: string
}): Promise<Package[]> {
  const qs = new URLSearchParams()
  if (params?.tier) qs.set('tier', params.tier)
  if (params?.ecosystem) qs.set('ecosystem', params.ecosystem)
  const query = qs.toString()
  const data = await apiFetch<{ packages: ApiPackageListItem[] }>(
    `/api/packages${query ? `?${query}` : ''}`
  )
  return data.packages.map(adaptPackageListItem)
}

export async function fetchPackageById(id: string): Promise<Package> {
  const data = await apiFetch<ApiPackageDetail>(`/api/packages/${id}`)
  return adaptPackageDetail(data)
}

export async function fetchAlerts(limit = 50): Promise<Alert[]> {
  const data = await apiFetch<{ alerts: ApiAlert[] }>(`/api/alerts?limit=${limit}`)
  return data.alerts.map(adaptAlert)
}

export async function fetchRepos(): Promise<{
  repos: Repo[]
  repoLimit: number
  monitoredCount: number
}> {
  const data = await apiFetch<{ repos: ApiRepo[]; repoLimit: number; monitoredCount: number }>(
    '/api/repos'
  )
  return {
    repos: data.repos.map(adaptRepo),
    repoLimit: data.repoLimit,
    monitoredCount: data.monitoredCount,
  }
}

export async function triggerRepoRescan(): Promise<void> {
  await apiFetch('/api/repos/rescan', { method: 'POST' })
}

export async function fetchGithubInstallUrl(): Promise<string> {
  const origin =
    typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''
  const data = await apiFetch<{ url: string }>(
    `/api/github/install-url${origin ? `?origin=${origin}` : ''}`
  )
  return data.url
}

export async function fetchGithubOAuthUrl(): Promise<string> {
  const origin =
    typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''
  const data = await apiFetch<{ url: string }>(
    `/api/github/oauth/url${origin ? `?origin=${origin}` : ''}`
  )
  return data.url
}

export type OnboardingState = {
  connected: boolean
  accountLogin: string | null
  onboardingStep: number
  onboardingComplete: boolean
  scanStatus: ScanProgressEvent['status']
  total: number
  scanned: number
  scored: number
  selectedRepoCount: number
  selectedRepoNames: string[]
  configureUrl: string | null
  repoLimit: number
}

export async function fetchOnboardingState(): Promise<OnboardingState> {
  return apiFetch<OnboardingState>('/api/github/onboarding/state')
}

export type BillingPlanResponse = {
  plan: string
  planStatus: string
  repoLimit: number
  packageLimit: number
  email: string
  fullName: string | null
  proAmountPaise: number
  cancelAtPeriodEnd?: boolean
  proExpiresAt?: string | null
}

export async function fetchBillingPlan(): Promise<BillingPlanResponse> {
  return apiFetch<BillingPlanResponse>('/api/billing/plan')
}

export async function createBillingOrder(amountPaise: number): Promise<{
  order_id: string
  amount: number
  currency: string
}> {
  return apiFetch('/api/billing/create-order', {
    method: 'POST',
    body: JSON.stringify({ amount: amountPaise }),
  })
}

export async function verifyBillingPayment(body: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): Promise<{ success: boolean; plan: string }> {
  return apiFetch('/api/billing/verify-payment', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function cancelSubscription(): Promise<{ success: boolean; plan: string }> {
  return apiFetch('/api/billing/cancel', { method: 'POST' })
}


export type OnboardingRepo = {
  id: string
  fullName: string
  name: string
  org: string
}

export type OnboardingReposResponse = {
  repos: OnboardingRepo[]
  repoLimit: number
  selectedRepos: string[]
}

export async function fetchOnboardingRepos(): Promise<OnboardingReposResponse> {
  return apiFetch<OnboardingReposResponse>('/api/github/onboarding/repos')
}

export async function startOnboardingScan(repoIds: string[]): Promise<void> {
  await apiFetch('/api/github/start-scan', {
    method: 'POST',
    body: JSON.stringify({ repoIds }),
  })
}

export type ScanProgressEvent = {
  status: 'pending' | 'scanning' | 'scoring' | 'complete' | 'failed'
  total: number
  scanned: number
  scored: number
}

// ── Analytics ────────────────────────────────────────────────────────────────

export type AnalyticsData = {
  alertTrend:      { date: string; count: number }[]
  ecosystemDist:   { ecosystem: string; count: number }[]
  spsHistogram:    { bucket: string; min: number; max: number; count: number }[]
  signalAverages:  { signal: string; avg: number }[]
  topDeclining:    { id: string; name: string; spsDrop: number; currentSps: number; tier: string }[]
  topImproving:    { id: string; name: string; spsGain: number; currentSps: number; tier: string }[]
  alertsByType:    Record<string, number>
  weeklyAlertCount: number
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>('/api/analytics')
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

export type ActivityEvent = {
  id: string
  type: 'tier_change' | 'threshold' | 'recovery' | 'supply_chain' | string
  packageId: string
  packageName: string
  ecosystem: string
  tier: string
  spsBefore?: number
  spsAfter?: number
  aiReason?: string
  signalPills?: unknown
  primarySignal?: string
  cveId?: string
  affectedVersions?: string[]
  safeVersions?: string[]
  resolved: boolean
  firedAt: string
}

export async function fetchActivity(limit = 100): Promise<ActivityEvent[]> {
  const data = await apiFetch<{ events: ActivityEvent[] }>(`/api/activity?limit=${limit}`)
  return data.events
}

// ── Maintainers ───────────────────────────────────────────────────────────────

export type MaintainerOverview = {
  id: string
  login: string
  displayName: string
  avatarUrl?: string
  company?: string
  publicReposCount: number
  followersCount: number
  daysInactive: number
  isSponsorEnabled: boolean
  lastPushAt?: string
  packages: { id: string; name: string; tier: string | null }[]
  riskLevel: 'low' | 'medium' | 'high'
}

export async function fetchMaintainers(): Promise<MaintainerOverview[]> {
  const data = await apiFetch<{ maintainers: MaintainerOverview[] }>('/api/maintainers')
  return data.maintainers
}

// ── Package Recommendations ───────────────────────────────────────────────────

export type PackageRecommendation = {
  toPackageId: string
  name: string
  sps: number
  weeklyDownloads: number
  ecosystem: string
  reason?: string
  effortLines?: number
  effortFiles?: number
  effortWeeks?: number
  confidence: number
  isOfficial: boolean
}

export async function fetchPackageRecommendations(packageId: string): Promise<PackageRecommendation[]> {
  const data = await apiFetch<{ recommendations: PackageRecommendation[] }>(`/api/packages/${packageId}/recommendations`)
  return data.recommendations
}

export function openScanProgressStream(
  onEvent: (event: ScanProgressEvent) => void,
  onError?: () => void
): () => void {
  const token = getAccessToken()
  if (!token) {
    onError?.()
    return () => {}
  }

  const url = `${getApiUrl()}/api/github/onboarding/stream?access_token=${encodeURIComponent(token)}`
  const source = new EventSource(url)

  source.onmessage = (message) => {
    try {
      onEvent(JSON.parse(message.data) as ScanProgressEvent)
    } catch {
      onError?.()
    }
  }

  source.onerror = () => {
    onError?.()
    source.close()
  }

  return () => source.close()
}
