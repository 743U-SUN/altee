# 画像アップロード機能実装ガイド

このドキュメントでは、WebP変換機能付きの画像アップロード機能を新規実装する手順を説明します。

> **📝 関連ドキュメント**  
> 既存画像の表示方法については [image-handling-guide.md](./image-handling-guide.md) を参照してください。

SVGファイルは変換せず、[lib/svg-sanitizer.ts](../lib/svg-sanitizer.ts/lib/svg-sanitizer.ts)を使ってそのままアップロードすること。

## 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [実装手順](#実装手順)
4. [ハマりポイントと対処法](#ハマりポイントと対処法)
5. [ベストプラクティス](#ベストプラクティス)
6. [トラブルシューティング](#トラブルシューティング)

## 概要

### 実装される機能
- ドラッグ&ドロップによる画像アップロード
- 自動WebP変換による最適化
- リアルタイムプレビュー
- MinIOへの安全な保存
- データベース連携

### 技術スタック
- Next.js 15 (App Router)
- Sharp (画像処理)
- MinIO (オブジェクトストレージ)
- Prisma (ORM)
- shadcn/ui + TailwindCSS
- react-dropzone

## 前提条件

### 必要な依存関係
```bash
npm install sharp react-dropzone
npm install -D @types/sharp
```

### 環境設定
- Docker環境でMinIOが起動済み
- PostgreSQLデータベースが利用可能
- 画像処理共通ユーティリティ (`lib/image-processing.ts`) が実装済み

## 実装手順

### Step 1: データベースフィールドの追加

**1.1 Prismaスキーマを更新**

```prisma
model User {
  // 既存フィールド...
  iconUrl       String?
  bannerUrl     String?  // ← 新しい画像フィールドを追加
  coverImageUrl String?  // ← 例：カバー画像フィールド
}
```

**1.2 マイグレーションを実行**

```bash
npx prisma migrate dev --name add-cover-image-url
npx prisma generate
```

### Step 2: 画像処理プリセットの追加

**2.1 `lib/image-processing.ts` にプリセットを追加**

```typescript
export const IMAGE_PRESETS = {
  // 既存のプリセット...
  
  // カバー画像用（1200x300、高品質）
  cover: {
    format: 'webp' as const,
    quality: 85,
    effort: 4,
    maxWidth: 1200,
    maxHeight: 300,
    fit: 'inside' as const,
    withoutEnlargement: true,
    lossless: false
  }
} as const;
```

### Step 3: APIエンドポイントの作成

**3.1 ディレクトリ作成**

```bash
mkdir -p app/api/upload/cover
```

**3.2 `app/api/upload/cover/route.ts` を作成**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile, deleteFile } from '@/lib/minio';
import { prisma } from '@/lib/prisma';
import { 
  validateImageFile, 
  processImageWithPreset, 
  generateImageFileName 
} from '@/lib/image-processing';

// ファイルサイズ制限
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  console.log('=== カバー画像アップロードAPI開始 ===');
  
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // FormDataの取得（エラーハンドリング必須）
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formDataError) {
      console.error('FormData パースエラー:', formDataError);
      return NextResponse.json(
        { error: 'リクエストデータの解析に失敗しました' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    // リクエスト検証
    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // ファイル検証
    const validationError = validateImageFile(file, MAX_FILE_SIZE);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // 既存画像の削除
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { coverImageUrl: true } // ← フィールド名を適切に変更
    });

    if (existingUser?.coverImageUrl) {
      try {
        const oldFileName = existingUser.coverImageUrl.split('/').pop();
        if (oldFileName) {
          await deleteFile(`covers/${oldFileName}`);
        }
      } catch (error) {
        console.warn('既存ファイルの削除に失敗:', error);
      }
    }

    // ファイル処理
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // 画像変換（プリセット使用）
    const processedResult = await processImageWithPreset(inputBuffer, 'cover');

    // ファイル名生成
    const fileName = generateImageFileName(userId, 'user-cover', processedResult.outputFormat);

    // MinIOアップロード
    const fileUrl = await uploadFile(
      fileName, 
      processedResult.buffer, 
      processedResult.outputFormat, 
      'covers' // ← 適切なフォルダ名
    );

    // データベース更新
    await prisma.user.update({
      where: { id: userId },
      data: { coverImageUrl: fileUrl } // ← フィールド名を適切に変更
    });

    return NextResponse.json({
      url: fileUrl,
      message: 'カバー画像のアップロードが完了しました',
      details: {
        format: 'webp',
        originalSize: processedResult.originalSize,
        optimizedSize: processedResult.processedSize,
        compressionRatio: processedResult.compressionRatio
      }
    });

  } catch (error) {
    console.error('=== カバー画像アップロードAPIエラー ===', error);
    return NextResponse.json(
      { error: 'サーバー内部エラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coverImageUrl: true }
    });

    if (user?.coverImageUrl) {
      try {
        const fileName = user.coverImageUrl.split('/').pop();
        if (fileName) {
          await deleteFile(`covers/${fileName}`);
        }
      } catch (error) {
        console.warn('ファイル削除エラー:', error);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { coverImageUrl: null }
    });

    return NextResponse.json({
      message: 'カバー画像を削除しました'
    });

  } catch (error) {
    console.error('カバー画像削除エラー:', error);
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    );
  }
}
```

### Step 4: TypeScript型定義の拡張（NextAuth使用時）

**4.1 `types/next-auth.d.ts` を更新**

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      iconUrl?: string;
      bannerUrl?: string;
      coverImageUrl?: string; // ← 新しいフィールドを追加
    } & DefaultSession["user"];
  }
  
  interface User extends DefaultUser {
    iconUrl?: string;
    bannerUrl?: string;
    coverImageUrl?: string; // ← 新しいフィールドを追加
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    iconUrl?: string;
    bannerUrl?: string;
    coverImageUrl?: string; // ← 新しいフィールドを追加
  }
}
```

