"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ApiDashboard, ApiUser } from "@/lib/adapters";
import {
  ALL_DATA_KEYS,
  type DataKey,
  fetchDataKeys,
  requiredDataKeys,
} from "@/lib/appDataRequirements";
import { clearAuthTokens, isAuthenticated } from "@/lib/api";
import type { Alert, Package, Repo } from "@/types";

type AppDataContextValue = {
  user: ApiUser | null;
  dashboard: ApiDashboard | null;
  packages: Package[];
  alerts: Alert[];
  repos: Repo[];
  repoLimit: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function loginPathWithRedirect(pathname: string, search: string): string {
  const returnTo = `${pathname}${search}`;
  if (returnTo === "/login" || returnTo.startsWith("/login?")) return "/login";
  return `/login?redirect=${encodeURIComponent(returnTo)}`;
}

function markLoaded(prev: ReadonlySet<DataKey>, keys: DataKey[]): Set<DataKey> {
  const next = new Set(prev);
  for (const key of keys) next.add(key);
  return next;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [dashboard, setDashboard] = useState<ApiDashboard | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoLimit, setRepoLimit] = useState(1);
  const [loadedKeys, setLoadedKeys] = useState<ReadonlySet<DataKey>>(
    () => new Set(),
  );
  const [error, setError] = useState<string | null>(null);

  const setters = useMemo(
    () => ({
      setUser,
      setDashboard,
      setPackages,
      setAlerts,
      setRepos,
      setRepoLimit,
    }),
    [],
  );

  const neededKeys = useMemo(() => requiredDataKeys(pathname), [pathname]);
  const loading = useMemo(
    () => neededKeys.some((key) => !loadedKeys.has(key)),
    [neededKeys, loadedKeys],
  );

  const refresh = useCallback(async () => {
    setError(null);
    await fetchDataKeys([...ALL_DATA_KEYS], setters, { force: true });
    setLoadedKeys(new Set(ALL_DATA_KEYS));
  }, [setters]);

  const signOut = useCallback(() => {
    clearAuthTokens();
    setUser(null);
    setDashboard(null);
    setPackages([]);
    setAlerts([]);
    setRepos([]);
    setRepoLimit(1);
    setLoadedKeys(new Set());
    setError(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(
        loginPathWithRedirect(pathname, searchString ? `?${searchString}` : ""),
      );
      return;
    }

    const missing = neededKeys.filter((key) => !loadedKeys.has(key));
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        setError(null);
        await fetchDataKeys(missing, setters);
        if (!cancelled) {
          setLoadedKeys((prev) => markLoaded(prev, missing));
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load data";
          if (
            message.includes("401") ||
            message.toLowerCase().includes("unauthorized")
          ) {
            clearAuthTokens();
            router.replace(
              loginPathWithRedirect(
                pathname,
                searchString ? `?${searchString}` : "",
              ),
            );
            return;
          }
          setError(message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [neededKeys, loadedKeys, pathname, router, searchString, setters]);

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
    [
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
    ],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function useAppDataOptional(): AppDataContextValue | null {
  return useContext(AppDataContext);
}
