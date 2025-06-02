'use client';

import { useSession } from "next-auth/react"
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from 'react';
import { MediaGrid } from './components/MediaGrid';

function MediaDashboardContent() {
  return (
    <div className="space-y-6">
      {/* メディア一覧 */}
      <Suspense fallback={
        <div className="space-y-4">
          <div className="flex gap-4 mb-6">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      }>
        <MediaGrid />
      </Suspense>
    </div>
  );
}

export default function MediaPage() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">メディア管理</h1>
          <p className="text-gray-600 mt-2">ログインが必要です。</p>
        </div>
      </div>
    );
  }

  // Admin role check
  if (session.user.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">メディア管理</h1>
          <p className="text-gray-600 mt-2">管理者権限が必要です。</p>
        </div>
      </div>
    );
  }

  return <MediaDashboardContent />;
}