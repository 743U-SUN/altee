/*
  Warnings:

  - You are about to drop the column `category` on the `UserLink` table. All the data in the column will be lost.
  - You are about to drop the column `linkTypeId` on the `UserLink` table. All the data in the column will be lost.
  - You are about to drop the `LinkType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `serviceId` to the `UserLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserLink` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IconStyle" AS ENUM ('FILLED', 'OUTLINE', 'MINIMAL', 'GRADIENT', 'THREE_D');

-- CreateEnum
CREATE TYPE "IconColor" AS ENUM ('ORIGINAL', 'MONOCHROME', 'WHITE', 'BLACK', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "UserLink" DROP CONSTRAINT "UserLink_linkTypeId_fkey";

-- AlterTable
ALTER TABLE "UserLink" DROP COLUMN "category",
DROP COLUMN "linkTypeId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "originalIconUrl" TEXT,
ADD COLUMN     "serviceId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "useOriginalIcon" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "LinkType";

-- CreateTable
CREATE TABLE "LinkService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "baseUrl" TEXT,
    "allowOriginalIcon" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceIcon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "style" "IconStyle" NOT NULL,
    "colorScheme" "IconColor" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ServiceIcon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkService_slug_key" ON "LinkService"("slug");

-- CreateIndex
CREATE INDEX "ServiceIcon_serviceId_idx" ON "ServiceIcon"("serviceId");

-- CreateIndex
CREATE INDEX "UserLink_serviceId_idx" ON "UserLink"("serviceId");

-- CreateIndex
CREATE INDEX "UserLink_iconId_idx" ON "UserLink"("iconId");

-- AddForeignKey
ALTER TABLE "UserLink" ADD CONSTRAINT "UserLink_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "LinkService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLink" ADD CONSTRAINT "UserLink_iconId_fkey" FOREIGN KEY ("iconId") REFERENCES "ServiceIcon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceIcon" ADD CONSTRAINT "ServiceIcon_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "LinkService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
