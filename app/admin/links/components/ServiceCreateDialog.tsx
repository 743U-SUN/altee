// サービス作成ダイアログコンポーネント

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import type { ServiceFormData } from '@/types/link'

interface ServiceCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onSubmit: (data: ServiceFormData) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

export function ServiceCreateDialog({
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
  loading
}: ServiceCreateDialogProps) {
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

  // サービス名からスラッグを自動生成
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async (data: ServiceFormData) => {
    const result = await onSubmit(data)
    if (result.success) {
      form.reset()
      onSuccess()
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>新しいサービスを追加</DialogTitle>
          <DialogDescription>
            新しいSNSサービスを追加します。ユーザーがリンクを作成する際に選択できるようになります。
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
                      <Input
                        placeholder="YouTube"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          // 名前が変更されたら自動でスラッグを生成
                          if (!form.getValues('slug')) {
                            form.setValue('slug', generateSlug(e.target.value))
                          }
                        }}
                      />
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
                      URL用の識別子（英小文字、数字、ハイフンのみ）
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
                作成
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}