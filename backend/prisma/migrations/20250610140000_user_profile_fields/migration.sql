-- AlterTable
ALTER TABLE "users" ADD COLUMN "nickname" TEXT,
ADD COLUMN "avatarThemeIndex" INTEGER NOT NULL DEFAULT 0;
