-- AlterTable
ALTER TABLE "user_devices" ADD COLUMN     "color_id" INTEGER;

-- CreateIndex
CREATE INDEX "user_devices_color_id_idx" ON "user_devices"("color_id");

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
