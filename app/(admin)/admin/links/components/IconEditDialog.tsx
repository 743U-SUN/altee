// アイコン編集ダイアログコンポーネント

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

import { iconSchema } from '@/lib/links/validation'
import type { ServiceIcon, LinkService } from '@/types/link'

interface IconEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: ServiceIcon | null
  services: LinkService[]
  onSuccess: () => void
  onSubmit: (data: Partial<{
    name: string
    style: string
    colorScheme: string
    description: string
  }>) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

export function IconEditDialog({
  open,
  onOpenChange,
  icon,
  services,
  onSuccess,
  onSubmit,
  loading
}: IconEditDialogProps) {
  const form = useForm<Omit<typeof iconSchema._type, 'serviceId'> & { serviceId?: string }>({
    resolver: zodResolver(iconSchema.omit({ serviceId: true }).extend({
      serviceId: iconSchema.shape.serviceId.optional()
    })),
    defaultValues: {
      name: '',
      style: 'FILLED',
      colorScheme: 'ORIGINAL',
      description: '',
    }
  })

  // アイコン情報をフォームにセット
  useEffect(() => {
    if (icon && open) {
      form.reset({
        name: icon.name,
        style: icon.style,
        colorScheme: icon.colorScheme,
        description: icon.description || '',
      })
    }
  }, [icon, open, form])

  const handleSubmit = async (data: any) => {
    const result = await onSubmit(data)
    if (result.success) {
      onSuccess()
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  if (!icon) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>アイコンを編集</DialogTitle>
          <DialogDescription>
            「{icon.name}」の設定を編集します。
          </DialogDescription>
        </DialogHeader>

        {/* アイコンプレビュー */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border rounded-lg p-2 bg-gray-50">
                <Image
                  src={icon.filePath}
                  alt={icon.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-medium">{icon.name}</h4>
                <p className="text-sm text-gray-500">{icon.fileName}</p>
                <p className="text-xs text-gray-400">{icon.service?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>アイコン名 *</FormLabel>
                  <FormControl>
                    <Input placeholder="YouTube Red" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>スタイル</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FILLED">塗りつぶし</SelectItem>
                        <SelectItem value="OUTLINE">アウトライン</SelectItem>
                        <SelectItem value="MINIMAL">ミニマル</SelectItem>
                        <SelectItem value="GRADIENT">グラデーション</SelectItem>
                        <SelectItem value="THREE_D">3D風</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorScheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カラースキーム</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ORIGINAL">オリジナル</SelectItem>
                        <SelectItem value="MONOCHROME">モノクロ</SelectItem>
                        <SelectItem value="WHITE">白</SelectItem>
                        <SelectItem value="BLACK">黒</SelectItem>
                        <SelectItem value="CUSTOM">カスタム</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="赤いYouTubeアイコン"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    アイコンの説明（オプション）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 統計情報表示 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">使用統計</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">サービス: </span>
                  <span className="font-medium">{icon.service?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">使用回数: </span>
                  <span className="font-medium">{icon._count?.links || 0}回</span>
                </div>
                <div>
                  <span className="text-gray-600">ファイル名: </span>
                  <span className="font-medium text-xs">{icon.fileName}</span>
                </div>
                <div>
                  <span className="text-gray-600">作成日: </span>
                  <span className="font-medium text-xs">
                    {new Date(icon.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                更新
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
