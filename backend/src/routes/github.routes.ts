import { Router, Response } from "express";
import { ScanStatus } from "@prisma/client";
import { prisma } from "../db/client";
import {
  getInstallUrl,
  buildOAuthState,
  parseOAuthState,
  resolveFrontendUrl,
  getOAuthAuthorizeUrl,
  exchangeOAuthCode,
} from "../lib/github";
import { signalCollectQueue, SignalCollectJobName } from "../lib/queue";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import {
  getLatestScanProgress,
  notifyScanProgress,
  ScanProgressPayload,
  subscribeScanProgress,
} from "../services/scanProgress.service";
import { getRepoLimitForPlan } from "../lib/planLimits";
import {
  linkInstallationForGitHubUser,
  markScanFailed,
  resolveInstallationAccountLogin,
  syncInstallationRepos,
} from "../services/githubInstallation.service";

export const githubRouter = Router();

function readOrigin(req: AuthRequest): string | undefined {
  const origin = req.query.origin;
  if (typeof origin === "string" && origin.startsWith("http")) {
    return origin.replace(/\/$/, "");
  }
  return undefined;
}

githubRouter.get("/install-url", authMiddleware, (req: AuthRequest, res) => {
  const state = buildOAuthState(req.user!.userId, readOrigin(req));
  res.json({ url: getInstallUrl(state) });
});

githubRouter.get(
  "/oauth/url",
  authMiddleware,
  (req: AuthRequest, res, next) => {
    try {
      const state = buildOAuthState(req.user!.userId, readOrigin(req));
      res.json({ url: getOAuthAuthorizeUrl(state) });
    } catch (err) {
      next(err);
    }
  },
);

githubRouter.get("/oauth/callback", async (req, res, next) => {
  try {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;

    if (!code || !state) {
      throw new AppError(400, "Missing code or state");
    }

    const { userId, origin } = parseOAuthState(state);
    const frontendUrl = resolveFrontendUrl(origin);

    const { accessToken } = await exchangeOAuthCode(code);
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!userRes.ok) {
      return res.redirect(
        `${frontendUrl}/onboarding?step=1&error=github_oauth`,
      );
    }

    const ghUser = (await userRes.json()) as { login?: string };
    if (!ghUser.login) {
      return res.redirect(
        `${frontendUrl}/onboarding?step=1&error=github_oauth`,
      );
    }

    const installation = await linkInstallationForGitHubUser(
      ghUser.login,
      userId,
    );
    if (!installation) {
      return res.redirect(
        `${frontendUrl}/onboarding?step=1&error=no_installation`,
      );
    }

    try {
      await syncInstallationRepos(
        installation.id,
        Number(installation.installationId),
      );
    } catch (err) {
      console.error("Failed to sync repos after OAuth link:", err);
      await markScanFailed(installation.id);
      return res.redirect(`${frontendUrl}/onboarding?step=2&error=github_sync`);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: 2 },
    });

    res.redirect(`${frontendUrl}/onboarding?step=2`);
  } catch (err) {
    next(err);
  }
});

githubRouter.get(
  "/onboarding/state",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          onboardingStep: true,
          plan: true,
          onboardingCompletedAt: true,
        },
      });
      if (!user) throw new AppError(404, "User not found");

      const installation = await prisma.githubInstallation.findFirst({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          accountLogin: true,
          scanStatus: true,
          scanProgress: true,
          installationId: true,
          selectedRepos: true,
        },
      });

      const progress = (installation?.scanProgress ?? {}) as {
        total?: number;
        scanned?: number;
        scored?: number;
      };

      const selectedIds = Array.isArray(installation?.selectedRepos)
        ? (installation.selectedRepos as string[])
        : [];

      const selectedRepoRows =
        selectedIds.length > 0
          ? await prisma.repo.findMany({
              where: { id: { in: selectedIds } },
              select: { fullName: true },
            })
          : [];

      const total = progress.total ?? 0;
      let scanStatus = installation?.scanStatus ?? ScanStatus.pending;

      // Empty "complete" scans are invalid — treat as needing repo selection again
      if (scanStatus === ScanStatus.complete && total === 0) {
        scanStatus = ScanStatus.pending;
      }

      res.json({
        connected: !!installation,
        accountLogin: installation?.accountLogin ?? null,
        onboardingStep: user.onboardingStep,
        onboardingComplete: scanStatus === ScanStatus.complete && total > 0,
        scanStatus,
        total,
        scanned: progress.scanned ?? 0,
        scored: progress.scored ?? 0,
        selectedRepoCount: selectedIds.length,
        selectedRepoNames: selectedRepoRows.map((r) => r.fullName),
        configureUrl: installation
          ? `https://github.com/settings/installations/${installation.installationId}`
          : null,
        repoLimit: getRepoLimitForPlan(user.plan),
      });
    } catch (err) {
      next(err);
    }
  },
);

