import { Prisma, ScanStatus } from "@prisma/client";
import Redis from "ioredis";
import { prisma } from "../db/client";
import { redis } from "../lib/redis";

export interface ScanProgressPayload {
  status: ScanStatus;
  total: number;
  scanned: number;
  scored: number;
}

type ScanProgressJson = { total?: number; scanned?: number; scored?: number };
type ScanProgressField = "scanned" | "scored";

type ScanProgressRow = {
  userId: string;
  scanStatus: ScanStatus;
  scanProgress: ScanProgressJson;
};

function channelForUser(userId: string): string {
  return `scan-progress:${userId}`;
}

export function formatScanProgress(
  status: ScanStatus,
  progress: ScanProgressJson | null,
): ScanProgressPayload {
  return {
    status,
    total: progress?.total ?? 0,
    scanned: progress?.scanned ?? 0,
    scored: progress?.scored ?? 0,
  };
}

function jsonPath(field: ScanProgressField): Prisma.Sql {
  return Prisma.raw(`'{${field}}'`);
}

function jsonIntKey(field: ScanProgressField): Prisma.Sql {
  return Prisma.raw(`"scanProgress"->>'${field}'`);
}

function scanStatusOnBump(field: ScanProgressField): Prisma.Sql {
  if (field !== "scored") {
    return Prisma.sql`"scanStatus" = "scanStatus",`;
  }

  return Prisma.sql`
    "scanStatus" = CASE
      WHEN "scanStatus" = 'scoring'::"ScanStatus"
        AND COALESCE(("scanProgress"->>'scored')::int, 0) + 1
          >= COALESCE(("scanProgress"->>'total')::int, 0)
        AND COALESCE(("scanProgress"->>'total')::int, 0) > 0
      THEN 'complete'::"ScanStatus"
      ELSE "scanStatus"
    END,
  `;
}

/** Atomically bump a scanProgress counter (single UPDATE, no read-modify-write race). */
async function bumpScanProgressRow(
  installationDbId: string,
  field: ScanProgressField,
): Promise<ScanProgressRow | null> {
  const path = jsonPath(field);
  const counter = jsonIntKey(field);

  const rows = await prisma.$queryRaw<ScanProgressRow[]>`
    UPDATE github_installations
    SET
      "scanProgress" = jsonb_set(
        COALESCE("scanProgress", '{}'::jsonb),
        ${path}::text[],
        to_jsonb(COALESCE((${counter})::int, 0) + 1)
      ),
      ${scanStatusOnBump(field)}
      "updatedAt" = NOW()
    WHERE id = ${installationDbId}
    RETURNING "userId", "scanStatus", "scanProgress"
  `;

  return rows[0] ?? null;
}

async function publishScanProgress(
  userId: string,
  payload: ScanProgressPayload,
): Promise<void> {
  await redis.publish(channelForUser(userId), JSON.stringify(payload));
}

/** Bump `scanned` or `scored` and push the latest progress to connected clients. */
export async function bumpScanProgress(
  installationDbId: string,
  field: ScanProgressField,
): Promise<ScanProgressPayload | null> {
  const row = await bumpScanProgressRow(installationDbId, field);
  if (!row) return null;

  const payload = formatScanProgress(row.scanStatus, row.scanProgress);
  await publishScanProgress(row.userId, payload);
  return payload;
}

export async function notifyScanProgress(
  installationDbId: string,
): Promise<void> {
  const row = await prisma.githubInstallation.findUnique({
    where: { id: installationDbId },
    select: { userId: true, scanStatus: true, scanProgress: true },
  });
  if (!row) return;

  await publishScanProgress(
    row.userId,
    formatScanProgress(row.scanStatus, row.scanProgress as ScanProgressJson),
  );
}

export async function getLatestScanProgress(
  userId: string,
): Promise<ScanProgressPayload | null> {
  const row = await prisma.githubInstallation.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { scanStatus: true, scanProgress: true },
  });
  if (!row) return null;
  return formatScanProgress(
    row.scanStatus,
    row.scanProgress as ScanProgressJson,
  );
}

export function subscribeScanProgress(
  userId: string,
  onEvent: (payload: ScanProgressPayload) => void,
): () => void {
  const sub: Redis = redis.duplicate();

  sub.subscribe(channelForUser(userId)).catch((err) => {
    console.error("Scan progress subscribe failed:", err);
  });

  sub.on("message", (_channel, message) => {
    try {
      onEvent(JSON.parse(message) as ScanProgressPayload);
    } catch {
      // ignore malformed payloads
    }
  });

  return () => {
    sub.unsubscribe().catch(() => {});
    sub.quit().catch(() => {});
  };
}
