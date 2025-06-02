'use client';

import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from 'react';
import { MediaUploader } from '../components/MediaUploader';

function MediaUploadContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">メディアアップロード</h2>
        <p className="text-gray-600 mt-2">
          画像、動画、SVGアイコンなどをアップロードできます。自動的に最適化されて保存されます。
        </p>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      }>
        <MediaUploader />
      </Suspense>
    </div>
  );
}

export default function MediaUploadPage() {
  const { data: session, status } = useSession();

  // Loading state
  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">メディアアップロード</h2>
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
          <h2 className="text-2xl font-bold">メディアアップロード</h2>
          <p className="text-gray-600 mt-2">管理者権限が必要です。</p>
        </div>
      </div>
    );
  }

  return <MediaUploadContent />;
}