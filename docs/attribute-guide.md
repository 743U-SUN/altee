# 属性管理システムガイド

## 概要

このドキュメントでは、alteeプロジェクトの属性管理システムについて説明します。以前はJSON形式で属性を管理していましたが、より効率的で拡張性の高いリレーショナルデータベース構造に移行しました。

## 属性の分類

### 横断的属性（Cross-cutting Attributes）
すべての製品カテゴリーに共通して適用される属性です。現在実装済み：
- **メーカー（Manufacturer）**: Logicool、Razer、SteelSeriesなど
- **シリーズ（Series）**: G PRO、MX Master、DeathAdderなど
- **カラー（Color）**: ブラック、ホワイト、ピンクなど

### 縦断的属性（Category-specific Attributes）
特定の製品カテゴリーにのみ適用される属性です：
- **マウス**: DPI、重量、センサータイプなど
- **キーボード**: レイアウト、スイッチタイプ、サイズなど

## データベース構造の変更

### 移行前（JSON形式）

```prisma
model Product {
  attributes  Json?  // すべての属性をJSON形式で保存
}

model ProductAttribute {
  id          Int      @id @default(autoincrement())
  productId   Int
  key         String
  value       String
  // ...
}
```

### 移行後（リレーショナル構造）

```prisma
// メーカーマスタ
model Manufacturer {
  id          Int       @id @default(autoincrement())
  name        String    @unique  // 例: "Logicool", "Razer"
  slug        String    @unique  // 例: "logicool", "razer"
  description String?
  logoUrl     String?
  website     String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  products    Product[]
  series      Series[]
}

// シリーズマスタ
model Series {
  id             Int          @id @default(autoincrement())
  manufacturerId Int
  name           String       // 例: "G PRO", "MX Master"
  slug           String       // 例: "g-pro", "mx-master"
  description    String?
  isActive       Boolean      @default(true)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  manufacturer   Manufacturer @relation(fields: [manufacturerId], references: [id])
  products       Product[]
  
  @@unique([manufacturerId, slug])
}

// カラーマスタ
model Color {
  id          Int      @id @default(autoincrement())
  name        String   @unique  // 例: "ブラック", "ホワイト"
  nameEn      String   @unique  // 例: "Black", "White"
  hexCode     String?  // 例: "#000000", "#FFFFFF"
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  productColors ProductColor[]
}

// 商品とカラーの中間テーブル
model ProductColor {
  id        Int      @id @default(autoincrement())
  productId Int
  colorId   Int
  imageUrl  String?  // カラー別の商品画像
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  color     Color    @relation(fields: [colorId], references: [id])
  
  @@unique([productId, colorId])
}

// マウス属性
model MouseAttributes {
  id                Int      @id @default(autoincrement())
  productId         Int      @unique
  dpi               Int?     // 最大DPI
  weight            Float?   // 重量（グラム）
  wireless          Boolean  @default(false)
  batteryLife       Int?     // バッテリー寿命（時間）
  sensorType        String?  // センサー型番
  switchType        String?  // スイッチ型番
  pollingRate       Int?     // ポーリングレート（Hz）
  buttonCount       Int?     // ボタン数
  rgbLighting       Boolean  @default(false)
  onboardMemory     Boolean  @default(false)
  wirelessType      String?  // "2.4GHz", "Bluetooth", "Both"
  cableLength       Float?   // ケーブル長（メートル）
  
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

// キーボード属性
model KeyboardAttributes {
  id                Int      @id @default(autoincrement())
  productId         Int      @unique
  layout            String?  // "US", "JIS", "UK" など
  size              String?  // "Full", "TKL", "60%", "65%", "75%" など
  switchType        String?  // スイッチタイプ（メカニカルなど）
  switchBrand       String?  // Cherry MX, Kailh など
  hotSwappable      Boolean  @default(false)
  wireless          Boolean  @default(false)
  batteryLife       Int?     // バッテリー寿命（時間）
  backlighting      String?  // "None", "White", "RGB"
  keycapMaterial    String?  // "ABS", "PBT", "POM"
  connectionType    String?  // "USB-C", "USB-A", "Bluetooth", "2.4GHz"
  pollingRate       Int?     // ポーリングレート（Hz）
  nkro              Boolean  @default(false) // N-Key Rollover
  
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

## 管理画面の構成

### 属性管理トップ (`/admin/attributes`)

メーカー管理とシリーズ管理への導線を提供するランディングページです。

### メーカー管理 (`/admin/attributes/manufacturers`)

- メーカーの一覧表示、検索、フィルタリング
- メーカーの作成、編集、削除
- ロゴのアップロード機能（WebP形式に自動変換）
- 公式サイトリンクの管理
- 有効/無効の切り替え

### シリーズ管理 (`/admin/attributes/series`)

- シリーズの一覧表示（メーカー別）
- シリーズの作成、編集、削除
- メーカーとの関連付け
- 有効/無効の切り替え

### カラー管理 (`/admin/attributes/colors`)

- カラーの一覧表示、検索
- カラーの作成、編集、削除
- カラーコード（HEX）の管理
- ドラッグ＆ドロップによる並び順変更
- 有効/無効の切り替え

## API エンドポイント

### メーカー管理
- `GET /api/admin/manufacturers` - メーカー一覧取得
- `POST /api/admin/manufacturers` - メーカー作成
- `PUT /api/admin/manufacturers/[id]` - メーカー更新
- `DELETE /api/admin/manufacturers/[id]` - メーカー削除

### シリーズ管理
- `GET /api/admin/series` - シリーズ一覧取得
- `POST /api/admin/series` - シリーズ作成
- `PUT /api/admin/series/[id]` - シリーズ更新
- `DELETE /api/admin/series/[id]` - シリーズ削除

### カラー管理
- `GET /api/admin/colors` - カラー一覧取得
- `POST /api/admin/colors` - カラー作成
- `PUT /api/admin/colors/[id]` - カラー更新
- `DELETE /api/admin/colors/[id]` - カラー削除
- `PUT /api/admin/colors/reorder` - カラー並び順更新

### 画像アップロード
- `POST /api/upload/attribute-logo` - ロゴアップロード（200x200pxにリサイズ、WebP変換）
- `DELETE /api/upload/attribute-logo` - ロゴ削除

## データの整合性

### 削除制約
- メーカーに商品が関連付けられている場合、削除不可
- シリーズに商品が関連付けられている場合、削除不可
- エラーメッセージで関連商品数を表示

### ユニーク制約
- メーカー名とスラッグは全体でユニーク
- シリーズ名とスラッグは同一メーカー内でユニーク

## 使用例

### 商品登録時のフロー

1. メーカーを選択（または新規作成）
2. シリーズを選択（または新規作成）
3. カテゴリー別の属性を入力
   - マウス: DPI、重量、ワイヤレス、バッテリー寿命など
   - キーボード: レイアウト、サイズ、スイッチタイプなど

### データ構造の利点

1. **正規化**: 重複データの削減
2. **型安全性**: 各属性に適切な型を定義
3. **検索性能**: インデックスを活用した高速検索
4. **拡張性**: 新しいカテゴリーの追加が容易
5. **データ整合性**: 外部キー制約による整合性保証

## 今後の拡張予定

- ヘッドセット属性テーブルの追加
- マイク属性テーブルの追加
- Webカメラ属性テーブルの追加
- 属性の一括インポート/エクスポート機能
- 属性テンプレート機能

## 移行時の注意点

既存のJSON属性データがある場合は、以下の手順で移行します：

1. 既存データのバックアップ
2. メーカー・シリーズマスタの作成
3. カテゴリー別属性テーブルへのデータ移行
4. 旧属性フィールドの削除

## 関連ドキュメント

- [デバイス管理ガイド](./device-manager-guide.md)
- [画像アップロードガイド](./image-upload-guide.md)
- [公開デバイスカタログガイド](./public-device-catalog-guide.md)