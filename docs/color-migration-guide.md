# カラー管理機能のセットアップガイド

## 1. データベースマイグレーション

カラー管理機能を使用するには、まずデータベースにColorsテーブルとProductColorsテーブルを作成する必要があります。

### マイグレーションの実行

```bash
# Prismaクライアントの生成
npx prisma generate

# マイグレーションの作成と実行
npx prisma migrate dev --name add_color_management

# または、本番環境の場合
npx prisma migrate deploy
```

### マイグレーションの内容確認

以下のテーブルが作成されます：

1. **colors** テーブル
   - id: 主キー
   - name: 日本語カラー名
   - name_en: 英語カラー名
   - hex_code: HEXカラーコード（任意）
   - sort_order: 並び順
   - is_active: 有効フラグ
   - created_at: 作成日時
   - updated_at: 更新日時

2. **product_colors** テーブル
   - id: 主キー
   - product_id: 商品ID（外部キー）
   - color_id: カラーID（外部キー）
   - image_url: カラー別商品画像URL（任意）
   - is_default: デフォルトカラーフラグ
   - created_at: 作成日時

## 2. 初期データの投入

マイグレーション完了後、初期カラーデータを投入します：

```bash
# カラーマスタデータの投入
npx tsx prisma/seed-colors.ts
```

これにより、以下の基本カラーが登録されます：
- ブラック (#000000)
- ホワイト (#FFFFFF)
- シルバー (#C0C0C0)
- グレー (#808080)
- レッド (#FF0000)
- ブルー (#0000FF)
- グリーン (#00FF00)
- イエロー (#FFFF00)
- ピンク (#FFC0CB)
- パープル (#800080)
- オレンジ (#FFA500)
- ブラウン (#A52A2A)
- ゴールド (#FFD700)
- ローズゴールド (#B76E79)
- スペースグレー (#4A4A4A)

## 3. トラブルシューティング

### エラー: "Failed to fetch colors"

このエラーが発生する場合は、以下を確認してください：

1. **データベース接続**
   ```bash
   # データベースの状態確認
   npx prisma db pull
   ```

2. **テーブルの存在確認**
   ```bash
   # Prisma Studioで確認
   npx prisma studio
   ```

3. **環境変数の確認**
   - DATABASE_URLが正しく設定されているか
   - Dockerコンテナが起動しているか

### マイグレーションが失敗する場合

```bash
# データベースをリセット（開発環境のみ）
npx prisma migrate reset

# 再度マイグレーションを実行
npx prisma migrate dev
```

## 4. 動作確認

1. 管理画面にアクセス: `/admin/attributes/colors`
2. カラー一覧が表示されることを確認
3. カラーの追加・編集・削除が可能なことを確認
4. 商品編集画面でカラー設定タブが表示されることを確認

## 5. Docker環境での実行

Docker Composeを使用している場合：

```bash
# コンテナに入る
docker-compose exec app bash

# コンテナ内でマイグレーション実行
npx prisma migrate deploy
npx tsx prisma/seed-colors.ts
```