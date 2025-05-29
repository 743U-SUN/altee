# 定期更新設定ガイド

## 1. Vercel Cron Functions を使用する場合

`vercel.json` に以下を追加：

```json
{
  "crons": [
    {
      "path": "/api/admin/scheduled-update",
      "schedule": "0 3 * * 1"
    }
  ]
}
```

これにより、毎週月曜日の午前3時（UTC）に定期更新が実行されます。

## 2. 外部Cronサービスを使用する場合

### cron-job.org などのサービスを利用：

1. URLに `https://your-domain.com/api/admin/scheduled-update` を設定
2. メソッドを `POST` に設定
3. ヘッダーに認証情報を追加：
   ```
   x-cron-secret: your-cron-secret
   ```
4. スケジュールを設定（例: 毎週日曜日の深夜）

## 3. ローカル開発環境での確認

開発環境では手動で実行できます：

```bash
# 統計情報の確認
curl http://localhost:3000/api/admin/scheduled-update

# 手動更新の実行（管理者としてログインが必要）
curl -X POST http://localhost:3000/api/admin/scheduled-update
```

## 4. 環境変数の設定

本番環境では以下の環境変数を設定してください：

```env
# Cron実行用のシークレットキー（オプション）
CRON_SECRET=your-secure-cron-secret

# PA-API設定（必須）
AMAZON_ACCESS_KEY=your-access-key
AMAZON_SECRET_KEY=your-secret-key
ADMIN_AMAZON_ASSOCIATE_ID=your-associate-id
```

## 5. 更新頻度の調整

`lib/actions/scheduled-update-actions.ts` の `getProductsNeedingUpdate` 関数で更新頻度を調整できます：

```typescript
// デフォルトは1週間（168時間）
const hoursThreshold = 24 * 7;
```

## 6. レート制限の考慮

- Amazon PA-APIには1秒あたり1リクエストの制限があります
- OGメタデータ取得にも適切な待機時間を設定しています
- 一度に処理する商品数は50件に制限されています

## 7. モニタリング

管理者ダッシュボード（`/admin/devices`）で以下を確認できます：
- 更新統計情報
- 最終更新日時
- エラー情報
- 手動更新の実行
