'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { promoteCustomProduct } from '@/lib/actions/promotion-actions'
import { toast } from 'sonner'
import { Users, Calendar, ArrowUp, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'

interface PromotionCandidateCardProps {
  candidate: {
    asin: string
    title: string
    imageUrl: string
    amazonUrl: string
    category: string
    userCount: number
    users: Array<{
      id: string
      name: string | null
      handle: string | null
      iconUrl: string | null
    }>
    firstAdded: Date
    lastAdded: Date
  }
  onPromote?: () => void
}

export function PromotionCandidateCard({ candidate, onPromote }: PromotionCandidateCardProps) {
  const [isPromoting, setIsPromoting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handlePromote = async () => {
    setIsPromoting(true)
    try {
      const result = await promoteCustomProduct(candidate.asin)
      
      if (result.success) {
        toast.success(result.message)
        setShowConfirmDialog(false)
        onPromote?.()
      } else {
        toast.error(result.error || '昇格に失敗しました')
      }
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setIsPromoting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{candidate.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {candidate.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ASIN: {candidate.asin}
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isPromoting}
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              昇格
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={candidate.imageUrl}
              alt={candidate.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{candidate.userCount}人が使用中</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(candidate.firstAdded), 'yyyy年M月d日', { locale: ja })}〜
                {format(new Date(candidate.lastAdded), 'yyyy年M月d日', { locale: ja })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={candidate.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Amazonで見る
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t">
          <div className="flex items-center gap-2 w-full overflow-hidden">
            <span className="text-sm text-muted-foreground shrink-0">使用者:</span>
            <div className="flex -space-x-2 overflow-hidden">
              {candidate.users.slice(0, 5).map((user) => (
                <Link
                  key={user.id}
                  href={`/${user.handle}`}
                  className="relative hover:z-10 transition-all"
                >
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={user.iconUrl || undefined} />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.handle?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ))}
              {candidate.users.length > 5 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  +{candidate.users.length - 5}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>商品を昇格しますか？</DialogTitle>
            <DialogDescription>
              「{candidate.title}」を公式商品に昇格します。
              {candidate.userCount}人のユーザーのデバイスが自動的に公式商品に切り替わります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPromoting}
            >
              キャンセル
            </Button>
            <Button
              onClick={handlePromote}
              disabled={isPromoting}
            >
              {isPromoting ? '処理中...' : '昇格する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
