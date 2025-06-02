# セキュリティガイドライン

このガイドでは3層認証アーキテクチャによるセキュリティ実装を説明します。

## 1. Middleware: 粗い判定で基本保護

ルートレベルでの基本認証チェック。パフォーマンス最適化とUX向上が目的。

```typescript
// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const protectedPaths = ['/user', '/admin'];
  const isProtected = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );
  
  // 粗い認証チェックのみ
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/user/:path*', '/admin/:path*']
};
```

## 2. Layout: 詳細判定で状態管理

詳細な認証・認可チェックと状態に応じたリダイレクト。

```typescript
// app/user/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({ children }) {
  const session = await auth();
  
  // ガード節で詳細チェック
  if (!session?.user?.email) redirect('/login');
  if (!session.user.isActive) redirect('/suspended');
  if (!session.user.hasCompletedOnboarding) redirect('/welcome');
  
  return (
    <div className="user-layout">
      {children}
    </div>
  );
}
```

## 3. Page: 最終判定で特別な権限チェック

ページ固有の権限チェック。セキュリティの最後の砦。

```typescript
// app/user/sensitive/page.tsx
import { auth } from "@/auth";

export default async function SensitivePage() {
  const session = await auth();
  
  // 特別な権限チェック（Layout通過後でも再確認）
  if (!session?.user?.hasSpecialPermission) {
    return (
      <div className="error-page">
        <p>この機能には特別な権限が必要です</p>
      </div>
    );
  }
  
  return <SensitiveContent />;
}
```

## 4. Server側: 信頼できる認証情報で重要処理

Server Actions での厳格な認証チェック。

```typescript
// lib/actions/user-actions.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  
  // ガード節で認証チェック
  if (!session?.user?.id) {
    throw new Error('認証が必要です');
  }
  
  // 権限チェック（リクエスト者と操作対象の一致確認）
  const targetUserId = formData.get('userId') as string;
  if (session.user.id !== targetUserId) {
    throw new Error('他のユーザーのデータは変更できません');
  }
  
  // データベース操作
  return await prisma.user.update({
    where: { id: session.user.id },
    data: { /* 更新データ */ }
  });
}
```

## 5. Client側: UX最適化とリアルタイム更新

Client Components でのユーザーフレンドリーな認証処理。

```typescript
// components/UserProfile.tsx
"use client";
import { useSession } from "next-auth/react";

export function UserProfile() {
  const { data: session, status } = useSession();
  
  // Loading state
  if (status === 'loading') {
    return <div>読み込み中...</div>;
  }
  
  // Unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="login-prompt">
        <p>ログインが必要です</p>
        <LoginButton />
      </div>
    );
  }
  
  // Authenticated state
  return (
    <div className="user-profile">
      <h1>こんにちは、{session.user.name}さん</h1>
      {/* ユーザー情報表示 */}
    </div>
  );
}
```

## 6. エラー処理: 段階的なフォールバック

認証エラーの段階的処理とユーザーへの適切なフィードバック。

```typescript
// lib/auth/error-handler.ts
export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function handleAuthenticatedAction<T>(
  action: () => Promise<T>
): Promise<T> {
  try {
    const session = await auth();
    if (!session) throw new AuthError('認証が必要です', 'UNAUTHENTICATED');
    
    const user = await getUser(session.user.id);
    if (!user.isActive) throw new AuthError('アカウントが無効です', 'INACTIVE');
    
    return await action();
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.code) {
        case 'UNAUTHENTICATED':
          redirect('/login?error=' + encodeURIComponent(error.message));
        case 'INACTIVE':
          redirect('/suspended');
        default:
          redirect('/error');
      }
    }
    throw error; // その他はError Boundaryに委譲
  }
}
```

## 7. キャッシュ: パフォーマンス最適化

認証情報のキャッシュ戦略とセキュリティの両立。

```typescript
// lib/auth/cache.ts
import { unstable_cache } from 'next/cache';

export const getUserProfile = unstable_cache(
  async (userId: string) => {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });
  },
  ['user-profile'],
  { 
    revalidate: 300, // 5分キャッシュ
    tags: [`user-${userId}`] // ユーザー固有のタグ
  }
);

// キャッシュ無効化
export async function invalidateUserCache(userId: string) {
  revalidateTag(`user-${userId}`);
}
```

## セキュリティチェックリスト

### Middleware
- [ ] 保護されたルートの定義
- [ ] 基本認証チェックの実装
- [ ] 適切なリダイレクト処理

### Layout
- [ ] 詳細な認証状態確認
- [ ] ユーザー状態に応じたリダイレクト
- [ ] 共通レイアウト提供

### Page/Server Actions
- [ ] ページ固有の権限チェック
- [ ] CSRF対策の実装
- [ ] 最小権限の原則遵守
- [ ] 入力値検証

### エラー処理
- [ ] 段階的なエラーハンドリング
- [ ] ユーザーフレンドリーなエラーメッセージ
- [ ] 適切なログ出力

### キャッシュ
- [ ] センシティブデータの適切なキャッシュ期間
- [ ] キャッシュ無効化戦略
- [ ] セキュリティを損なわないキャッシュ設計

## 実装時の注意点

1. **認証情報の信頼性**: Server側では常に `auth()` を使用
2. **権限の最小化**: 必要最小限の権限のみ付与
3. **入力値検証**: クライアント・サーバー両方で実施
4. **エラー情報**: セキュリティに関わる詳細情報の漏洩防止
5. **ログ記録**: セキュリティイベントの適切な記録