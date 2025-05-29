# デバイス管理システム実装ガイド

## 1. プロジェクト概要

**目的**: VTuber・配信者向けデバイス管理Webアプリケーション  
**ターゲット**: 配信者・VTuber・ゲーマー  
**コンセプト**:
- 使用デバイスをプロフィールに表示
- 商品比較・一覧ページ提供（未認証ユーザーにも公開）
- お気に入り機能
- コミュニティでの情報共有
- **アフィリエイト収益の適切な分配**（管理者・ユーザー双方）

## 2. 実装済み機能（Phase 1-9）

### Phase 1: データベース設計
✅ Prismaスキーマの実装
- DeviceCategory: デバイスカテゴリ管理
- Product: 管理者が厳選した公式商品リスト
- UserDevice: ユーザーの所持デバイス管理
- UserFavorite: お気に入り機能
- User.amazonAssociateId: ユーザーのアソシエイトID

### Phase 2: OGメタデータ取得サービス
✅ Amazon関連サービスの実装
- ユーザー用: OGメタデータ取得（PA-API不使用）
- 管理者用: PA-API連携
- ユーティリティ: URL解析、ASIN抽出、アフィリエイトID管理

### Phase 3: 基本的なUserDevice CRUD機能
✅ ユーザーのデバイス管理機能
- APIルート（GET/POST/PUT/DELETE）
- ユーザーダッシュボード
- プロフィールページでのデバイス表示
- 公式商品/カスタム商品の両対応

### Phase 4: 公式商品管理（管理者機能）
✅ 管理者用デバイス管理機能
- 管理者ダッシュボード（/admin/devices）
- 商品CRUD機能（追加・編集・削除）
- PA-APIを使用した商品情報取得・更新
- バッチ更新処理（全商品の一括更新）
- カテゴリフィルタリング・検索機能
- 利用者数表示・利用者一覧

### Phase 5: Amazon URL追加機能の改善
✅ 重複チェック機能
- ASINベースの重複確認
- 公式商品が存在する場合の自動切り替え
- ユーザーが既に所持している商品の検出
- リアルタイムプレビュー機能
✅ 商品情報の定期更新
- 更新频度の管理（1週間ごと）
- APIエンドポイント経由の手動更新
- 更新統計情報の表示
- レート制限対策

### Phase 6: 統一表示UI実装
✅ デバイスの統一表示
- 公式商品とカスタム商品の統一UI
- UnifiedDeviceCardコンポーネント
- コンパクトモードと詳細モード
✅ デバイス属性の詳細表示
- カテゴリ別属性のグループ化
- アイコン付き属性表示
- 日本語ラベル対応
✅ 比較機能
- 複数デバイスの選択機能
- 属性の並列比較テーブル
- 最大5個までの比較対応

### Phase 7: 商品一覧ページ（公開版）
✅ 公開デバイスカタログ
- 未認証ユーザーも閲覧可能
- キャッシュ機能付き（5分～1時間）
- レスポンシブデザイン
✅ カテゴリ別フィルタリング
- サイドバーフィルタ
- URLパラメータでの状態管理
- カテゴリ別統計表示
✅ 商品比較機能
- 統一表示UIを活用
- 複数選択・比較テーブル
✅ 人気商品表示
- 使用者数ベースのランキング
- ランキングバッジ付き

### Phase 8: 昇格機能・管理者ダッシュボード
✅ 昇格候補の管理画面
- ASIN別にグループ化
- 複数ユーザー使用商品のみ表示
- 既存公式商品との重複チェック
✅ 昇格処理フロー
- カスタム商品から公式商品への変換
- 関連UserDeviceの自動更新
- PA-APIでの詳細情報取得
✅ 統計ダッシュボード
- カテゴリ別分布
- 昇格率表示
- カスタム商品数統計

### Phase 9: お気に入り機能
✅ お気に入り管理
- 商品カードにお気に入りボタン追加
- お気に入り一覧ページ（`/user/favorites`）
- お気に入りからの一括比較機能
- 複数選択・一括削除機能
✅ 統計表示
- お気に入り総数
- カテゴリ別分布グラフ
✅ 認証連携
- ログインユーザーのみ使用可能
- 未ログイン時はボタン非表示

