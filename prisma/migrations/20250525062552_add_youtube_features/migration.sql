-- AlterTable
ALTER TABLE "UserYoutubeSettings" ADD COLUMN     "lastFetchedAt" TIMESTAMP(3),
ALTER COLUMN "displayCount" SET DEFAULT 8;

-- CreateTable
CREATE TABLE "UserRecommendYoutube" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "title" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserRecommendYoutube_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRecommendYoutube_userId_idx" ON "UserRecommendYoutube"("userId");

-- AddForeignKey
ALTER TABLE "UserRecommendYoutube" ADD CONSTRAINT "UserRecommendYoutube_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
