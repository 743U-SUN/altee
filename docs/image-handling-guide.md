# 画像表示の実装ガイド

このプロジェクトでの画像表示の実装方法と使い分けについて説明します。

## 基本的な考え方

- **開発環境（Docker + MinIO）**: 画像最適化を無効化してネットワーク問題を回避
- **本番環境（さくらオブジェクトストレージ）**: 画像最適化機能をフル活用

## 実装方法

### ✅ **推奨: OptimizedImageコンポーネントを使用**

```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

// 基本的な使い方
<OptimizedImage 
  src="/path/to/image.jpg"
  alt="画像の説明"
  width={300}
  height={200}
/>

// fillプロパティを使う場合
<div className="relative w-full h-64">
  <OptimizedImage 
    src="/path/to/image.jpg"
    alt="画像の説明"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>
```

### 🔄 **代替手段: 通常のNext.js Image（特別な制御が必要な場合）**

```tsx
import Image from 'next/image';

<Image 
  src="/path/to/image.jpg"
  alt="画像の説明"
  width={300}
  height={200}
  unoptimized={process.env.NODE_ENV === 'development'}
/>
```

## OptimizedImageコンポーネントの特徴

### 🎯 **自動環境切替**
- **開発環境**: `unoptimized={true}` が自動適用
- **本番環境**: Next.jsの画像最適化機能が自動適用

### 🛠 **使用可能なプロパティ**
- Next.js Imageの全プロパティをサポート
- `forceUnoptimized?: boolean` - 強制的に最適化を無効にする（通常は不要）

### 📋 **型安全性**
- TypeScriptの型チェックをフル活用
- Next.js Imageと同じインターフェース

## 本番環境での設定

### next.config.ts の設定例
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // さくらオブジェクトストレージ
      {
        protocol: 'https',
        hostname: 'your-bucket-name.sakurastorage.jp',
        pathname: '/**',
      },
      // 開発環境用MinIO
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
};
```

### 環境変数での画像URL管理
```bash
# .env.local
NEXT_PUBLIC_IMAGE_BASE_URL=https://your-bucket-name.sakurastorage.jp

# .env.development
NEXT_PUBLIC_IMAGE_BASE_URL=http://localhost:9000
```

## 技術的背景

### 🔧 **開発環境の問題**
- **Docker内のNext.js** → `localhost:9000` にアクセス不可
- **ブラウザ** → `localhost:9000` にアクセス可能
- **解決策**: 開発環境では画像最適化を無効化

### 🚀 **本番環境の利点**
- **さくらVPS** ↔ **さくらオブジェクトストレージ** 間の転送料金無料
- **Amazon S3互換API**でNext.js画像最適化機能をフル活用
- **CORS設定**でブラウザからの直接アクセスも可能

## 使い分けガイドライン

| 用途 | 推奨方法 | 理由 |
|------|----------|------|
| **新規開発** | `OptimizedImage` | 環境切替が自動、記述が簡潔 |
| **ユーザーアップロード画像** | `OptimizedImage` | 外部ストレージ対応 |
| **既存コード修正** | `unoptimized`属性追加 | 最小限の変更で対応 |
| **静的画像（public/**）** | 通常の`Image` | 最適化の問題なし |

## 実装済みの場所

- `app/(handle)/[handle]/components/HandleSidebar.tsx` - ユーザーサイドバー画像表示

## 注意事項

1. **sizesプロパティ**: レスポンシブ対応で必須
2. **alt属性**: アクセシビリティのため必須
3. **aspect-ratio**: CSSでアスペクト比を固定推奨
4. **loading**: 必要に応じて`lazy`や`eager`を指定

## トラブルシューティング

### 画像が表示されない場合
1. **開発者ツールのコンソール**でエラーを確認
2. **next.config.ts**のremotePatternsを確認
3. **画像URL**が正しいかチェック
4. **Docker環境**の場合は`OptimizedImage`を使用しているか確認

### パフォーマンス問題がある場合
1. **sizesプロパティ**が適切に設定されているか確認
2. **画像形式**をWebP/AVIFに最適化（本番環境で自動実行）
3. **CDN**の活用を検討（さくらのウェブアクセラレータなど）