## 3. 実装済みファイル一覧

### データベース関連
- **prisma/schema.prisma**: デバイス管理用モデルを追加
  - DeviceCategory, Product, UserDevice, UserFavorite
  - User.amazonAssociateId フィールド追加
- **prisma/seed-device.ts**: 初期データ投入スクリプト
  - カテゴリ（マウス、キーボード）とサンプル商品データ

### 型定義
- **types/device/index.ts**: デバイス管理システムの型定義
  - CustomProductData: カスタム商品データ構造
  - DisplayDevice: 表示用統一インターフェース
  - MouseAttributes/KeyboardAttributes: カテゴリ別属性

### Amazon関連サービス（lib/services/amazon/）
- **og-metadata.ts**: ユーザー用OGメタデータ取得
  - fetchProductFromAmazonUrl(): 商品情報取得
  - extractAttributes(): 属性自動抽出
- **pa-api.ts**: 管理者用PA-API連携
  - fetchProductFromPAAPI(): 詳細商品情報取得
  - AWS署名バージョン4実装

### ユーティリティ（lib/utils/amazon/）
- **url-parser.ts**: URL解析とASIN抽出
- **affiliate.ts**: アフィリエイトID管理

### バリデーション
- **lib/validation/device-validation.ts**: Zodスキーマ定義
  - 各種フォームバリデーション
  - APIリクエスト検証

### サーバーアクション
- **lib/actions/device-actions.ts**: デバイス関連のCRUD操作
  - getUserDevices(): デバイス一覧取得
  - addDeviceFromProduct/Url(): デバイス追加
  - updateDevice/deleteDevice(): 更新・削除

### APIルート（app/api/devices/）
- **route.ts**: GET（一覧）、POST（作成）
- **[deviceId]/route.ts**: GET（詳細）、PUT（更新）、DELETE（削除）

### ユーザーダッシュボード（app/(user)/user/devices/）
- **page.tsx**: デバイス管理メインページ
- **components/DeviceList.tsx**: デバイス一覧表示
- **components/DeviceCard.tsx**: デバイスカード
- **components/AddDeviceForm.tsx**: デバイス追加フォーム
- **components/EditDeviceModal.tsx**: 編集モーダル
- **components/DeleteDeviceDialog.tsx**: 削除確認

### プロフィールページ
- **app/(handle)/[handle]/device/page.tsx**: 公開デバイス表示

### 管理者ダッシュボード（app/(admin)/admin/devices/）
- **page.tsx**: 商品一覧ページ
- **[productId]/page.tsx**: 商品編集ページ
- **components/ProductListHeader.tsx**: 検索・フィルタ・アクション
- **components/ProductList.tsx**: 商品一覧グリッド
- **components/ProductCard.tsx**: 商品カード
- **components/AddProductDialog.tsx**: 商品追加ダイアログ
- **components/ProductEditForm.tsx**: 商品編集フォーム
- **components/ProductListSkeleton.tsx**: ローディング表示

### 共有コンポーネント（components/devices/）
- **DeviceIcon.tsx**: カテゴリアイコン表示
- **DeviceBadge.tsx**: 公式/カスタムバッジ
- **DeviceAttributes.tsx**: 属性表示コンポーネント
- **DeviceDetails.tsx**: デバイス詳細表示
- **UnifiedDeviceCard.tsx**: 統一デバイスカード
- **DeviceComparison.tsx**: デバイス比較コンポーネント
- **FavoriteButton.tsx**: お気に入りボタン

### サーバーアクション（追加分）
- **lib/actions/admin-product-actions.ts**: 管理者用商品管理アクション
- **lib/actions/device-actions.ts**: デバイス管理アクション（重複チェック機能追加）
  - checkExistingProductByAsin(): ASINベースの重複チェック
  - previewProductFromUrl(): URLプレビュー機能
  - addDeviceFromUrl(): 重複チェック付き追加
