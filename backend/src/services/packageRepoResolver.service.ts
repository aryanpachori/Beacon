import axios from "axios";
import { Ecosystem } from "@prisma/client";
import { prisma } from "../db/client";

export type ResolvedPackageRepo = {
  owner: string;
  repo: string;
  url: string;
  homepage: string | null;
  source: "database" | "registry" | "github_sponsor";
};

/** Parse owner/repo from common GitHub URL shapes and npm `github:` shorthand. */
export function parseGithubRepoFromUrl(
  raw: string,
): { owner: string; repo: string } | null {
  const url = raw.trim();
  if (!url) return null;

  const githubShorthand = url.match(/^github:([^/]+)\/([^/\s#?]+)/i);
  if (githubShorthand) {
    return {
      owner: githubShorthand[1]!,
      repo: stripGitSuffix(githubShorthand[2]!),
    };
  }

  const match = url.match(/github\.com[/:]([^/]+)\/([^/\s#?.]+)/i);
  if (match) {
    return { owner: match[1]!, repo: stripGitSuffix(match[2]!) };
  }

  return null;
}

function stripGitSuffix(name: string): string {
  return name.replace(/\.git$/i, "");
}

function toResolved(
  owner: string,
  repo: string,
  url: string,
  homepage: string | null,
  source: ResolvedPackageRepo["source"],
): ResolvedPackageRepo {
  return {
    owner,
    repo,
    url: url.startsWith("http") ? url : `https://github.com/${owner}/${repo}`,
    homepage,
    source,
  };
}

async function fromRegistry(
  ecosystem: string,
  name: string,
): Promise<ResolvedPackageRepo | null> {
  switch (ecosystem) {
    case "npm":
      return resolveNpm(name);
    case "pypi":
      return resolvePyPI(name);
    case "cargo":
      return resolveCargo(name);
    case "gem":
      return resolveRubyGems(name);
    default:
      return null;
  }
}

async function resolveNpm(name: string): Promise<ResolvedPackageRepo | null> {
  const encoded = encodeURIComponent(name);
  const { data } = await axios.get(`https://registry.npmjs.org/${encoded}`, {
    timeout: 15000,
    validateStatus: (s) => s === 200,
  });

  const homepage =
    typeof data.homepage === "string" && data.homepage.length > 0
      ? data.homepage
      : null;

  const repository = data.repository;
  if (typeof repository === "string") {
    const parsed = parseGithubRepoFromUrl(repository);
    if (parsed)
      return toResolved(
        parsed.owner,
        parsed.repo,
        repository,
        homepage,
        "registry",
      );
  }
  if (
    repository &&
    typeof repository === "object" &&
    typeof repository.url === "string"
  ) {
    const parsed = parseGithubRepoFromUrl(repository.url);
    if (parsed) {
      return toResolved(
        parsed.owner,
        parsed.repo,
        repository.url,
        homepage,
        "registry",
      );
    }
  }

  if (data.bugs?.url) {
    const parsed = parseGithubRepoFromUrl(String(data.bugs.url));
    if (parsed) {
      return toResolved(
        parsed.owner,
        parsed.repo,
        `https://github.com/${parsed.owner}/${parsed.repo}`,
        homepage,
        "registry",
      );
    }
  }

  return null;
}

async function resolvePyPI(name: string): Promise<ResolvedPackageRepo | null> {
  const encoded = encodeURIComponent(name);
  const { data } = await axios.get(`https://pypi.org/pypi/${encoded}/json`, {
    timeout: 15000,
    validateStatus: (s) => s === 200,
  });

  const info = data.info ?? {};
  const homepage = typeof info.home_page === "string" ? info.home_page : null;
  const urls: Record<string, string> = info.project_urls ?? {};

  const candidates = [
    urls.Source,
    urls.source,
    urls.Repository,
    urls.repository,
    urls["Source Code"],
    homepage,
  ].filter((u): u is string => typeof u === "string" && u.length > 0);

  for (const candidate of candidates) {
    const parsed = parseGithubRepoFromUrl(candidate);
    if (parsed) {
      return toResolved(
        parsed.owner,
        parsed.repo,
        candidate.startsWith("http")
          ? candidate
          : `https://github.com/${parsed.owner}/${parsed.repo}`,
        homepage,
        "registry",
      );
    }
  }

  return null;
}

async function resolveCargo(name: string): Promise<ResolvedPackageRepo | null> {
  const encoded = encodeURIComponent(name);
  const { data } = await axios.get(
    `https://crates.io/api/v1/crates/${encoded}`,
    {
      timeout: 15000,
      validateStatus: (s) => s === 200,
      headers: { Accept: "application/json" },
    },
  );

  const crate = data.crate ?? data;
  const repository = crate.repository as string | undefined;
  const homepage = (crate.homepage as string | undefined) ?? null;

  if (repository) {
    const parsed = parseGithubRepoFromUrl(repository);
    if (parsed) {
      return toResolved(
        parsed.owner,
        parsed.repo,
        repository,
        homepage,
        "registry",
      );
    }
  }

  return null;
}

async function resolveRubyGems(
  name: string,
): Promise<ResolvedPackageRepo | null> {
  const encoded = encodeURIComponent(name);
  const { data } = await axios.get(
    `https://rubygems.org/api/v1/gems/${encoded}.json`,
    {
      timeout: 15000,
      validateStatus: (s) => s === 200,
    },
  );

  const homepage =
    typeof data.homepage_uri === "string" ? data.homepage_uri : null;
  const source = data.source_code_uri as string | undefined;

  if (source) {
    const parsed = parseGithubRepoFromUrl(source);
    if (parsed) {
      return toResolved(
        parsed.owner,
        parsed.repo,
        source,
        homepage,
        "registry",
      );
    }
  }

  return null;
}

/**
 * Resolve the upstream GitHub repository for a dependency package.
 * Cache: Postgres `package.githubOwner + githubRepoName` (set once, reused on subsequent scans).
 * Zero Redis commands.
 */
export async function resolvePackageGithubRepo(
  packageId: string,
  name: string,
  ecosystem: string,
): Promise<ResolvedPackageRepo | null> {
  // 1. Postgres cache — already resolved on a previous scan
  const existing = await prisma.package.findUnique({
    where: { id: packageId },
    select: {
      githubOwner: true,
      githubRepoName: true,
      githubRepoUrl: true,
      homepageUrl: true,
    },
  });

  if (existing?.githubOwner && existing.githubRepoName) {
    return toResolved(
      existing.githubOwner,
      existing.githubRepoName,
      existing.githubRepoUrl ??
        `https://github.com/${existing.githubOwner}/${existing.githubRepoName}`,
      existing.homepageUrl,
      "database",
    );
  }

  // 2. Resolve from registry + persist to Postgres for next scan
  let resolved: ResolvedPackageRepo | null = null;
  try {
    resolved = await fromRegistry(ecosystem, name);
  } catch (err) {
    console.warn(
      JSON.stringify({
        event: "package_repo_resolve_failed",
        packageId,
        name,
        ecosystem,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }

  if (resolved) {
    await prisma.package.update({
      where: { id: packageId },
      data: {
        githubOwner: resolved.owner,
        githubRepoName: resolved.repo,
        githubRepoUrl: resolved.url,
        homepageUrl: resolved.homepage ?? undefined,
      },
    });
  }

  return resolved;
}

export async function resolvePackageGithubRepoByName(
  name: string,
  ecosystem: Ecosystem,
): Promise<ResolvedPackageRepo | null> {
  const pkg = await prisma.package.findUnique({
    where: { name_ecosystem: { name, ecosystem } },
    select: { id: true },
  });
  if (!pkg) return null;
  return resolvePackageGithubRepo(pkg.id, name, ecosystem);
}
