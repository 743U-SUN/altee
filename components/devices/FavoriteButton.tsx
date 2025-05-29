'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/lib/actions/favorite-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  productId: number
  initialFavorited?: boolean
  showLabel?: boolean
  size?: 'sm' | 'default' | 'lg' | 'icon'
  variant?: 'default' | 'ghost' | 'outline'
  className?: string
  onToggle?: (isFavorited: boolean) => void
}

export function FavoriteButton({
  productId,
  initialFavorited = false,
  showLabel = false,
  size = 'icon',
  variant = 'ghost',
  className,
  onToggle
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleFavorite(productId)
        
        if (result.success) {
          setIsFavorited(result.isFavorited)
          onToggle?.(result.isFavorited)
          
          // トーストは控えめに
          if (result.isFavorited) {
            toast.success('お気に入りに追加しました', {
              duration: 2000,
            })
          } else {
            toast.success('お気に入りから削除しました', {
              duration: 2000,
            })
          }
        } else {
          toast.error(result.error || 'エラーが発生しました')
        }
      } catch (error) {
        toast.error('エラーが発生しました')
      }
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'transition-all',
        isFavorited && 'text-red-500 hover:text-red-600',
        className
      )}
      aria-label={isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <Heart
        className={cn(
          'transition-all',
          size === 'sm' && 'h-4 w-4',
          size === 'default' && 'h-5 w-5',
          size === 'lg' && 'h-6 w-6',
          size === 'icon' && 'h-5 w-5',
          isFavorited && 'fill-current'
        )}
      />
      {showLabel && (
        <span className="ml-2">
          {isFavorited ? 'お気に入り済み' : 'お気に入りに追加'}
        </span>
      )}
    </Button>
  )
}

// 複数の商品に対応したお気に入りボタン群を管理するコンポーネント
interface FavoriteButtonGroupProps {
  favoriteStatus: Record<number, boolean>
  onToggle?: (productId: number, isFavorited: boolean) => void
}

export function FavoriteButtonGroup({ 
  favoriteStatus, 
  onToggle 
}: FavoriteButtonGroupProps) {
  const [localStatus, setLocalStatus] = useState(favoriteStatus)

  const handleToggle = (productId: number, isFavorited: boolean) => {
    setLocalStatus(prev => ({
      ...prev,
      [productId]: isFavorited
    }))
    onToggle?.(productId, isFavorited)
  }

  return {
    renderButton: (productId: number, props?: Partial<FavoriteButtonProps>) => (
      <FavoriteButton
        key={productId}
        productId={productId}
        initialFavorited={localStatus[productId] || false}
        onToggle={(isFavorited) => handleToggle(productId, isFavorited)}
        {...props}
      />
    ),
    status: localStatus
  }
}