githubRouter.get("/callback", async (req, res, next) => {
  try {
    const installationId = req.query.installation_id as string | undefined;
    const state = req.query.state as string | undefined;

    if (!installationId || !state) {
      throw new AppError(400, "Missing installation_id or state");
    }

    const { userId, origin } = parseOAuthState(state);
    const frontendUrl = resolveFrontendUrl(origin);
    const installationIdNum = Number(installationId);
    const accountLogin =
      await resolveInstallationAccountLogin(installationIdNum);

    // One GitHub installation per Beacon user — if this installationId is
    // already claimed by a DIFFERENT user, redirect with an error rather than
    // silently re-assigning it (which would break the original user's scans).
    const existing = await prisma.githubInstallation.findUnique({
      where: { installationId: BigInt(installationId) },
      select: { userId: true },
    });
    if (existing && existing.userId !== userId) {
      console.warn(
        `Installation ${installationId} already claimed by user ${existing.userId}; ` +
        `rejecting claim from user ${userId}`
      );
      return res.redirect(`${frontendUrl}/onboarding?step=1&error=installation_claimed`);
    }

    // Also enforce: one GitHub account per Beacon user.
    // If this user already has a DIFFERENT installation linked, block the new one.
    const userInstallation = await prisma.githubInstallation.findFirst({
      where: { userId, NOT: { installationId: BigInt(installationId) } },
      select: { installationId: true, accountLogin: true },
    });
    if (userInstallation) {
      console.warn(
        `User ${userId} already has installation ${userInstallation.installationId} (${userInstallation.accountLogin}); ` +
        `blocking duplicate install ${installationId}`
      );
      return res.redirect(`${frontendUrl}/onboarding?step=1&error=already_connected`);
    }

    const installation = await prisma.githubInstallation.upsert({
      where: { installationId: BigInt(installationId) },
      create: {
        userId,
        installationId: BigInt(installationId),
        accountLogin,
        scanStatus: ScanStatus.pending,
        scanProgress: { total: 0, scanned: 0, scored: 0 },
      },
      update: {
        userId,
        accountLogin,
        scanStatus: ScanStatus.pending,
        scanProgress: { total: 0, scanned: 0, scored: 0 },
      },
    });

    try {
      await syncInstallationRepos(installation.id, installationIdNum);
    } catch (err) {
      console.error("Failed to sync GitHub repos after install:", err);
      await markScanFailed(installation.id);
      return res.redirect(`${frontendUrl}/onboarding?step=2&error=github_sync`);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: 2 },
    });

    res.redirect(`${frontendUrl}/onboarding?step=2`);
  } catch (err) {
    next(err);
  }
});

githubRouter.get(
  "/onboarding/repos",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { plan: true },
      });
      if (!user) throw new AppError(404, "User not found");
      const repoLimit = getRepoLimitForPlan(user.plan);

      const installation = await prisma.githubInstallation.findFirst({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, installationId: true, selectedRepos: true },
      });

      if (!installation) {
        return res.json({ repos: [], repoLimit });
      }

      let repos = await prisma.repo.findMany({
        where: { installationId: installation.id },
        select: { id: true, fullName: true, name: true, org: true },
        orderBy: [{ org: "asc" }, { name: "asc" }],
      });

      if (repos.length === 0) {
        try {
          await syncInstallationRepos(
            installation.id,
            Number(installation.installationId),
          );
          repos = await prisma.repo.findMany({
            where: { installationId: installation.id },
            select: { id: true, fullName: true, name: true, org: true },
            orderBy: [{ org: "asc" }, { name: "asc" }],
          });
        } catch (err) {
          console.error("Failed to sync repos for onboarding:", err);
          throw new AppError(502, "Could not load repositories from GitHub");
        }
      }

      const selectedRepos = Array.isArray(installation.selectedRepos)
        ? (installation.selectedRepos as string[])
        : [];

      res.json({
        repos,
        repoLimit,
        selectedRepos,
      });
    } catch (err) {
      next(err);
    }
  },
);

githubRouter.post(
  "/start-scan",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const { repoIds } = req.body as { repoIds?: string[] };
      if (!repoIds?.length) {
        throw new AppError(400, "Select at least one repository");
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { plan: true },
      });
      if (!user) throw new AppError(404, "User not found");

      const repoLimit = getRepoLimitForPlan(user.plan);
      if (repoIds.length > repoLimit) {
        throw new AppError(
          400,
          `Your plan allows ${repoLimit} repo${repoLimit === 1 ? "" : "s"}`,
        );
      }

      const installation = await prisma.githubInstallation.findFirst({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: "desc" },
      });
      if (!installation)
        throw new AppError(404, "No GitHub installation found");

      const repos = await prisma.repo.findMany({
        where: {
          id: { in: repoIds },
          installationId: installation.id,
        },
      });

      if (repos.length !== repoIds.length) {
        throw new AppError(400, "One or more repositories are invalid");
      }

      await prisma.githubInstallation.update({
        where: { id: installation.id },
        data: {
          selectedRepos: repoIds,
          scanStatus: ScanStatus.scanning,
          scanProgress: { total: 0, scanned: 0, scored: 0 },
        },
      });

      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { onboardingStep: 3, onboardingCompletedAt: null },
      });

      await signalCollectQueue.add(
        SignalCollectJobName.SCAN,
        {
          installation_id: Number(installation.installationId),
          installationDbId: installation.id,
          userId: req.user!.userId,
          repos: repos.map((r) => ({ owner: r.org, repo: r.name })),
          triggered_by: "onboarding",
        },
        { attempts: 1 }
      );

      await notifyScanProgress(installation.id);

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  },
);

githubRouter.get(
  "/onboarding/status",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const payload = await getLatestScanProgress(req.user!.userId);
      if (!payload) {
        return res.json({ status: "pending", total: 0, scanned: 0, scored: 0 });
      }
      res.json(payload);
    } catch (err) {
      next(err);
    }
  },
);

function writeSse(res: Response, payload: ScanProgressPayload): void {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

githubRouter.get(
  "/onboarding/stream",
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      const snapshot = await getLatestScanProgress(userId);
      if (snapshot) writeSse(res, snapshot);

      const unsubscribe = subscribeScanProgress(userId, (payload) => {
        writeSse(res, payload);
        if (
          payload.status === ScanStatus.complete ||
          payload.status === ScanStatus.failed
        ) {
          res.end();
        }
      });

      const heartbeat = setInterval(() => {
        res.write(": ping\n\n");
      }, 25000);

      req.on("close", () => {
        clearInterval(heartbeat);
        unsubscribe();
      });
    } catch (err) {
      next(err);
    }
  },
);
