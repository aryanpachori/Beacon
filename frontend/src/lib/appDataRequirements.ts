import type { ApiDashboard, ApiUser } from "@/lib/adapters";
import {
  fetchAlerts,
  fetchDashboard,
  fetchMe,
  fetchPackages,
  fetchRepos,
} from "@/lib/api";
import type { Alert, Package, Repo } from "@/types";

export const ALL_DATA_KEYS = [
  "user",
  "dashboard",
  "packages",
  "alerts",
  "repos",
] as const;

export type DataKey = (typeof ALL_DATA_KEYS)[number];

const SHELL_KEYS: DataKey[] = ["user", "alerts"];

type RouteRule = {
  test: (pathname: string) => boolean;
  keys: DataKey[];
};

/** Extra data beyond shell (user + alerts) required per route. */
const ROUTE_RULES: RouteRule[] = [
  {
    test: (p) => p === "/dashboard" || p === "/analytics",
    keys: ["dashboard", "packages", "repos"],
  },
  {
    test: (p) => p === "/packages",
    keys: ["packages", "repos"],
  },
  {
    test: (p) => p === "/repos",
    keys: ["repos"],
  },
];

export function requiredDataKeys(pathname: string): DataKey[] {
  const keys = new Set<DataKey>(SHELL_KEYS);
  for (const rule of ROUTE_RULES) {
    if (rule.test(pathname)) {
      for (const key of rule.keys) keys.add(key);
    }
  }
  return ALL_DATA_KEYS.filter((key) => keys.has(key));
}

export type DataSetters = {
  setUser: (user: ApiUser) => void;
  setDashboard: (dashboard: ApiDashboard) => void;
  setPackages: (packages: Package[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setRepos: (repos: Repo[]) => void;
  setRepoLimit: (limit: number) => void;
};

const inFlight = new Map<DataKey, Promise<void>>();

function runFetchForKey(key: DataKey, setters: DataSetters): Promise<void> {
  switch (key) {
    case "user":
      return fetchMe().then(setters.setUser);
    case "dashboard":
      return fetchDashboard().then(setters.setDashboard);
    case "packages":
      return fetchPackages().then(setters.setPackages);
    case "alerts":
      return fetchAlerts().then(setters.setAlerts);
    case "repos":
      return fetchRepos().then((data) => {
        setters.setRepos(data.repos);
        setters.setRepoLimit(data.repoLimit);
      });
  }
}

function fetchKeyOnce(key: DataKey, setters: DataSetters): Promise<void> {
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = runFetchForKey(key, setters).finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}

export async function fetchDataKeys(
  keys: DataKey[],
  setters: DataSetters,
  options?: { force?: boolean },
): Promise<void> {
  const unique = Array.from(new Set(keys));
  if (options?.force) {
    await Promise.all(unique.map((key) => runFetchForKey(key, setters)));
    return;
  }
  await Promise.all(unique.map((key) => fetchKeyOnce(key, setters)));
}
