'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ApiDashboard, ApiUser } from '@/lib/adapters'
import {
  clearAuthTokens,
  fetchAlerts,
  fetchDashboard,
  fetchMe,
  fetchPackages,
  fetchRepos,
  getAccessToken,
} from '@/lib/api'
import type { Alert, Package, Repo } from '@/types'

type AppDataContextValue = {
  user: ApiUser | null
  dashboard: ApiDashboard | null
  packages: Package[]
  alerts: Alert[]
  repos: Repo[]
  repoLimit: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  signOut: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function loginPathWithRedirect(pathname: string, search: string): string {
  const returnTo = `${pathname}${search}`
  if (returnTo === '/login' || returnTo.startsWith('/login?')) return '/login'
  return `/login?redirect=${encodeURIComponent(returnTo)}`
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [dashboard, setDashboard] = useState<ApiDashboard | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [repos, setRepos] = useState<Repo[]>([])
  const [repoLimit, setRepoLimit] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    const [me, dash, pkgs, alertList, repoData] = await Promise.all([
      fetchMe(),
      fetchDashboard(),
      fetchPackages(),
      fetchAlerts(),
      fetchRepos(),
    ])
    setUser(me)
    setDashboard(dash)
    setPackages(pkgs)
    setAlerts(alertList)
    setRepos(repoData.repos)
    setRepoLimit(repoData.repoLimit)
  }, [])

  useEffect(() => {
    if (!getAccessToken()) {
      const search = searchParams.toString()
      router.replace(loginPathWithRedirect(pathname, search ? `?${search}` : ''))
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        await refresh()
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load data'
          if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
            clearAuthTokens()
            router.replace(loginPathWithRedirect(pathname, searchParams.toString() ? `?${searchParams.toString()}` : ''))
            return
          }
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pathname, refresh, router, searchParams])

  const signOut = useCallback(() => {
    clearAuthTokens()
    router.push('/login')
  }, [router])

  const value = useMemo(
    () => ({
      user,
      dashboard,
      packages,
      alerts,
      repos,
      repoLimit,
      loading,
      error,
      refresh,
      signOut,
    }),
    [user, dashboard, packages, alerts, repos, repoLimit, loading, error, refresh, signOut]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}

export function useAppDataOptional(): AppDataContextValue | null {
  return useContext(AppDataContext)
}
