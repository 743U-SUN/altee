/*
  Warnings:

  - You are about to drop the column `attributes` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `product_attributes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ConnectionType" AS ENUM ('WIRED', 'WIRELESS', 'BOTH');

-- CreateEnum
CREATE TYPE "KeyboardLayout" AS ENUM ('FULL', 'TKL', 'SIXTY', 'SIXTYFIVE', 'SEVENTYFIVE');

-- CreateEnum
CREATE TYPE "SwitchType" AS ENUM ('MECHANICAL', 'OPTICAL', 'MAGNETIC', 'MEMBRANE');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_manufacturer_id_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "attributes",
ADD COLUMN     "series_id" INTEGER;

-- DropTable
DROP TABLE "product_attributes";

-- DropEnum
DROP TYPE "AttributeType";

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouse_attributes" (
    "product_id" INTEGER NOT NULL,
    "dpi_min" INTEGER,
    "dpi_max" INTEGER,
    "weight" INTEGER,
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "buttons" INTEGER,
    "connection_type" "ConnectionType",
    "polling_rate" INTEGER,
    "battery_life" INTEGER,
    "sensor" TEXT,
    "rgb" BOOLEAN NOT NULL DEFAULT false,
    "software" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mouse_attributes_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "keyboard_attributes" (
    "product_id" INTEGER NOT NULL,
    "layout" "KeyboardLayout",
    "switch_type" "SwitchType",
    "actuation_point" DOUBLE PRECISION,
    "connection_type" "ConnectionType",
    "rapid_trigger" BOOLEAN NOT NULL DEFAULT false,
    "rgb" BOOLEAN NOT NULL DEFAULT false,
    "software" TEXT,
    "keycaps" TEXT,
    "hot_swap" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keyboard_attributes_pkey" PRIMARY KEY ("product_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_name_key" ON "manufacturers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_slug_key" ON "manufacturers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "series"("slug");

-- CreateIndex
CREATE INDEX "series_manufacturer_id_idx" ON "series"("manufacturer_id");

-- CreateIndex
CREATE INDEX "products_series_id_idx" ON "products"("series_id");

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouse_attributes" ADD CONSTRAINT "mouse_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyboard_attributes" ADD CONSTRAINT "keyboard_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
