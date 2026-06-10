-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('starter', 'pro', 'team', 'enterprise');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('active', 'trial', 'expired', 'cancelled', 'past_due');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('pending', 'scanning', 'scoring', 'complete', 'failed');

-- CreateEnum
CREATE TYPE "Ecosystem" AS ENUM ('npm', 'pypi', 'cargo', 'maven', 'gem', 'go');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('healthy', 'watch', 'at_risk', 'critical');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('threshold', 'tier_change', 'recovery', 'supply_chain');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('normal', 'critical_override');

-- CreateEnum
CREATE TYPE "DigestFrequency" AS ENUM ('daily', 'weekly', 'never');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'starter',
    "planStatus" "PlanStatus" NOT NULL DEFAULT 'active',
    "trialEndsAt" TIMESTAMP(3),
    "repoLimit" INTEGER NOT NULL DEFAULT 1,
    "packageLimit" INTEGER NOT NULL DEFAULT 200,
    "razorpayCustomerId" TEXT,
    "razorpaySubscriptionId" TEXT,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_installations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "installationId" BIGINT NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'Organization',
    "accountAvatar" TEXT,
    "selectedRepos" JSONB,
    "scanStatus" "ScanStatus" NOT NULL DEFAULT 'pending',
    "scanProgress" JSONB NOT NULL DEFAULT '{}',
    "suspendedAt" TIMESTAMP(3),
    "lastScannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repos" (
    "id" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "githubRepoId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "lastScannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ecosystem" "Ecosystem" NOT NULL,
    "currentSps" INTEGER,
    "tier" "Tier",
    "lastScoredAt" TIMESTAMP(3),
    "description" TEXT,
    "homepageUrl" TEXT,
    "githubRepoUrl" TEXT,
    "githubOwner" TEXT,
    "githubRepoName" TEXT,
    "npmUrl" TEXT,
    "pypiUrl" TEXT,
    "issuesUrl" TEXT,
    "changelogUrl" TEXT,
    "latestVersion" TEXT,
    "weeklyDownloads" BIGINT,
    "totalStars" INTEGER,
    "totalForks" INTEGER,
    "totalOpenIssues" INTEGER,
    "license" TEXT,
    "keywords" JSONB,
    "isDeprecated" BOOLEAN NOT NULL DEFAULT false,
    "deprecationMsg" TEXT,
    "successorPackage" TEXT,
    "predictedCriticalAt" TIMESTAMP(3),
    "predictionConfidence" DOUBLE PRECISION,
    "predictionSlope" DOUBLE PRECISION,
    "predictionReason" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repo_packages" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "manifestFile" TEXT,
    "manifestPath" TEXT,
    "declaredVersion" TEXT,
    "isDevDep" BOOLEAN NOT NULL DEFAULT false,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "repo_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_signals" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "rawValue" DOUBLE PRECISION,
    "rawData" JSONB,
    "source" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_scores" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "sps" INTEGER NOT NULL,
    "tier" "Tier" NOT NULL,
    "featureVector" JSONB,
    "modelVersion" TEXT,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintainers" (
    "id" TEXT NOT NULL,
    "githubLogin" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "company" TEXT,
    "publicReposCount" INTEGER,
    "followersCount" INTEGER,
    "lastPushAt" TIMESTAMP(3),
    "daysInactive" INTEGER,
    "isSponsorEnabled" BOOLEAN,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_maintainers" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "maintainerId" TEXT NOT NULL,
    "commitCount" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_maintainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "spsBefore" INTEGER,
    "spsAfter" INTEGER,
    "tierBefore" "Tier",
    "tierAfter" "Tier",
    "aiReason" TEXT,
    "signalPills" JSONB,
    "primarySignal" TEXT,
    "alertType" "AlertType" NOT NULL DEFAULT 'threshold',
    "severity" "AlertSeverity" NOT NULL DEFAULT 'normal',
    "cveId" TEXT,
    "cisaUrl" TEXT,
    "affectedVersions" JSONB,
    "safeVersions" JSONB,
    "slackSent" BOOLEAN NOT NULL DEFAULT false,
    "slackSentAt" TIMESTAMP(3),
    "gchatSent" BOOLEAN NOT NULL DEFAULT false,
    "gchatSentAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "snoozedUntil" TIMESTAMP(3),
    "firedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "installationId" TEXT,
    "packageId" TEXT,
    "packageName" TEXT,
    "message" TEXT NOT NULL,
    "tier" "Tier",
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "fromPackageId" TEXT NOT NULL,
    "toPackageId" TEXT NOT NULL,
    "reason" TEXT,
    "effortLines" INTEGER,
    "effortFiles" INTEGER,
    "effortWeeks" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_integrations" (
    "id" TEXT NOT NULL,
    "installationId" TEXT NOT NULL,
    "slackWebhookUrl" TEXT,
    "slackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "slackVerifiedAt" TIMESTAMP(3),
    "gchatWebhookUrl" TEXT,
    "gchatEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gchatVerifiedAt" TIMESTAMP(3),
    "digestEmail" TEXT,
    "digestFrequency" "DigestFrequency" NOT NULL DEFAULT 'daily',
    "digestEnabled" BOOLEAN NOT NULL DEFAULT true,
    "digestDay" INTEGER NOT NULL DEFAULT 1,
    "digestHour" INTEGER NOT NULL DEFAULT 8,
    "alertThreshold" INTEGER NOT NULL DEFAULT 40,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpaySubscriptionId" TEXT NOT NULL,
    "razorpayPlanId" TEXT,
    "plan" "Plan" NOT NULL,
    "billingPeriod" TEXT NOT NULL DEFAULT 'monthly',
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "amountPaise" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digest_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribeToken" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'landing_page',
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "digest_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "github_installations_installationId_key" ON "github_installations"("installationId");

-- CreateIndex
CREATE INDEX "github_installations_userId_idx" ON "github_installations"("userId");

-- CreateIndex
CREATE INDEX "repos_installationId_idx" ON "repos"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "repos_installationId_githubRepoId_key" ON "repos"("installationId", "githubRepoId");

-- CreateIndex
CREATE INDEX "packages_tier_idx" ON "packages"("tier");

-- CreateIndex
CREATE INDEX "packages_currentSps_idx" ON "packages"("currentSps");

-- CreateIndex
CREATE UNIQUE INDEX "packages_name_ecosystem_key" ON "packages"("name", "ecosystem");

-- CreateIndex
CREATE INDEX "repo_packages_repoId_idx" ON "repo_packages"("repoId");

-- CreateIndex
CREATE INDEX "repo_packages_packageId_idx" ON "repo_packages"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "repo_packages_repoId_packageId_manifestPath_key" ON "repo_packages"("repoId", "packageId", "manifestPath");

-- CreateIndex
CREATE INDEX "package_signals_packageId_idx" ON "package_signals"("packageId");

-- CreateIndex
CREATE INDEX "package_signals_signalType_idx" ON "package_signals"("signalType");

-- CreateIndex
CREATE INDEX "package_signals_capturedAt_idx" ON "package_signals"("capturedAt" DESC);

-- CreateIndex
CREATE INDEX "package_signals_packageId_signalType_capturedAt_idx" ON "package_signals"("packageId", "signalType", "capturedAt" DESC);

-- CreateIndex
CREATE INDEX "package_scores_packageId_idx" ON "package_scores"("packageId");

-- CreateIndex
CREATE INDEX "package_scores_scoredAt_idx" ON "package_scores"("scoredAt" DESC);

-- CreateIndex
CREATE INDEX "package_scores_packageId_scoredAt_idx" ON "package_scores"("packageId", "scoredAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "maintainers_githubLogin_key" ON "maintainers"("githubLogin");

-- CreateIndex
CREATE INDEX "package_maintainers_packageId_idx" ON "package_maintainers"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "package_maintainers_packageId_maintainerId_key" ON "package_maintainers"("packageId", "maintainerId");

-- CreateIndex
CREATE INDEX "alerts_installationId_idx" ON "alerts"("installationId");

-- CreateIndex
CREATE INDEX "alerts_packageId_idx" ON "alerts"("packageId");

-- CreateIndex
CREATE INDEX "alerts_firedAt_idx" ON "alerts"("firedAt" DESC);

-- CreateIndex
CREATE INDEX "alerts_resolved_idx" ON "alerts"("resolved");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "recommendations_fromPackageId_idx" ON "recommendations"("fromPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "recommendations_fromPackageId_toPackageId_key" ON "recommendations"("fromPackageId", "toPackageId");

-- CreateIndex
CREATE UNIQUE INDEX "org_integrations_installationId_key" ON "org_integrations"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpaySubscriptionId_key" ON "subscriptions"("razorpaySubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "digest_subscribers_email_key" ON "digest_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "digest_subscribers_unsubscribeToken_key" ON "digest_subscribers"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "digest_subscribers_subscribed_idx" ON "digest_subscribers"("subscribed");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repos" ADD CONSTRAINT "repos_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "github_installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repo_packages" ADD CONSTRAINT "repo_packages_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repo_packages" ADD CONSTRAINT "repo_packages_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_signals" ADD CONSTRAINT "package_signals_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_scores" ADD CONSTRAINT "package_scores_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_maintainers" ADD CONSTRAINT "package_maintainers_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_maintainers" ADD CONSTRAINT "package_maintainers_maintainerId_fkey" FOREIGN KEY ("maintainerId") REFERENCES "maintainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "github_installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "github_installations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_fromPackageId_fkey" FOREIGN KEY ("fromPackageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_toPackageId_fkey" FOREIGN KEY ("toPackageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_integrations" ADD CONSTRAINT "org_integrations_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "github_installations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