**4.2 `auth.ts` を更新**

```typescript
// JWT callback
async jwt({ token, user }) {
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        handle: true, 
        role: true, 
        iconUrl: true, 
        bannerUrl: true,
        coverImageUrl: true // ← 追加
      }
    });
    
    if (dbUser) {
      token.coverImageUrl = dbUser.coverImageUrl; // ← 追加
    }
  }
  return token;
},

// Session callback
async session({ session, token }) {
  if (token && session.user) {
    if (token.coverImageUrl) session.user.coverImageUrl = token.coverImageUrl as string; // ← 追加
  }
  return session;
}
```

### Step 5: Reactコンポーネントの作成

**5.1 `app/(user)/user/profile/components/CoverSettings.tsx` を作成**

```typescript
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';
import { Upload, X, Image, Info } from 'lucide-react';
import { toast } from 'sonner';

interface CoverSettingsProps {
  currentCoverUrl?: string;
  userId: string;
  onCoverUpdate?: (newCoverUrl: string) => void;
}

export function CoverSettings({ currentCoverUrl, userId, onCoverUpdate }: CoverSettingsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      try {
        setIsUploading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);

        const response = await fetch('/api/upload/cover', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'レスポンスの解析に失敗' }));
          throw new Error(errorData.error || 'アップロードに失敗しました');
        }

        const result = await response.json();
        onCoverUpdate?.(result.url);
        toast.success('カバー画像を更新しました');
        
      } catch (error) {
        console.error('Cover upload error:', error);
        toast.error('アップロードに失敗しました');
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('ファイルサイズは10MB以下にしてください');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('画像ファイルのみアップロード可能です');
      } else {
        toast.error('無効なファイルです');
      }
    }
  });

  const handleRemoveCover = async () => {
    try {
      setIsUploading(true);
      
      const response = await fetch('/api/upload/cover', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      onCoverUpdate?.('');
      setPreviewUrl(null);
      toast.success('カバー画像を削除しました');
    } catch (error) {
      console.error('Cover delete error:', error);
      toast.error('削除に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const displayCoverUrl = previewUrl || currentCoverUrl;

  return (
    <div className="py-4">
      <div className="mb-4">
        <p className="text-gray-600">
          カバー画像を設定します。JPG、PNG、GIF、WebP形式の画像をアップロードできます（最大10MB）。
        </p>
        <div className="flex items-center gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            アップロードされた画像は自動的にWebP形式に変換され、1200×300px以内にリサイズされます。
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* カバープレビュー */}
        <div className="w-full">
          <p className="text-sm text-gray-500 mb-2">現在のカバー画像</p>
          <div className="relative w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
            {displayCoverUrl ? (
              <OptimizedImage
                src={convertToProxyUrl(displayCoverUrl)}
                alt="カバー画像"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">カバー画像なし</p>
                  <p className="text-xs text-gray-400 mt-1">推奨サイズ: 1200×300px</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* アップロード領域 */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            {isDragActive
              ? 'ファイルをここにドロップ'
              : 'クリックまたはドラッグしてカバー画像をアップロード'
            }
          </p>
          <p className="text-xs text-gray-500">
            WebP形式に自動変換されます（最大10MB）
          </p>
        </div>

        {/* 操作ボタン */}
        {displayCoverUrl && (
          <Button
            variant="outline"
            onClick={handleRemoveCover}
            disabled={isUploading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-2" />
            カバー画像を削除
          </Button>
        )}
        
        {/* アップロード状況 */}
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            カバー画像を変換してアップロード中...
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 6: 親コンポーネントでの使用

**6.1 プロフィールページで状態管理を追加**

```typescript
// page.tsx
const [userCover, setUserCover] = useState<string>('');