- **lib/actions/scheduled-update-actions.ts**: 定期更新アクション
  - runScheduledUpdate(): 定期更新実行
  - getUpdateStatistics(): 更新統計情報
- **lib/actions/public-product-actions.ts**: 公開版商品取得アクション
  - getPublicProducts(): 商品一覧取得（キャッシュ付き）
  - getPublicCategories(): カテゴリ一覧取得
  - getPopularProducts(): 人気商品取得
  - getCategoryStatistics(): カテゴリ別統計
  - formatPublicProductForDisplay(): 表示用フォーマット
- **lib/actions/promotion-actions.ts**: 昇格処理アクション
  - getCustomProductStatistics(): カスタム商品統計
  - promoteCustomProduct(): 商品昇格処理
  - getCategoryStatistics(): カテゴリ統計
- **lib/actions/favorite-actions.ts**: お気に入り操作アクション
  - toggleFavorite(): お気に入り追加/削除
  - getUserFavorites(): ユーザーのお気に入り取得
  - getFavoriteStatus(): お気に入り状態取得
  - removeMultipleFavorites(): 一括削除

### APIルート（追加分）
- **app/api/admin/scheduled-update/route.ts**: 定期更新API

### ユーザーダッシュボードの改善
- **AddDeviceForm.tsx**: 重複チェック機能付きフォーム
- **DeviceList.tsx**: 統一表示UI・比較機能対応
- **ProductUpdateStatus.tsx**: 更新状況表示コンポーネント

### 公開プロフィールページの改善
- **[handle]/device/page.tsx**: 統一表示UI対応、タブ表示

### 公開デバイスカタログ（app/(device)/device/）
- **layout.tsx**: デバイスカタログ用レイアウト
- **page.tsx**: メインページ（ヒーローセクション、人気商品、カテゴリ概要）
- **[category]/page.tsx**: カテゴリ別リダイレクト
- **components/ProductGrid.tsx**: 商品グリッド表示（お気に入り機能付き）
- **components/ProductFilters.tsx**: フィルタコンポーネント
- **components/CategoryOverview.tsx**: カテゴリ概要カード
- **components/PopularProducts.tsx**: 人気商品表示
- **components/ProductGridSkeleton.tsx**: ローディング表示

### 昇格機能（app/(admin)/admin/devices/promotion/）
- **page.tsx**: 昇格候補一覧ページ
- **components/admin/promotion/PromotionCandidateCard.tsx**: 候補表示カード
- **components/admin/promotion/PromotionStats.tsx**: 統計表示

### お気に入り機能（app/(user)/user/favorites/）
- **page.tsx**: お気に入り一覧ページ
- **components/FavoriteList.tsx**: お気に入り一覧コンポーネント
- **components/FavoriteStats.tsx**: 統計表示コンポーネント

### ドキュメント
- **docs/device-manager-guide.md**: フェーズ別実装ガイド（本ドキュメント）
- **docs/scheduled-update-guide.md**: 定期更新設定ガイド
- **docs/public-device-catalog-guide.md**: 公開デバイスカタログ設定ガイド
- **docs/phase8-implementation-report.md**: Phase 8実装レポート
- **docs/phase8-9-implementation-report.md**: Phase 8&9実装レポート

## 4. 技術仕様

### カスタム商品データ構造（UserDevice.customProductData）
```typescript
interface CustomProductData {
  title: string;                    // 商品名
  description?: string;             // 商品説明
  imageUrl: string;                 // OGメタデータから取得した画像
  amazonUrl: string;                // 元のAmazonURL
  userAffiliateUrl?: string;        // ユーザーのアソシエイトID付きURL
  asin: string;                     // Amazon商品識別子
  category: string;                 // "mouse", "keyboard"
  attributes?: Record<string, any>; // カテゴリ別属性
  addedByUserId: string;            // 追加したユーザーID
  potentialForPromotion: boolean;   // 昇格候補フラグ
  createdAt: string;                // ISO文字列
}
```

