import { Suspense } from 'react'
import { 
  getCustomProductStatistics, 
  getCategoryStatistics 
} from '@/lib/actions/promotion-actions'
import { PromotionCandidateCard } from '@/components/admin/promotion/PromotionCandidateCard'
import { PromotionStats } from '@/components/admin/promotion/PromotionStats'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default async function PromotionPage({
  searchParams
}: {
  searchParams: { category?: string; search?: string; sort?: string }
}) {
  // データ取得
  const [statisticsResult, categoryStatsResult] = await Promise.all([
    getCustomProductStatistics(),
    getCategoryStatistics()
  ])

  if (!statisticsResult.success || !categoryStatsResult.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">データの取得に失敗しました</p>
        </div>
      </div>
    )
  }

  let candidates = statisticsResult.data || []
  const categoryStats = categoryStatsResult.data || []

  // フィルタリング
  if (searchParams.category && searchParams.category !== 'all') {
    candidates = candidates.filter(c => c.category === searchParams.category)
  }

  if (searchParams.search) {
    const searchLower = searchParams.search.toLowerCase()
    candidates = candidates.filter(c => 
      c.title.toLowerCase().includes(searchLower) ||
      c.asin.toLowerCase().includes(searchLower)
    )
  }

  // ソート
  if (searchParams.sort === 'recent') {
    candidates.sort((a, b) => b.lastAdded.getTime() - a.lastAdded.getTime())
  } else if (searchParams.sort === 'oldest') {
    candidates.sort((a, b) => a.firstAdded.getTime() - b.firstAdded.getTime())
  }
  // デフォルトはユーザー数順（既にソート済み）

  // 複数ユーザーが使用している商品のみを昇格候補とする
  const promotionCandidates = candidates.filter(c => c.userCount >= 2)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link 
          href="/admin/devices" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          デバイス管理に戻る
        </Link>
        
        <h1 className="text-3xl font-bold">昇格候補管理</h1>
        <p className="text-muted-foreground mt-2">
          複数のユーザーが使用しているカスタム商品を公式商品に昇格できます
        </p>
      </div>

      {/* 統計情報 */}
      <PromotionStats 
        categoryStats={categoryStats}
        totalCustomProducts={candidates.length}
        totalPromotionCandidates={promotionCandidates.length}
      />

      {/* フィルター */}
      <div className="flex flex-col sm:flex-row gap-4 my-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              name="search"
              placeholder="商品名またはASINで検索..."
              defaultValue={searchParams.search}
              className="pl-10"
            />
            <input type="hidden" name="category" value={searchParams.category} />
            <input type="hidden" name="sort" value={searchParams.sort} />
          </form>
        </div>
        
        <div className="flex gap-2">
          <form className="flex gap-2">
            <input type="hidden" name="search" value={searchParams.search} />
            
            <Select name="category" defaultValue={searchParams.category || 'all'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {categoryStats.map(cat => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select name="sort" defaultValue={searchParams.sort || 'users'}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="並び順" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="users">ユーザー数順</SelectItem>
                <SelectItem value="recent">最近追加順</SelectItem>
                <SelectItem value="oldest">古い順</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" size="icon" variant="secondary">
              <Filter className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* 昇格候補一覧 */}
      {promotionCandidates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchParams.search || searchParams.category
              ? '条件に一致する昇格候補がありません'
              : '昇格候補となる商品がありません（2人以上が使用している商品が対象）'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promotionCandidates.map((candidate) => (
            <PromotionCandidateCard
              key={candidate.asin}
              candidate={candidate}
            />
          ))}
        </div>
      )}

      {/* 単一ユーザーの商品（参考表示） */}
      {candidates.filter(c => c.userCount === 1).length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            単一ユーザーのカスタム商品（参考）
          </h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 opacity-60">
            {candidates
              .filter(c => c.userCount === 1)
              .slice(0, 12)
              .map(item => (
                <div key={item.asin} className="bg-muted rounded-lg p-4">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.category} • 1人が使用
                  </p>
                </div>
              ))}
          </div>
          {candidates.filter(c => c.userCount === 1).length > 12 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              他 {candidates.filter(c => c.userCount === 1).length - 12} 件
            </p>
          )}
        </div>
      )}
    </div>
  )
}
