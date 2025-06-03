/*
  Warnings:

  - You are about to drop the column `customBgColor` on the `user_page_backgrounds` table. All the data in the column will be lost.
  - You are about to drop the column `customPatternColor` on the `user_page_backgrounds` table. All the data in the column will be lost.
  - Made the column `patternColor` on table `user_page_backgrounds` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_page_backgrounds" DROP COLUMN "customBgColor",
DROP COLUMN "customPatternColor",
ALTER COLUMN "backgroundColor" SET DEFAULT '#ffffff',
ALTER COLUMN "patternColor" SET NOT NULL,
ALTER COLUMN "patternColor" SET DEFAULT '#000000';
