"use client"

import { useSession } from "next-auth/react"
import { Suspense, lazy } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// 重いInfoCategoryManagerを遅延ロード
const InfoCategoryManager = lazy(() => import("./components/InfoCategoryManager").then(module => ({ default: module.InfoCategoryManager })));

// InfoCategoryManagerのスケルトンローダー
const InfoManagerSkeleton = () => (
  <div className="py-4">
    <div className="mb-6">
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
          <Skeleton className="h-3 w-3/6" />
        </div>
      </div>
    </div>
    
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <div className="ml-auto">
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
    
    <div className="flex justify-center mt-6">
      <Skeleton className="h-10 w-64" />
    </div>
  </div>
);

export default function InfoPage() {
  const { data: session, status } = useSession();

  // Loading state - セキュリティガイド準拠
  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8 px-0 md:px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">インフォ設定</h1>
        <InfoManagerSkeleton />
      </div>
    );
  }

  // Unauthenticated state - セキュリティガイド準拠
  if (status === 'unauthenticated' || !session?.user?.id) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">インフォ設定</h1>
        <p className="text-gray-600">ログインが必要です。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-0 md:px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">インフォ設定</h1>
      <Suspense fallback={<InfoManagerSkeleton />}>
        <InfoCategoryManager userId={session.user.id} />
      </Suspense>
    </div>
  );
}
