// ユーザー用リンク作成・編集ダイアログ

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, Image as ImageIcon } from 'lucide-react'

import { useUserServices, useUserServiceIcons } from '../hooks/useUserLinks'
import type { UserLink } from '@/types/link'

const linkFormSchema = z.object({
  serviceId: z.string().min(1, 'サービスを選択してください'),
  url: z.string().url('有効なURLを入力してください'),
  title: z.string().optional(),
  description: z.string().optional(),
  useOriginalIcon: z.boolean().default(false),
  iconId: z.string().optional(),
})

type LinkFormData = z.infer<typeof linkFormSchema>

interface LinkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  link?: UserLink | null
  onSubmit: (data: LinkFormData) => Promise<{ success: boolean }>
  loading: boolean
}

export function LinkEditDialog({
  open,
  onOpenChange,
  link,
  onSubmit,
  loading
}: LinkEditDialogProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  
  const { services, loading: servicesLoading } = useUserServices()
  const { icons, loading: iconsLoading } = useUserServiceIcons(selectedServiceId)

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      serviceId: '',
      url: '',
      title: '',
      description: '',
      useOriginalIcon: false,
      iconId: '',
    }
  })

  const useOriginalIcon = form.watch('useOriginalIcon')
  const selectedService = services.find(s => s.id === selectedServiceId)

  // リンク編集時のフォーム初期化
  useEffect(() => {
    if (link && open) {
      form.reset({
        serviceId: link.serviceId,
        url: link.url,
        title: link.title || '',
        description: link.description || '',
        useOriginalIcon: link.useOriginalIcon,
        iconId: link.iconId || '',
      })
      setSelectedServiceId(link.serviceId)
    } else if (!link && open) {
      form.reset()
      setSelectedServiceId('')
    }
  }, [link, open, form])

  // サービス選択時のアイコンリセット
  useEffect(() => {
    if (selectedServiceId && !link) {
      form.setValue('iconId', '')
    }
  }, [selectedServiceId, form, link])

  const handleSubmit = async (data: LinkFormData) => {
    const result = await onSubmit(data)
    if (result.success) {
      onOpenChange(false)
      form.reset()
      setSelectedServiceId('')
    }
  }

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    form.setValue('serviceId', serviceId)
    form.setValue('iconId', '')
    form.setValue('useOriginalIcon', false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {link ? 'リンクを編集' : 'リンクを追加'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* サービス選択 */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>サービス *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleServiceChange}
                    disabled={servicesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="SNSサービスを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center gap-2">
                            <span>{service.name}</span>
                            {service.description && (
                              <span className="text-xs text-gray-500">
                                {service.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/yourprofile"
                      type="url"
                    />
                  </FormControl>
                  {selectedService?.baseUrl && (
                    <div className="text-xs text-gray-500">
                      推奨: {selectedService.baseUrl}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* タイトル */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="表示名（省略可）"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 説明 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="一言コメント（省略可）"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* アイコン設定 */}
            {selectedService && (
              <div className="space-y-3">
                <FormLabel>アイコン設定</FormLabel>
                
                {/* オリジナルアイコン使用 */}
                {selectedService.allowOriginalIcon && (
                  <FormField
                    control={form.control}
                    name="useOriginalIcon"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">
                            オリジナルアイコンを使用
                          </FormLabel>
                          <div className="text-xs text-gray-500">
                            独自のアイコンを使用します
                          </div>
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
                )}

                {/* 既定アイコン選択 */}
                {!useOriginalIcon && (
                  <FormField
                    control={form.control}
                    name="iconId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>アイコンを選択</FormLabel>
                        {iconsLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : icons.length === 0 ? (
                          <div className="text-center p-4 text-gray-500 text-sm">
                            このサービスのアイコンはまだありません
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            {icons.map((icon) => (
                              <button
                                key={icon.id}
                                type="button"
                                onClick={() => field.onChange(icon.id)}
                                className={`
                                  relative p-2 rounded-lg border-2 transition-colors
                                  ${field.value === icon.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                  }
                                `}
                              >
                                <div className="aspect-square flex items-center justify-center">
                                  <img
                                    src={icon.filePath}
                                    alt={icon.name}
                                    className="w-6 h-6 object-contain"
                                  />
                                </div>
                                <div className="absolute -top-1 -right-1">
                                  <Badge 
                                    variant="secondary" 
                                    className="text-xs px-1 py-0"
                                  >
                                    {icon.style.charAt(0)}
                                  </Badge>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {link ? '更新' : '作成'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
