// 管理者用サービス管理コンポーネント

'use client'

import { useState } from 'react'
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Plus,
  Search,
  Filter,
  Download,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { useAdminServices } from '../hooks/useAdminLinks'
import { ServiceCreateDialog } from './ServiceCreateDialog'
import { ServiceEditDialog } from './ServiceEditDialog'
import type { LinkService } from '@/types/link'

export function ServiceManager() {
  const {
    services,
    loading,
    error,
    filters,
    setFilters,
    serviceDialog,
    setServiceDialog,
    createService,
    updateService,
    deleteService,
    toggleServiceActive,
    refetch,
    creating,
    updating,
    deleting
  } = useAdminServices()

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    service: LinkService | null
  }>({ open: false, service: null })

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.service) return
    
    await deleteService(deleteDialog.service.id)
    setDeleteDialog({ open: false, service: null })
  }

  const handleEdit = (service: LinkService) => {
    setServiceDialog({
      open: true,
      mode: 'edit',
      service
    })
  }

  const handleCreate = () => {
    setServiceDialog({
      open: true,
      mode: 'create',
      service: null
    })
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
          <h2 className="text-2xl font-bold">サービス管理</h2>
          <p className="text-gray-600">SNSサービスの追加・編集・削除を行います</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新しいサービス
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
                  placeholder="サービス名で検索..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={filters.isActive === null ? 'all' : filters.isActive.toString()}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  isActive: value === 'all' ? null : value === 'true'
                }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="true">アクティブ</SelectItem>
                <SelectItem value="false">非アクティブ</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.allowOriginalIcon === null ? 'all' : filters.allowOriginalIcon.toString()}
              onValueChange={(value) => 
                setFilters(prev => ({ 
                  ...prev, 
                  allowOriginalIcon: value === 'all' ? null : value === 'true'
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="オリジナルアイコン" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="true">許可</SelectItem>
                <SelectItem value="false">禁止</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* サービステーブル */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>登録サービス一覧</CardTitle>
              <CardDescription>{services.length}個のサービス</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch}>
                更新
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">サービスが見つかりません</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>サービス名</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead className="text-center">アイコン数</TableHead>
                    <TableHead className="text-center">使用回数</TableHead>
                    <TableHead className="text-center">オリジナル</TableHead>
                    <TableHead className="text-center">状態</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-500">/{service.slug}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="max-w-[200px]">
                        <div className="space-y-1">
                          <div className="text-sm">
                            {service.description || '説明なし'}
                          </div>
                          {service.baseUrl && (
                            <div className="text-xs text-gray-500 truncate">
                              {service.baseUrl}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {service._count?.icons || 0}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          {service._count?.links || 0}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Badge variant={service.allowOriginalIcon ? "default" : "secondary"}>
                          {service.allowOriginalIcon ? '許可' : '禁止'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Switch
                          checked={service.isActive}
                          onCheckedChange={(checked) => 
                            toggleServiceActive(service.id, checked)
                          }
                          disabled={updating}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(service)}>
                              <Edit className="h-4 w-4 mr-2" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteDialog({ open: true, service })}
                              disabled={(service._count?.links || 0) > 0}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ダイアログ */}
      <ServiceCreateDialog
        open={serviceDialog.open && serviceDialog.mode === 'create'}
        onOpenChange={(open) => 
          setServiceDialog(prev => ({ ...prev, open }))
        }
        onSuccess={refetch}
        onSubmit={createService}
        loading={creating}
      />

      <ServiceEditDialog
        open={serviceDialog.open && serviceDialog.mode === 'edit'}
        onOpenChange={(open) => 
          setServiceDialog(prev => ({ ...prev, open }))
        }
        service={serviceDialog.service}
        onSuccess={refetch}
        onSubmit={(data) => 
          serviceDialog.service ? updateService(serviceDialog.service.id, data) : Promise.resolve({ success: false })
        }
        loading={updating}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ open, service: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>サービスを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteDialog.service?.name}」を削除します。
              この操作は取り消せません。
              {(deleteDialog.service?._count?.links || 0) > 0 && (
                <span className="text-red-600 block mt-2">
                  このサービスは{deleteDialog.service?._count?.links}個のリンクで使用されているため削除できません。
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting || (deleteDialog.service?._count?.links || 0) > 0}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}