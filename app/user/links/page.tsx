'use client'

import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// 重いUserLinkManagerを遅延ロード
const UserLinkManager = lazy(() => import('./components/UserLinkManager').then(module => ({ default: module.UserLinkManager })));

// UserLinkManagerのスケルトンローダー（セッション読み込み中も使用）
const LinkManagerSkeleton = () => (
  <div className="space-y-6">
    {/* ヘッダー */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* リンク一覧カード */}
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        
        {/* リンクアイテム */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-4 w-4" /> {/* ドラッグハンドル */}
              <Skeleton className="h-8 w-8 rounded" /> {/* アイコン */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-12" /> {/* スイッチ */}
              <Skeleton className="h-8 w-8" /> {/* メニュー */}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function UserLinkPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<LinkManagerSkeleton />}>
        <UserLinkManager />
      </Suspense>
    </div>
  )
}
