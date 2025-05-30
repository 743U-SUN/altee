-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('MANUFACTURER', 'SERIES', 'MODEL');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "manufacturer_id" INTEGER;

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_attributes_slug_key" ON "product_attributes"("slug");

-- CreateIndex
CREATE INDEX "product_attributes_type_idx" ON "product_attributes"("type");

-- CreateIndex
CREATE INDEX "product_attributes_category_idx" ON "product_attributes"("category");

-- CreateIndex
CREATE INDEX "products_manufacturer_id_idx" ON "products"("manufacturer_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "product_attributes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
