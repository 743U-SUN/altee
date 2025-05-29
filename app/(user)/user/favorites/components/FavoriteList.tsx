'use client'

import { useState } from 'react'
import { UnifiedDeviceCard } from '@/components/devices/UnifiedDeviceCard'
import { DeviceComparison } from '@/components/devices/DeviceComparison'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { removeMultipleFavorites } from '@/lib/actions/favorite-actions'
import { toast } from 'sonner'
import { Trash2, Scale, Heart } from 'lucide-react'
import { DisplayDevice } from '@/types/device'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface FavoriteListProps {
  favorites: Array<{
    id: number
    productId: number
    createdAt: Date
    product: DisplayDevice
  }>
}

export function FavoriteList({ favorites }: FavoriteListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [compareDevices, setCompareDevices] = useState<DisplayDevice[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSelectToggle = (productId: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === favorites.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(favorites.map(f => f.productId)))
    }
  }

  const handleDelete = async () => {
    if (selectedIds.size === 0) return

    setIsDeleting(true)
    try {
      const result = await removeMultipleFavorites(Array.from(selectedIds))
      
      if (result.success) {
        toast.success(result.message)
        setSelectedIds(new Set())
        setShowDeleteDialog(false)
      } else {
        toast.error(result.error || '削除に失敗しました')
      }
    } catch (error) {
      toast.error('エラーが発生しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCompare = () => {
    const selectedDevices = favorites
      .filter(f => selectedIds.has(f.productId))
      .map(f => f.product)
      .slice(0, 5) // 最大5個まで

    setCompareDevices(selectedDevices)
  }

  const isCompareDisabled = selectedIds.size < 2 || selectedIds.size > 5

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">お気に入りがありません</p>
        <p className="text-muted-foreground">
          気になる商品をお気に入りに追加して、後で確認できます
        </p>
      </div>
    )
  }

  return (
    <>
      {/* 選択モードのツールバー */}
      {favorites.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedIds.size === favorites.length}
              onCheckedChange={handleSelectAll}
              aria-label="すべて選択"
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size}件選択中`
                : 'アイテムを選択してください'
              }
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  削除 ({selectedIds.size})
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompare}
                  disabled={isCompareDisabled}
                >
                  <Scale className="h-4 w-4 mr-1" />
                  比較 ({selectedIds.size})
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* お気に入り一覧 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="relative">
            {/* 選択チェックボックス */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedIds.has(favorite.productId)}
                onCheckedChange={() => handleSelectToggle(favorite.productId)}
                className="bg-background border-2"
                aria-label={`${favorite.product.name}を選択`}
              />
            </div>

            <UnifiedDeviceCard
              device={favorite.product}
              showDetails={false}
              compactMode={false}
              className={selectedIds.has(favorite.productId) ? 'ring-2 ring-primary' : ''}
            />
          </div>
        ))}
      </div>

      {/* 比較モーダル */}
      {compareDevices.length > 0 && (
        <DeviceComparison
          devices={compareDevices}
          onClose={() => setCompareDevices([])}
        />
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>お気に入りを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              選択した{selectedIds.size}件のお気に入りを削除します。
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
