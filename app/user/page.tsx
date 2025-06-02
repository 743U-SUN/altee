"use client"

import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserPage() {
  const { data: session, status } = useSession();

  // Loading state - セキュリティガイド準拠
  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
          <p className="text-muted-foreground">
            ログインが必要です。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
        <p className="text-muted-foreground">
          ユーザー用ダッシュボードです。
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">プロフィール</h3>
          <p className="text-sm text-muted-foreground">プロフィール情報の編集</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">デバイス</h3>
          <p className="text-sm text-muted-foreground">お気に入りデバイスの管理</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">リンク</h3>
          <p className="text-sm text-muted-foreground">ソーシャルリンクの設定</p>
        </div>
      </div>
    </div>
  );
}