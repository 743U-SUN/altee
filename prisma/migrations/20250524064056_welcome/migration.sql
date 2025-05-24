-- AlterTable
ALTER TABLE "User" ADD COLUMN     "handle_change_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "handle_change_tokens" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "is_premium_user" BOOLEAN NOT NULL DEFAULT false;
