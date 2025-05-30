# 画像表示の実装ガイド

このプロジェクトでは、環境に依存しない一貫した画像表示を実現するため、統一された実装方法を採用しています。

> **📝 関連ドキュメント**  
> 新しい画像アップロード機能を実装する場合は [image-upload-guide.md](./image-upload-guide.md) を参照してください。

## 基本方針

### 🎯 **すべての画像表示で `OptimizedImage` + `convertToProxyUrl` を使用**

環境（開発/本番）や画像の保存場所（MinIO/オブジェクトストレージ）に関わらず、一貫した方法で画像を表示します。

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';

// ✅ 推奨: すべての画像表示でこの形式を使用
<OptimizedImage 
  src={convertToProxyUrl(imageUrl)}
  alt="画像の説明"
  width={300}
  height={200}
/>
```

## なぜこの方法を使うのか

### 1. **Docker環境での問題を解決**
- Next.jsサーバー（Dockerコンテナ内）は`localhost:9000`（MinIO）にアクセスできない
- プロキシ経由（`/api/images/[...path]`）でアクセスすることで解決

### 2. **環境による差異を吸収**
- `OptimizedImage`が開発環境で自動的に画像最適化を無効化
- 本番環境でも同じコードで動作

### 3. **将来の変更に対応**
- MinIOからさくらオブジェクトストレージへの移行が容易
- Docker構成の変更にも柔軟に対応可能

## 実装パターン

### 1. **MinIO/オブジェクトストレージの画像**

```tsx
// 商品画像
<OptimizedImage 
  src={convertToProxyUrl(product.imageUrl)}
  alt={product.name}
  fill
  className="object-contain"
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// デフォルト画像へのフォールバック
<OptimizedImage 
  src={convertToProxyUrl(imageUrl || '/images/no-image.svg')}
  alt="画像"
  width={100}
  height={100}
/>
```

### 2. **静的画像（public/内）**

```tsx
// ロゴや固定画像
<OptimizedImage 
  src="/images/logo.png"
  alt="ロゴ"
  width={200}
  height={50}
  priority // 重要な画像には priority を付ける
/>
```

### 3. **条件付き表示**

```tsx
// 画像がある場合のみ表示
{imageUrl && (
  <OptimizedImage 
    src={convertToProxyUrl(imageUrl)}
    alt="説明"
    width={100}
    height={100}
  />
)}

// カラーバリエーション（通常のimgタグを使う場合）
{colorImage ? (
  <img
    src={convertToProxyUrl(colorImage)}
    alt="カラー"
    className="w-full h-full object-cover"
  />
) : (
  <div className="bg-gray-100">No Image</div>
)}
```

### 4. **fillプロパティを使用する場合**

```tsx
// 親要素に relative と適切なサイズ指定が必要
<div className="relative w-full h-64">
  <OptimizedImage 
    src={convertToProxyUrl(imageUrl)}
    alt="説明"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>
```

## 重要な注意事項

### 1. **必須プロパティ**
- `alt`: アクセシビリティのため必須
- `width`/`height` または `fill`: レイアウトシフト防止のため必須
- `sizes`: `fill`使用時は必須（レスポンシブ最適化）

### 2. **convertToProxyUrl の使用**
- MinIO URL（`http://localhost:9000`で始まる）は必ず変換
- 静的画像（`/images/...`）はそのまま使用可能
- 外部URL（CDNなど）もそのまま使用可能

### 3. **パフォーマンス最適化**
- ファーストビューの画像には `priority` を付ける
- 適切な `sizes` プロパティでレスポンシブ対応
- `loading="lazy"` はデフォルトで適用される

## トラブルシューティング

### 画像が表示されない場合

1. **コンソールエラーを確認**
   - 404エラー: URLが正しいか確認
   - CORS エラー: プロキシ経由になっているか確認

2. **convertToProxyUrl が適用されているか確認**
   ```tsx
   // デバッグ用
   console.log('Original URL:', imageUrl);
   console.log('Proxy URL:', convertToProxyUrl(imageUrl));
   ```

3. **next.config.ts の設定確認**
   - `remotePatterns` に必要なドメインが含まれているか

### レイアウトシフトが発生する場合

1. **width/height または fill が指定されているか**
2. **fillの場合、親要素に適切なスタイルがあるか**
3. **sizes プロパティが適切に設定されているか**

## 移行ガイド

### 既存のコードを更新する場合

```tsx
// ❌ 変更前
<Image src={product.imageUrl} alt="商品" width={100} height={100} />

// ✅ 変更後
<OptimizedImage 
  src={convertToProxyUrl(product.imageUrl)} 
  alt="商品" 
  width={100} 
  height={100} 
/>
```

### インポートの追加

```tsx
// ファイルの先頭に追加
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';
```

## まとめ

- **すべての画像**で `OptimizedImage` コンポーネントを使用
- **MinIO/オブジェクトストレージの画像**は `convertToProxyUrl` で変換
- **一貫性**を保つことで、環境差異によるバグを防止
- **将来の変更**に柔軟に対応可能な実装

---

## 関連ドキュメント

- **[画像アップロード機能実装ガイド](./image-upload-guide.md)**: 新しい画像アップロード機能を実装する手順
- **[画像処理設定](./image-upload-guide.md#step-2-画像処理プリセットの追加)**: プリセット設定の詳細
- **[API実装例](./image-upload-guide.md#step-3-apiエンドポイントの作成)**: 完全なAPIエンドポイントの実装例