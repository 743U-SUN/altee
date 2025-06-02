"use client"

import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPage() {
  const { data: session, status } = useSession();

  // Loading state - セキュリティガイド準拠
  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card shadow-sm p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Unauthenticated state - セキュリティガイド準拠
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            ログインが必要です。
          </p>
        </div>
      </div>
    );
  }

  // Admin role check - 管理者権限チェック
  if (session.user.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            管理者権限が必要です。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          管理者用ダッシュボードです。
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">記事管理</h3>
          <p className="text-sm text-muted-foreground">記事の作成・編集・削除</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">デバイス管理</h3>
          <p className="text-sm text-muted-foreground">デバイス情報の管理</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">ユーザー管理</h3>
          <p className="text-sm text-muted-foreground">ユーザーアカウントの管理</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">設定</h3>
          <p className="text-sm text-muted-foreground">システム設定</p>
        </div>
      </div>
    </div>
  );
}