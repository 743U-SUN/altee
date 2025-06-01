import { Suspense } from 'react'
import { getUserFavorites, getFavoriteCategoryStats } from '@/lib/actions/favorite-actions'
import { FavoriteList } from './components/FavoriteList'
import { FavoriteStats } from './components/FavoriteStats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function FavoritesPage() {
  const [favoritesResult, categoryStatsResult] = await Promise.all([
    getUserFavorites(),
    getFavoriteCategoryStats()
  ])

  if (!favoritesResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">お気に入りの取得に失敗しました</p>
        </div>
      </div>
    )
  }

  const favorites = favoritesResult.data || []
  const categoryStats = categoryStatsResult.data || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            お気に入り
          </h1>
          <Link href="/device">
            <Button variant="outline">
              商品を探す
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">
          気になる商品をお気に入りに追加して、後で比較・購入検討ができます
        </p>
      </div>

      {/* タブ */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            お気に入り一覧
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            統計
          </TabsTrigger>
        </TabsList>

        {/* お気に入り一覧タブ */}
        <TabsContent value="list" className="space-y-6">
          <Suspense fallback={<FavoriteListSkeleton />}>
            <FavoriteList favorites={favorites} />
          </Suspense>
        </TabsContent>

        {/* 統計タブ */}
        <TabsContent value="stats" className="space-y-6">
          <FavoriteStats
            totalFavorites={favorites.length}
            categoryStats={categoryStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// スケルトンローダー
function FavoriteListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  )
}
