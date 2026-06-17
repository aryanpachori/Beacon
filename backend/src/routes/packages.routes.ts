import { Router } from "express";
import { Ecosystem } from "@prisma/client";
import { prisma, toApiTier, fromApiTier } from "../db/client";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import {
  getUserInstallationContext,
  monitoredRepoRelation,
  monitoredRepoWhere,
} from "../services/selectedRepos.service";
import {
  resolvePackageSignals,
  resolveSignalsBatch,
  toApiSignalsPayload,
} from "../services/resolvePackageSignals.service";
import { listPackageRecommendations } from "../services/recommendation.service";

export const packagesRouter = Router();

packagesRouter.use(authMiddleware);

packagesRouter.get("/", async (req: AuthRequest, res, next) => {
  try {
    const ctx = await getUserInstallationContext(req.user!.userId);
    if (!ctx || ctx.selectedRepoIds.length === 0)
      return res.json({ packages: [] });

    const { installation, selectedRepoIds } = ctx;
    const repoScope = monitoredRepoRelation(installation.id, selectedRepoIds);

    const tierFilter = req.query.tier as string | undefined;
    const ecosystemFilter = req.query.ecosystem as string | undefined;

    const packages = await prisma.package.findMany({
      where: {
        repoPackages: { some: repoScope },
        ...(tierFilter ? { tier: fromApiTier(tierFilter) } : {}),
        ...(ecosystemFilter ? { ecosystem: ecosystemFilter as Ecosystem } : {}),
      },
      select: {
        id: true,
        name: true,
        ecosystem: true,
        currentSps: true,
        tier: true,
        updatedAt: true,
        repoPackages: {
          where: repoScope,
          take: 1,
          select: {
            declaredVersion: true,
            repo: { select: { org: true, name: true } },
          },
        },
      },
      orderBy: { currentSps: "asc" },
    });

    const packageIds = packages.map((p) => p.id);
    const signalMap = await resolveSignalsBatch(packageIds);

    const historyByPackage = new Map<string, number[]>();
    if (packageIds.length > 0) {
      const rows = await prisma.packageScore.findMany({
        where: { packageId: { in: packageIds } },
        orderBy: { scoredAt: "asc" },
        select: { packageId: true, sps: true },
      });
      for (const row of rows) {
        const hist = historyByPackage.get(row.packageId) ?? [];
        hist.push(row.sps);
        if (hist.length > 30) hist.shift();
        historyByPackage.set(row.packageId, hist);
      }
    }

    res.json({
      packages: packages.map((p) => ({
        id: p.id,
        name: p.name,
        ecosystem: p.ecosystem,
        sps: p.currentSps,
        tier: toApiTier(p.tier),
        lastUpdated: p.updatedAt,
        version: p.repoPackages[0]?.declaredVersion ?? "*",
        repoName: p.repoPackages[0]
          ? `${p.repoPackages[0].repo.org}/${p.repoPackages[0].repo.name}`
          : "",
        signals: toApiSignalsPayload(signalMap.get(p.id) ?? null),
        spsHistory: historyByPackage.get(p.id) ?? [],
      })),
    });
  } catch (err) {
    next(err);
  }
});

packagesRouter.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const packageId = Array.isArray(id) ? id[0]! : id;
    const ctx = await getUserInstallationContext(req.user!.userId);

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        name: true,
        ecosystem: true,
        currentSps: true,
        tier: true,
        updatedAt: true,
        description: true,
        latestVersion: true,
        weeklyDownloads: true,
        predictionReason: true,
        predictedCriticalAt: true,
        predictionConfidence: true,
        predictionSlope: true,
      },
    });
    if (!pkg) throw new AppError(404, "Package not found");

    const repos =
      ctx && ctx.selectedRepoIds.length > 0
        ? await prisma.repoPackage.findMany({
            where: {
              packageId,
              repo: monitoredRepoWhere(
                ctx.installation.id,
                ctx.selectedRepoIds,
              ),
            },
            select: {
              declaredVersion: true,
              manifestPath: true,
              repo: { select: { org: true, name: true } },
            },
          })
        : [];

    if (!repos.length) throw new AppError(404, "Package not found");

    const resolvedSignals = await resolvePackageSignals(packageId);

    const [history, recommendations] = await Promise.all([
      ctx && repos.length > 0
        ? prisma.packageScore.findMany({
            where: { packageId },
            orderBy: { scoredAt: "asc" },
            take: 90,
            select: { sps: true },
          })
        : Promise.resolve([]),
      listPackageRecommendations(packageId),
    ]);

    res.json({
      id: pkg.id,
      name: pkg.name,
      ecosystem: pkg.ecosystem,
      sps: pkg.currentSps,
      tier: toApiTier(pkg.tier),
      lastUpdated: pkg.updatedAt,
      description: pkg.description,
      version: repos[0]?.declaredVersion ?? pkg.latestVersion ?? "*",
      repoName: repos[0] ? `${repos[0].repo.org}/${repos[0].repo.name}` : "",
      repos: repos.map((r) => ({
        repoName: `${r.repo.org}/${r.repo.name}`,
        version: r.declaredVersion,
        manifestPath: r.manifestPath,
      })),
      signals: toApiSignalsPayload(resolvedSignals),
      spsHistory: history.map((h) => h.sps),
      recommendations,
      effortEstimate: {
        linesImpacted: 0,
        filesAffected: repos.length,
        sprintWeeks: 1,
      },
      weeklyDownloads: pkg.weeklyDownloads ? Number(pkg.weeklyDownloads) : null,
      predictionReason: pkg.predictionReason,
      predictedCriticalAt: pkg.predictedCriticalAt,
      predictionConfidence: pkg.predictionConfidence,
      predictionSlope: pkg.predictionSlope,
    });
  } catch (err) {
    next(err);
  }
});

packagesRouter.get(
  "/:id/recommendations",
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const packageId = Array.isArray(id) ? id[0]! : id;

      const recommendations = await listPackageRecommendations(packageId);

      res.json({ recommendations });
    } catch (err) {
      next(err);
    }
  },
);
