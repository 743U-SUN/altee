'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  Users, 
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
  officialCount: number
  customCount: number
}

interface PromotionStatsProps {
  categoryStats: CategoryStat[]
  totalCustomProducts: number
  totalPromotionCandidates: number
}

const categoryIcons: Record<string, any> = {
  mouse: MousePointer,
  keyboard: Keyboard,
  gamepad: Gamepad2,
  headset: Headphones,
  microphone: Mic,
  monitor: Monitor,
}

export function PromotionStats({ 
  categoryStats, 
  totalCustomProducts,
  totalPromotionCandidates 
}: PromotionStatsProps) {
  // カスタム商品の合計
  const totalCustom = categoryStats.reduce((sum, cat) => sum + cat.customCount, 0)
  // 公式商品の合計
  const totalOfficial = categoryStats.reduce((sum, cat) => sum + cat.officialCount, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            昇格候補
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPromotionCandidates}</div>
          <p className="text-xs text-muted-foreground">
            複数ユーザーが使用中の商品
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            カスタム商品総数
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustom}</div>
          <p className="text-xs text-muted-foreground">
            ユーザーが追加した商品
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            公式商品数
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOfficial}</div>
          <p className="text-xs text-muted-foreground">
            管理者が登録した商品
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            昇格率
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalCustom > 0 
              ? Math.round((totalPromotionCandidates / totalCustom) * 100)
              : 0
            }%
          </div>
          <p className="text-xs text-muted-foreground">
            昇格候補の割合
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>カテゴリ別統計</CardTitle>
          <CardDescription>
            各カテゴリの公式商品とカスタム商品の分布
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.map((stat) => {
              const Icon = categoryIcons[stat.slug] || Package
              const total = stat.officialCount + stat.customCount
              const officialPercentage = total > 0 
                ? (stat.officialCount / total) * 100 
                : 0

              return (
                <div key={stat.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{stat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        公式: {stat.officialCount}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        カスタム: {stat.customCount}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={officialPercentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