### 環境変数設定
```env
# Amazon PA-API設定（管理者用）
AMAZON_ACCESS_KEY=your-access-key
AMAZON_SECRET_KEY=your-secret-key
ADMIN_AMAZON_ASSOCIATE_ID=your-admin-associate-id-22
```

## 5. 未実装機能（Phase 10以降）

### Phase 10: ユーザープロフィール改善 🚧 **実装予定**
**目的**: プロフィールページをより魅力的にし、SNS共有を促進

**実装内容**:
1. **プロフィール強化**
   - デバイスセットアップのビジュアル表示
   - 総額表示（オプション）
   - デバイス遍歴タイムライン
   
2. **SNS共有機能**
   - OGP画像の動的生成
   - 共有用URLの生成
   - X(Twitter)、Discord向け最適化
   
3. **エクスポート機能**
   - セットアップリストのPDF出力
   - 画像としてダウンロード

**必要な実装ファイル**:
- `app/(handle)/[handle]/device/setup/page.tsx` - ビジュアルセットアップ表示
- `app/api/og/device-setup/route.tsx` - OGP画像生成
- `lib/utils/device-export.ts` - エクスポート処理

## 6. 技術アーキテクチャ

### 商品情報取得の仕組み
- **管理者**: PA-API使用（実装済み: lib/services/amazon/pa-api.ts）
- **ユーザー**: OGメタデータ取得（実装済み: lib/services/amazon/og-metadata.ts）
- **公開版**: キャッシュ付きデータ取得（lib/actions/public-product-actions.ts）

## 7. 公開デバイスカタログの特徴

### アクセスURL
- メインページ: `/device`
- カテゴリ別: `/device?category=mouse`
- 検索: `/device?search=キーワード`

### キャッシュ戦略
- 商品一覧: 5分間
- カテゴリ一覧: 1時間
- 人気商品: 10分間
- unstable_cacheを使用した最適化

### ユーザー体験
- 未認証ユーザーも利用可能
- レスポンシブデザイン
- 人気商品ランキング表示
- 使用者数の可視化

## 8. ディレクトリ構造

### ディレクトリ構造
```
app/
├── (admin)/admin/        # 管理者用ダッシュボード
│   └── devices/          # デバイス管理
│       └── promotion/    # 昇格候補管理
├── (user)/user/          # ユーザー用ダッシュボード
│   ├── devices/          # デバイス管理
│   └── favorites/        # お気に入り管理
├── (handle)/[handle]/    # プロフィールページ
│   └── device/           # デバイス表示
├── (device)/             # 公開デバイスカタログ
│   └── device/           # カタログページ
└── api/
    ├── devices/          # デバイスAPI
    └── admin/
        └── scheduled-update/ # 定期更新API

lib/
├── services/amazon/      # Amazon関連サービス
├── utils/amazon/         # Amazonユーティリティ
├── actions/              # サーバーアクション
└── validation/           # バリデーション

components/
├── devices/              # デバイス関連共有コンポーネント
└── admin/
    └── promotion/        # 昇格機能関連コンポーネント

types/
└── device/               # デバイス関連型定義
```

## 9. 昇格機能の仕様

### 昇格候補の取得ロジック
1. カスタム商品をASIN別にグループ化
2. 既存の公式商品と重複するASINを除外
3. 追加ユーザー数でソート
4. 管理者が選択して公式商品に昇格

```typescript
// 昇格時の処理フロー
// 1. CustomProductDataからProductレコードを作成
// 2. 関連するUserDeviceのdeviceTypeをOFFICIALに変更
// 3. productIdを設定し、customProductDataをnullに
```

## 10. マイグレーション手順

```bash
# 1. マイグレーションファイル生成
npx prisma migrate dev --name add_device_management

# 2. 初期データ投入
npx tsx prisma/seed-device.ts
```

## 11. 今後の拡張可能性（Phase 10以降）

- カテゴリ追加（ヘッドセット、マイク等）
- 商品レビュー機能
- ユーザー間でのセットアップ共有
- 商品価格トラッキング
- より詳細な属性フィルタリング
- 価格変動通知（お気に入り商品）
- 在庫復活通知
- お気に入りのエクスポート機能
