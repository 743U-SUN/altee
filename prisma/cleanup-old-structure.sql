-- 不要なフィールドとテーブルを削除するSQL
-- 実行コマンド: docker compose exec db psql -U postgres -d altee < prisma/cleanup-old-structure.sql

-- Product.attributesフィールドを削除
ALTER TABLE products DROP COLUMN IF EXISTS attributes;

-- ProductAttributeテーブルを削除（関連する制約も含めて）
DROP TABLE IF EXISTS product_attributes CASCADE;

-- AttributeType ENUMを削除（不要になったため）
DROP TYPE IF EXISTS "AttributeType" CASCADE;