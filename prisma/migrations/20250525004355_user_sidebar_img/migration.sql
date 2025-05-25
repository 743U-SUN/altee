-- CreateTable
CREATE TABLE "UserImageSidebar" (
    "id" TEXT NOT NULL,
    "url" TEXT,
    "imgUrl" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserImageSidebar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserImageSidebar_userId_idx" ON "UserImageSidebar"("userId");

-- AddForeignKey
ALTER TABLE "UserImageSidebar" ADD CONSTRAINT "UserImageSidebar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
