// アイコン管理コンポーネント

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

import { useAdminIcons } from '../hooks/useAdminLinks'
import { useServices } from '@/hooks/links/useCommon'
import { IconUploadDialog } from './IconUploadDialog'
import { IconEditDialog } from './IconEditDialog'
import type { ServiceIcon } from '@/types/link'

export function IconManager() {
  const {
    icons,
    loading,
    error,
    filters,
    setFilters,
    iconDialog,
    setIconDialog,
    uploadIcon,
    updateIcon,
    deleteIcon,
    toggleIconActive,
    refetch,
    creating,
    updating,
    deleting
  } = useAdminIcons()

  const { services } = useServices({ isActive: true })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    icon: ServiceIcon | null
  }>({ open: false, icon: null })

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.icon) return
    
    await deleteIcon(deleteDialog.icon.id)
    setDeleteDialog({ open: false, icon: null })
  }

  const handleEdit = (icon: ServiceIcon) => {
    setIconDialog({
      open: true,
      mode: 'edit',
      icon
    })
  }

  const handleCreate = () => {
    setIconDialog({
      open: true,
      mode: 'create',
      icon: null
    })
  }

  const getStyleBadgeColor = (style: string) => {
    switch (style) {
      case 'FILLED': return 'bg-blue-100 text-blue-800'
      case 'OUTLINE': return 'bg-green-100 text-green-800'
      case 'MINIMAL': return 'bg-gray-100 text-gray-800'
      case 'GRADIENT': return 'bg-purple-100 text-purple-800'
      case 'THREE_D': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getColorSchemeBadgeColor = (colorScheme: string) => {
    switch (colorScheme) {
      case 'ORIGINAL': return 'bg-red-100 text-red-800'
      case 'MONOCHROME': return 'bg-gray-100 text-gray-800'
      case 'WHITE': return 'bg-slate-100 text-slate-800'
      case 'BLACK': return 'bg-black text-white'
      case 'CUSTOM': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="mb-4">{error}</p>
            <Button onClick={refetch}>再試行</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">アイコン管理</h2>
          <p className="text-gray-600">各サービス用のアイコンを管理します</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          アイコンアップロード
        </Button>
      </div>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="アイコン名で検索..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.serviceId || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, serviceId: value === 'all' ? '' : value }))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="サービス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全てのサービス</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.style || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, style: value === 'all' ? '' : value as any }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="スタイル" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全スタイル</SelectItem>
                <SelectItem value="FILLED">塗りつぶし</SelectItem>
                <SelectItem value="OUTLINE">アウトライン</SelectItem>
                <SelectItem value="MINIMAL">ミニマル</SelectItem>
                <SelectItem value="GRADIENT">グラデーション</SelectItem>
                <SelectItem value="THREE_D">3D風</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.colorScheme || 'all'}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, colorScheme: value === 'all' ? '' : value as any }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="カラー" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全カラー</SelectItem>
                <SelectItem value="ORIGINAL">オリジナル</SelectItem>
                <SelectItem value="MONOCHROME">モノクロ</SelectItem>
                <SelectItem value="WHITE">白</SelectItem>
                <SelectItem value="BLACK">黒</SelectItem>
                <SelectItem value="CUSTOM">カスタム</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アイコン一覧 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>アイコン一覧</CardTitle>
              <CardDescription>{icons.length}個のアイコン</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refetch}>
              更新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : icons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">条件に一致するアイコンがありません</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {icons.map((icon) => (
                <Card key={icon.id} className="relative group">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="aspect-square mb-3 relative">
                        <Image
                          src={icon.filePath}
                          alt={icon.name}
                          fill
                          className="object-contain"
                          sizes="150px"
                        />
                        
                        {!icon.isActive && (
                          <div className="absolute inset-0 bg-gray-500/50 rounded"></div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium truncate">{icon.name}</h4>
                        
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getStyleBadgeColor(icon.style)}`}
                          >
                            {icon.style}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getColorSchemeBadgeColor(icon.colorScheme)}`}
                          >
                            {icon.colorScheme}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          {icon.service?.name} • {icon._count?.links || 0}回使用
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Switch
                            checked={icon.isActive}
                            onCheckedChange={(checked) => 
                              toggleIconActive(icon.id, checked)
                            }
                            size="sm"
                          />
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(icon)}>
                                <Edit className="h-4 w-4 mr-2" />
                                編集
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteDialog({ open: true, icon })}
                                disabled={(icon._count?.links || 0) > 0}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {icons.map((icon) => (
                <div key={icon.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-12 h-12 border rounded-lg p-2 bg-gray-50 flex items-center justify-center">
                    <Image
                      src={icon.filePath}
                      alt={icon.name}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{icon.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {icon.service?.name}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStyleBadgeColor(icon.style)}`}
                      >
                        {icon.style}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getColorSchemeBadgeColor(icon.colorScheme)}`}
                      >
                        {icon.colorScheme}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {icon._count?.links || 0}回使用
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={icon.isActive}
                      onCheckedChange={(checked) => 
                        toggleIconActive(icon.id, checked)
                      }
                      size="sm"
                    />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(icon)}>
                          <Edit className="h-4 w-4 mr-2" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteDialog({ open: true, icon })}
                          disabled={(icon._count?.links || 0) > 0}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ダイアログ */}
      <IconUploadDialog
        open={iconDialog.open && iconDialog.mode === 'create'}
        onOpenChange={(open) => 
          setIconDialog(prev => ({ ...prev, open }))
        }
        services={services}
        onSuccess={refetch}
        onSubmit={uploadIcon}
        loading={creating}
      />

      <IconEditDialog
        open={iconDialog.open && iconDialog.mode === 'edit'}
        onOpenChange={(open) => 
          setIconDialog(prev => ({ ...prev, open }))
        }
        icon={iconDialog.icon}
        services={services}
        onSuccess={refetch}
        onSubmit={(data) => 
          iconDialog.icon ? updateIcon(iconDialog.icon.id, data) : Promise.resolve({ success: false })
        }
        loading={updating}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ open, icon: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>アイコンを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteDialog.icon?.name}」を削除します。
              この操作は取り消せません。
              {(deleteDialog.icon?._count?.links || 0) > 0 && (
                <span className="text-red-600 block mt-2">
                  このアイコンは{deleteDialog.icon?._count?.links}個のリンクで使用されているため削除できません。
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting || (deleteDialog.icon?._count?.links || 0) > 0}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