useEffect(() => {
  const fetchUserData = async () => {
    if (session?.user?.id) {
      // 既存の処理...
      setUserCover(session.user?.coverImageUrl || '');
    }
  };
  fetchUserData();
}, [session]);

const handleCoverUpdate = (newCoverUrl: string) => {
  setUserCover(newCoverUrl);
};

// JSX内で使用
<CoverSettings 
  currentCoverUrl={userCover}
  userId={session.user.id}
  onCoverUpdate={handleCoverUpdate}
/>
```

### Step 7: 画像表示の実装

**7.1 必須：統一された画像表示方法**

アップロードした画像を表示する際は、必ず以下の方法を使用してください：

```typescript
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';

// ✅ 正しい画像表示方法
<OptimizedImage 
  src={convertToProxyUrl(imageUrl)}
  alt="画像の説明"
  width={300}
  height={200}
  // または fill={true} + 親要素にrelative
/>

// ❌ 間違った方法（直接img使用）
<img src={imageUrl} alt="画像" />
```

**7.2 なぜこの方法が必要か**

1. **Docker環境対応**: MinIO URLを自動的にプロキシ経由に変換
2. **Next.js最適化**: 画像の自動最適化（WebP/AVIF変換、リサイズ）
3. **キャッシュ効率**: 適切なCache-Controlヘッダー設定
4. **環境差異解決**: 開発/本番環境での一貫した動作

**7.3 重要な注意事項**

- `convertToProxyUrl()` はMinIO URLのみを変換、静的画像（/images/...）はそのまま
- `fill={true}` 使用時は親要素に `relative` クラスが必要
- `sizes` プロパティでレスポンシブ最適化を必ず指定

> **📖 詳細情報**  
> 画像表示の詳細な実装パターンやトラブルシューティングについては [image-handling-guide.md](./image-handling-guide.md) を参照してください。

## ハマりポイントと対処法

### 🚨 Critical Issues

#### 1. Next.js 15でのパラメータ処理
**問題**: `params` を直接使用するとエラー
```typescript
// ❌ 間違い
const { userId } = params;

