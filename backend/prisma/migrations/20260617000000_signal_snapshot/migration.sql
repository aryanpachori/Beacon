-- Add signalSnapshot JSON column to packages table
-- Stores all 6 signal scores + facts + maintainers in a single row
-- instead of 6 separate rows in package_signals (reduces DB writes 6x)
ALTER TABLE "packages" ADD COLUMN "signalSnapshot" JSONB;
ALTER TABLE "packages" ADD COLUMN "signalCapturedAt" TIMESTAMP(3);
