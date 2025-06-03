-- CreateTable
CREATE TABLE "user_page_backgrounds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "backgroundType" TEXT NOT NULL DEFAULT 'solid',
    "backgroundColor" TEXT NOT NULL DEFAULT 'white',
    "patternType" TEXT,
    "patternColor" TEXT,
    "patternOpacity" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_page_backgrounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_page_backgrounds_userId_idx" ON "user_page_backgrounds"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_page_backgrounds_userId_pageType_key" ON "user_page_backgrounds"("userId", "pageType");

-- AddForeignKey
ALTER TABLE "user_page_backgrounds" ADD CONSTRAINT "user_page_backgrounds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
