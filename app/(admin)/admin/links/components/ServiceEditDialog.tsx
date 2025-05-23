// サービス編集ダイアログコンポーネント

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

import { serviceSchema } from '@/lib/links/validation'
import type { ServiceFormData, LinkService } from '@/types/link'

interface ServiceEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: LinkService | null
  onSuccess: () => void
  onSubmit: (data: Partial<ServiceFormData>) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

export function ServiceEditDialog({
  open,
  onOpenChange,
  service,
  onSuccess,
  onSubmit,
  loading
}: ServiceEditDialogProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      baseUrl: '',
      allowOriginalIcon: true,
    }
  })

  // サービス情報をフォームにセット
  useEffect(() => {
    if (service && open) {
      form.reset({
        name: service.name,
        slug: service.slug,
        description: service.description || '',
        baseUrl: service.baseUrl || '',
        allowOriginalIcon: service.allowOriginalIcon,
      })
    }
  }, [service, open, form])

  const handleSubmit = async (data: ServiceFormData) => {
    const result = await onSubmit(data)
    if (result.success) {
      onSuccess()
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  if (!service) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>サービスを編集</DialogTitle>
          <DialogDescription>
            「{service.name}」の設定を編集します。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>サービス名 *</FormLabel>
                    <FormControl>
                      <Input placeholder="YouTube" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>スラッグ *</FormLabel>
                    <FormControl>
                      <Input placeholder="youtube" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL用の識別子（既存リンクに影響するため注意）
                    </FormDescription>
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
                    <Textarea
                      placeholder="YouTube動画・チャンネル"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    サービスの説明（ユーザーに表示されます）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ベースURL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://youtube.com/"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URLの例や検証に使用されます（オプション）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowOriginalIcon"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      オリジナルアイコンを許可
                    </FormLabel>
                    <FormDescription>
                      ユーザーが独自のアイコンをアップロードできるようにします
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* 統計情報表示 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">使用統計</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">アイコン数: </span>
                  <span className="font-medium">{service._count?.icons || 0}個</span>
                </div>
                <div>
                  <span className="text-gray-600">使用回数: </span>
                  <span className="font-medium">{service._count?.links || 0}回</span>
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
