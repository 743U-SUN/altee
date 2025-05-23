// ユーザー用リンク管理コンポーネント

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  ExternalLink,
  GripVertical,
  Search,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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

import { useUserLinks } from '../hooks/useUserLinks'
import { LinkEditDialog } from './LinkEditDialog'
import type { UserLink } from '@/types/link'

export function UserLinkManager() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [linkDialog, setLinkDialog] = useState<{
    open: boolean
    link: UserLink | null
  }>({ open: false, link: null })
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    link: UserLink | null
  }>({ open: false, link: null })

  const {
    links,
    loading,
    error,
    createLink,
    updateLink,
    deleteLink,
    toggleLinkActive,
    fetchLinks,
    creating,
    updating,
    deleting
  } = useUserLinks(session?.user?.id || '')

  // 初期データ取得
  useEffect(() => {
    if (session?.user?.id) {
      fetchLinks()
    }
  }, [session?.user?.id, fetchLinks])

  // 検索フィルター
  const filteredLinks = links.filter(link => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      link.title?.toLowerCase().includes(searchLower) ||
      link.description?.toLowerCase().includes(searchLower) ||
      link.url.toLowerCase().includes(searchLower) ||
      link.service.name.toLowerCase().includes(searchLower)
    )
  })

  const handleCreate = () => {
    setLinkDialog({ open: true, link: null })
  }

  const handleEdit = (link: UserLink) => {
    setLinkDialog({ open: true, link })
  }

  const handleSubmit = async (data: any) => {
    if (linkDialog.link) {
      return updateLink(linkDialog.link.id, data)
    } else {
      return createLink(data)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.link) return
    
    await deleteLink(deleteDialog.link.id)
    setDeleteDialog({ open: false, link: null })
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            ログインが必要です
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="mb-4">{error}</p>
            <Button onClick={fetchLinks}>再試行</Button>
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
          <h2 className="text-2xl font-bold">SNSリンク設定</h2>
          <p className="text-gray-600">あなたのSNSアカウントリンクを管理します</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          リンクを追加
        </Button>
      </div>

      {/* 検索 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="リンクを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* リンク一覧 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>登録リンク一覧</CardTitle>
              <CardDescription>{filteredLinks.length}個のリンク</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLinks}>
              更新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm ? '検索結果が見つかりません' : 'リンクがまだありません'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate}>
                  最初のリンクを追加
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLinks.map((link) => (
                <div 
                  key={link.id} 
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {/* ドラッグハンドル */}
                  <div className="cursor-grab text-gray-400">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {/* アイコン */}
                  <div className="flex-shrink-0">
                    {link.icon ? (
                      <img
                        src={link.icon.filePath}
                        alt={link.service.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {link.service.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {link.title || link.service.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {link.service.name}
                      </Badge>
                      {link.useOriginalIcon && (
                        <Badge variant="secondary" className="text-xs">
                          オリジナル
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-600 truncate"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                    
                    {link.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {link.description}
                      </p>
                    )}
                  </div>

                  {/* 状態切り替え */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={link.isActive}
                      onCheckedChange={(checked) => 
                        toggleLinkActive(link.id, checked)
                      }
                      disabled={updating}
                    />
                  </div>

                  {/* アクション */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(link)}>
                        <Edit className="h-4 w-4 mr-2" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteDialog({ open: true, link })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* リンク編集ダイアログ */}
      <LinkEditDialog
        open={linkDialog.open}
        onOpenChange={(open) => setLinkDialog({ open, link: null })}
        link={linkDialog.link}
        onSubmit={handleSubmit}
        loading={creating || updating}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ open, link: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>リンクを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleteDialog.link?.title || deleteDialog.link?.service.name}」を削除します。
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
