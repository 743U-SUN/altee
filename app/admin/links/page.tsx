'use client'

import { useState, Suspense, lazy } from 'react'
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from "@/components/ui/skeleton"

// 重いコンポーネントを遅延ロード
const ServiceManager = lazy(() => import('./components/ServiceManager').then(module => ({ default: module.ServiceManager })));
const IconManager = lazy(() => import('./components/IconManager').then(module => ({ default: module.IconManager })));

// スケルトンローダー
const AdminLinksSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminLinksPage() {
  const [activeTab, setActiveTab] = useState('services')
  const { data: session, status } = useSession();

  // Loading state - セキュリティガイド準拠
  if (status === 'loading') {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <AdminLinksSkeleton />
      </div>
    );
  }

  // Unauthenticated state - セキュリティガイド準拠
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold">リンク管理</h1>
        <p className="text-gray-600 mt-2">ログインが必要です。</p>
      </div>
    );
  }

  // Admin role check - 管理者権限チェック
  if (session.user.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold">リンク管理</h1>
        <p className="text-gray-600 mt-2">管理者権限が必要です。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">リンク管理</h1>
        <p className="text-gray-600">
          SNSサービスの設定とアイコンの管理を行います
        </p>
      </div>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">サービス管理</TabsTrigger>
          <TabsTrigger value="icons">アイコン管理</TabsTrigger>
        </TabsList>

        {/* サービス管理タブ */}
        <TabsContent value="services" className="space-y-6">
          <Suspense fallback={<AdminLinksSkeleton />}>
            <ServiceManager />
          </Suspense>
        </TabsContent>

        {/* アイコン管理タブ */}
        <TabsContent value="icons" className="space-y-6">
          <Suspense fallback={<AdminLinksSkeleton />}>
            <IconManager />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}