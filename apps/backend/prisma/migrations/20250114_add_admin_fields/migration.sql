-- AlterTable
ALTER TABLE "users" ADD COLUMN "suspended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "suspension_reason" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN "flagged" BOOLEAN NOT NULL DEFAULT false;
