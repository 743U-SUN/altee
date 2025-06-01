'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Heart,
  Package,
  TrendingUp,
  MousePointer,
  Keyboard,
  Gamepad2,
  Headphones,
  Mic,
  Monitor
} from 'lucide-react'

interface CategoryStat {
  id: number
  name: string
  slug: string
  count: number
}

interface FavoriteStatsProps {
  totalFavorites: number
  categoryStats: CategoryStat[]
}

const categoryIcons: Record<string, any> = {
  mouse: MousePointer,
  keyboard: Keyboard,
  gamepad: Gamepad2,
  headset: Headphones,
  microphone: Mic,
  monitor: Monitor,
}

export function FavoriteStats({ totalFavorites, categoryStats }: FavoriteStatsProps) {
  const maxCount = Math.max(...categoryStats.map(s => s.count), 1)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 総お気に入り数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            お気に入り総数
          </CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFavorites}</div>
          <p className="text-xs text-muted-foreground">
            登録されているお気に入り
          </p>
        </CardContent>
      </Card>

      {/* カテゴリ数 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            カテゴリ数
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categoryStats.length}</div>
          <p className="text-xs text-muted-foreground">
            お気に入りに含まれるカテゴリ
          </p>
        </CardContent>
      </Card>

      {/* カテゴリ別分布 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>カテゴリ別分布</CardTitle>
          <CardDescription>
            お気に入りに登録されている商品のカテゴリ分布
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoryStats.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              まだお気に入りがありません
            </p>
          ) : (
            <div className="space-y-4">
              {categoryStats.map((stat) => {
                const Icon = categoryIcons[stat.slug] || Package
                const percentage = (stat.count / maxCount) * 100

                return (
                  <div key={stat.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stat.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stat.count}件
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* お気に入りのヒント */}
      <Card className="md:col-span-2 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            お気に入りを活用しよう
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 気になる商品をお気に入りに追加して、後でじっくり比較できます</li>
            <li>• 最大5個まで同時に比較可能です</li>
            <li>• 価格や在庫の変動があった際に通知を受け取れます（今後実装予定）</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
