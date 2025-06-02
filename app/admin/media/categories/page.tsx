'use client';

import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from 'react';
import { CategoryManager } from '../components/CategoryManager';

function CategoryManagementContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">カテゴリ管理</h2>
        <p className="text-gray-600 mt-2">
          メディアファイルの整理に使用するカテゴリを作成・編集・削除できます。
        </p>
      </div>

      <Suspense fallback={
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }>
        <CategoryManager />
      </Suspense>
    </div>
  );
}

export default function CategoriesPage() {
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
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">カテゴリ管理</h2>
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
          <h2 className="text-2xl font-bold">カテゴリ管理</h2>
          <p className="text-gray-600 mt-2">管理者権限が必要です。</p>
        </div>
      </div>
    );
  }

  return <CategoryManagementContent />;
}