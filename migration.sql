-- Prismaの変更をデータベースに適用するためのマイグレーション
-- 手動で実行してください: npx prisma db push

-- または以下のSQLを直接実行：

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "handle_change_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "handle_change_tokens" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_premium_user" BOOLEAN NOT NULL DEFAULT false;
