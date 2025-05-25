-- CreateTable
CREATE TABLE "UserInfoCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserInfoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateIndex
CREATE INDEX "UserInfoCategory_userId_idx" ON "UserInfoCategory"("userId");

-- CreateIndex
CREATE INDEX "UserInfoQuestion_categoryId_idx" ON "UserInfoQuestion"("categoryId");

-- AddForeignKey
ALTER TABLE "UserInfoCategory" ADD CONSTRAINT "UserInfoCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfoQuestion" ADD CONSTRAINT "UserInfoQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "UserInfoCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