// ✅ 正解
const { userId } = await params;
```

#### 2. FormDataパースエラー
**問題**: FormDataが正常に解析できない
**対処法**: 
- 必ずtry-catchでエラーハンドリング
- Content-Typeヘッダーを手動設定しない（ブラウザに任せる）
- ファイルサイズ制限を確認

```typescript
let formData: FormData;
try {
  formData = await request.formData();
} catch (formDataError) {
  return NextResponse.json(
    { error: 'リクエストデータの解析に失敗しました' },
    { status: 400 }
  );
}
```

#### 3. Sharp ライブラリの設定
**問題**: Docker環境でSharpが動作しない
**対処法**: 
- Dockerfileにネイティブ依存関係を追加
- next.configで外部パッケージ化

```dockerfile
# Dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libc6-dev \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*
```

```typescript
// next.config.ts
experimental: {
  serverComponentsExternalPackages: ['sharp'],
}
```

### ⚠️ Common Issues

#### 4. TypeScript型エラー
**問題**: NextAuth.jsの型定義が不十分
**対処法**: 型定義ファイルを必ず更新

#### 5. 既存ファイルの削除失敗
**問題**: MinIOからの削除でエラーが発生
**対処法**: エラーをキャッチして処理を継続

```typescript
try {
  await deleteFile(`folder/${oldFileName}`);
} catch (error) {
  console.warn('既存ファイルの削除に失敗:', error);
  // 処理は継続
}
```

#### 6. データベース更新の失敗
**問題**: ファイルアップロード後にDB更新が失敗
**対処法**: ロールバック処理を実装

```typescript
try {
  await prisma.user.update({...});
} catch (dbError) {
  // ロールバック: アップロードしたファイルを削除
  try {
    await deleteFile(`folder/${fileName}`);
  } catch (rollbackError) {
    console.error('ロールバック失敗:', rollbackError);
  }
  throw dbError;
}
```

## ベストプラクティス

### セキュリティ
1. **認証チェック**: 必ず最初に実行
2. **権限確認**: ユーザーIDの一致を確認
3. **ファイル検証**: サイズ・形式の厳密なチェック
4. **サニタイゼーション**: ファイル名の安全な生成

### パフォーマンス
1. **WebP変換**: ファイルサイズを大幅削減
2. **リサイズ**: 適切なサイズに制限
3. **圧縮率調整**: 用途に応じた品質設定
4. **プリセット活用**: 一貫した設定

### ユーザビリティ
1. **プレビュー表示**: アップロード前の確認
2. **進行状況表示**: ローディング状態
3. **エラーメッセージ**: わかりやすい説明
4. **ガイドライン表示**: 推奨サイズなどの情報

### メンテナンス性
1. **共通ユーティリティ**: 再利用可能な実装
2. **詳細ログ**: デバッグ情報の充実
3. **型安全性**: TypeScriptの活用
4. **一貫性**: 命名規則の統一

## トラブルシューティング

### よくあるエラーと解決方法

#### Error: "Failed to parse body as FormData"
1. ファイルサイズを確認（制限を超えていないか）
2. Content-Typeヘッダーを手動設定していないか確認
3. FormDataの作成方法を確認

#### 画像が表示されない
> **🔗 関連ガイド**  
> 画像表示に関する問題は [image-handling-guide.md のトラブルシューティング](./image-handling-guide.md#トラブルシューティング) を参照してください。

#### Error: "Route used params.userId without await"
1. 動的パラメータの型定義を `Promise<{}>` に変更
2. `await params` を使用

#### Error: Sharp not found or compilation failed
1. Dockerfileに必要な依存関係を追加
2. next.configでsharpを外部パッケージ化

#### MinIO connection failed
1. Docker Composeが正常に起動しているか確認
2. 環境変数の設定を確認
3. ネットワーク設定を確認

### デバッグ手順

1. **コンソールログの確認**
   - ブラウザのDevtools Console
   - サーバーのDockerログ

2. **ネットワークタブの確認**
   - リクエストヘッダー
   - レスポンス内容
   - ステータスコード

3. **ファイル検証**
   - ファイルサイズ
   - ファイル形式
   - FormDataの内容

4. **データベース確認**
   - Prisma Studio で確認
   - SQLクエリの実行

---

## まとめ

この手順に従うことで、WebP変換機能付きの安全で効率的な画像アップロード機能を実装できます。特にNext.js 15での変更点とハマりポイントを意識することで、スムーズな開発が可能になります。

新しい画像タイプを追加する際は、以下の点を調整してください：
- データベースフィールド名
- APIエンドポイントパス
- MinIOのフォルダ名
- プリセット設定
- コンポーネント名とプロパティ

疑問点や問題が発生した場合は、このドキュメントのトラブルシューティングセクションを参照してください。

---

## 関連ドキュメント

- **[画像表示実装ガイド](./image-handling-guide.md)**: アップロードした画像の表示方法
- **[統一された画像表示パターン](./image-handling-guide.md#実装パターン)**: OptimizedImage + convertToProxyUrlの使用方法
- **[画像表示のトラブルシューティング](./image-handling-guide.md#トラブルシューティング)**: 画像が表示されない場合の対処法
- **[画像キャッシュの仕組み](./image-handling-guide.md#なぜこの方法を使うのか)**: Docker環境での画像配信の背景