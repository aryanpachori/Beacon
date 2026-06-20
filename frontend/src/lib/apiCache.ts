/**
 * Beacon API response cache — localStorage-backed, TTL-aware.
 *
 * All cache keys are prefixed with "beacon_cache_" so they are automatically
 * swept by the existing clearAuthTokens() cleanup loop that removes every key
 * starting with "beacon_".
 */

// ── TTL constants (ms) ───────────────────────────────────────────────────────

export const CACHE_TTL = {
  /** Package list pages, filtered views */
  packages: 5 * 60 * 1000,
  /** Single-package detail */
  packageDetail: 10 * 60 * 1000,
  /** Dashboard aggregate stats */
  dashboard: 5 * 60 * 1000,
  /** Repository list + metadata */
  repos: 10 * 60 * 1000,
  /** Alert feed */
  alerts: 5 * 60 * 1000,
  /** Analytics charts */
  analytics: 5 * 60 * 1000,
  /** Activity feed */
  activity: 5 * 60 * 1000,
  /** Maintainer list */
  maintainers: 10 * 60 * 1000,
  /** Authenticated user profile */
  user: 10 * 60 * 1000,
  /** Billing plan — changes only after payment/cancel */
  billing: 10 * 60 * 1000,
} as const

export type CacheTtlKey = keyof typeof CACHE_TTL

// ── Cache key builders ────────────────────────────────────────────────────────

const CACHE_PREFIX = 'beacon_cache_'

/**
 * Stable cache key helpers. Using explicit builder functions (rather than raw
 * strings at call sites) ensures keys are always well-formed and refactor-safe.
 */
export const cacheKey = {
  user: () => `${CACHE_PREFIX}user`,

  dashboard: () => `${CACHE_PREFIX}dashboard`,

  /**
   * @param page   1-based page number (pass undefined when not paginated)
   * @param filters  arbitrary filter params, serialised deterministically
   */
  packages: (page?: number, filters?: Record<string, string>) => {
    const parts: string[] = [`${CACHE_PREFIX}packages`]
    if (page !== undefined) parts.push(`page_${page}`)
    if (filters && Object.keys(filters).length > 0) {
      // Sort keys so {tier:'critical', ecosystem:'npm'} and
      // {ecosystem:'npm', tier:'critical'} produce the same key.
      const sorted = Object.entries(filters)
        .filter(([, v]) => v !== '' && v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}_${v}`)
        .join('_')
      if (sorted) parts.push(sorted)
    }
    return parts.join('_')
  },

  packageDetail: (id: string) => `${CACHE_PREFIX}package_${id}`,

  alerts: (limit?: number, offset?: number) => {
    const parts = [`${CACHE_PREFIX}alerts`]
    if (limit !== undefined) parts.push(`limit_${limit}`)
    if (offset !== undefined && offset !== 0) parts.push(`offset_${offset}`)
    return parts.join('_')
  },

  repos: () => `${CACHE_PREFIX}repos`,

  analytics: () => `${CACHE_PREFIX}analytics`,

  activity: (limit?: number) => {
    const parts = [`${CACHE_PREFIX}activity`]
    if (limit !== undefined) parts.push(`limit_${limit}`)
    return parts.join('_')
  },

  maintainers: () => `${CACHE_PREFIX}maintainers`,

  recommendations: (packageId: string) =>
    `${CACHE_PREFIX}recommendations_${packageId}`,

  billing: () => `${CACHE_PREFIX}billing`,
} as const

// ── Internal types ────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T
  /** Unix timestamp (ms) when the entry was stored */
  timestamp: number
}

// ── Core utilities ────────────────────────────────────────────────────────────

/**
 * Retrieve a cached value.
 *
 * @returns The cached data if the entry exists and has not expired, `null`
 *          otherwise.
 */
export function getCachedData<T>(key: string, ttl: number): T | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const entry = JSON.parse(raw) as CacheEntry<T>

    if (!entry || typeof entry.timestamp !== 'number' || entry.data === undefined) {
      localStorage.removeItem(key)
      return null
    }

    const age = Date.now() - entry.timestamp
    if (age > ttl) {
      // Entry is stale — remove it eagerly so we don't leave dead weight
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch {
    // Corrupted JSON or storage quota error — remove silently
    try { localStorage.removeItem(key) } catch { /* ignore */ }
    return null
  }
}

/**
 * Persist a value to the cache.
 *
 * Swallows QuotaExceededError gracefully so cache misses never break the app.
 */
export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return

  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Storage full — try to make room by pruning expired entries first
    removeExpiredCache()
    try {
      const entry: CacheEntry<T> = { data, timestamp: Date.now() }
      localStorage.setItem(key, JSON.stringify(entry))
    } catch {
      // Still full — silently skip caching this entry
    }
  }
}

/**
 * Explicitly remove a single cache entry.
 */
export function removeCachedData(key: string): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(key) } catch { /* ignore */ }
}

/**
 * Invalidate all cache entries whose key matches the given prefix.
 *
 * Use this for targeted invalidation, e.g. after a rescan:
 * ```ts
 * invalidateCacheByPrefix(cacheKey.packages())   // clears every packages_* key
 * ```
 */
export function invalidateCacheByPrefix(prefix: string): void {
  if (typeof window === 'undefined') return
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) toRemove.push(key)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  } catch { /* ignore */ }
}

/**
 * Sweep localStorage and discard every `beacon_cache_*` entry whose TTL has
 * expired.  Should be called once on application startup to prevent
 * localStorage growing without bound.
 *
 * The function is safe to call in SSR — it returns immediately when
 * `window` is undefined.
 */
export function removeExpiredCache(): void {
  if (typeof window === 'undefined') return

  try {
    const toRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(CACHE_PREFIX)) continue

      try {
        const raw = localStorage.getItem(key)
        if (!raw) { toRemove.push(key); continue }

        const entry = JSON.parse(raw) as Partial<CacheEntry<unknown>>
        if (typeof entry?.timestamp !== 'number') {
          toRemove.push(key)
          continue
        }

        // Derive the TTL from the key name heuristically
        const ttl = ttlForKey(key)
        const age = Date.now() - entry.timestamp
        if (age > ttl) toRemove.push(key)
      } catch {
        toRemove.push(key)
      }
    }

    toRemove.forEach(k => localStorage.removeItem(k))
  } catch { /* ignore */ }
}

/**
 * Clear **all** beacon cache entries, regardless of TTL. Called on logout.
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_PREFIX)) toRemove.push(key)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  } catch { /* ignore */ }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Map a cache key back to its TTL.  We use substring matching on the key name
 * because it's a deterministic naming scheme — no need to store TTL in the
 * entry itself.
 */
function ttlForKey(key: string): number {
  if (key.includes('_package_')) return CACHE_TTL.packageDetail
  if (key.includes('_packages'))  return CACHE_TTL.packages
  if (key.includes('_dashboard')) return CACHE_TTL.dashboard
  if (key.includes('_repos'))     return CACHE_TTL.repos
  if (key.includes('_alerts'))    return CACHE_TTL.alerts
  if (key.includes('_analytics')) return CACHE_TTL.analytics
  if (key.includes('_activity'))  return CACHE_TTL.activity
  if (key.includes('_maintainers')) return CACHE_TTL.maintainers
  if (key.includes('_recommendations')) return CACHE_TTL.packageDetail
  if (key.includes('_user'))      return CACHE_TTL.user
  if (key.includes('_billing'))   return CACHE_TTL.billing
  // Unknown key — expire aggressively (5 min)
  return 5 * 60 * 1000
}
