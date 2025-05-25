-- マイグレーション: UserInfoCategory と UserInfoQuestion テーブルの追加
-- 実行前に必ず `npm run prisma:generate` を実行してください
-- その後 `npx prisma db push` または `npx prisma migrate dev` でマイグレーションを実行してください

-- UserInfoCategory テーブル
CREATE TABLE "UserInfoCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserInfoCategory_pkey" PRIMARY KEY ("id")
);

-- UserInfoQuestion テーブル
CREATE TABLE "UserInfoQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "UserInfoQuestion_pkey" PRIMARY KEY ("id")
);

-- インデックス作成
CREATE INDEX "UserInfoCategory_userId_idx" ON "UserInfoCategory"("userId");
CREATE INDEX "UserInfoQuestion_categoryId_idx" ON "UserInfoQuestion"("categoryId");

-- 外部キー制約
ALTER TABLE "UserInfoCategory" ADD CONSTRAINT "UserInfoCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserInfoQuestion" ADD CONSTRAINT "UserInfoQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "UserInfoCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
