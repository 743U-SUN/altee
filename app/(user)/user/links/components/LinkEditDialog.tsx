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

import { validateOriginalIconFile } from '@/lib/links/validation'
import { useUserServices, useUserServiceIcons } from '../hooks/useUserLinks'
import type { UserLink } from '@/types/link'

const linkFormSchema = z.object({
  serviceId: z.string().min(1, 'サービスを選択してください'),
  url: z.string().url('有効なURLを入力してください'),
  title: z.string().optional(),
  description: z.string().optional(),
  useOriginalIcon: z.boolean().default(false),
  iconId: z.string().optional(),
  originalIconFile: z.instanceof(File).optional(),
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  
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
      iconId: undefined, // 空文字列ではなくundefinedを使用
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
      
      // 既存のオリジナルアイコンがある場合
      if (link.useOriginalIcon && link.originalIconUrl) {
        setPreviewUrl(link.originalIconUrl)
      }
    } else if (!link && open) {
      form.reset()
      setSelectedServiceId('')
      setSelectedFile(null)
      setFileError('')
      setPreviewUrl('')
    }
  }, [link, open, form])

  // サービス選択時のアイコンリセット
  useEffect(() => {
    if (selectedServiceId && !link) {
      form.setValue('iconId', undefined) // 空文字列ではなくundefinedを使用
    }
  }, [selectedServiceId, form, link])

  // ファイル選択処理
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // バリデーション
    const validation = validateOriginalIconFile(file)
    if (!validation.isValid) {
      setFileError(validation.error || '')
      setSelectedFile(null)
      setPreviewUrl('')
      return
    }

    setFileError('')
    setSelectedFile(file)
    form.setValue('originalIconFile', file)

    // プレビュー用URL生成（SVGファイル用）
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // ファイル削除処理
  const handleFileRemove = () => {
    setSelectedFile(null)
    setFileError('')
    setPreviewUrl('')
    form.setValue('originalIconFile', undefined)
    
    // input要素のvalueもクリア
    const fileInput = document.getElementById('original-icon-file') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }
  const handleSubmit = async (data: LinkFormData) => {
    // オリジナルアイコン使用時のバリデーション
    if (data.useOriginalIcon && !link?.originalIconUrl && !selectedFile) {
      setFileError('オリジナルアイコンを選択してください')
      return
    }

    // オリジナルアイコン使用時はiconIdをクリア
    const submitData = {
      ...data,
      iconId: data.useOriginalIcon ? undefined : data.iconId,
      originalIconFile: data.useOriginalIcon ? selectedFile : undefined
    }
    
    const result = await onSubmit(submitData)
    if (result.success) {
      onOpenChange(false)
      form.reset()
      setSelectedServiceId('')
      setSelectedFile(null)
      setFileError('')
      setPreviewUrl('')
    }
  }

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    form.setValue('serviceId', serviceId)
    form.setValue('iconId', undefined) // 空文字列ではなくundefinedを使用
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
                            独自のアイコンを使用します（SVGのみ）
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              // オリジナルアイコン使用時はiconIdをクリア
                              if (checked) {
                                form.setValue('iconId', undefined)
                              } else {
                                // オリジナルアイコン使用をオフにしたらファイルをクリア
                                handleFileRemove()
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* オリジナルアイコンアップロード */}
                {useOriginalIcon && (
                  <div className="space-y-3">
                    <FormLabel>SVGアイコンアップロード</FormLabel>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center w-full">
                        <label 
                          htmlFor="original-icon-file"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {previewUrl ? (
                              <div className="w-16 h-16 mb-2">
                                <img 
                                  src={previewUrl} 
                                  alt="アイコンプレビュー" 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                            )}
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">クリックしてアップロード</span>
                            </p>
                            <p className="text-xs text-gray-500">SVGファイル (1MBまで)</p>
                          </div>
                          <input 
                            id="original-icon-file"
                            type="file" 
                            accept="image/svg+xml"
                            onChange={handleFileSelect}
                            className="hidden" 
                          />
                        </label>
                      </div>
                      
                      {/* ファイル情報と削除ボタン */}
                      {(selectedFile || previewUrl) && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="text-sm text-gray-600">
                            {selectedFile ? selectedFile.name : '既存のアイコン'}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleFileRemove}
                            className="h-6 px-2 text-red-600 hover:text-red-700"
                          >
                            削除
                          </Button>
                        </div>
                      )}
                      
                      {/* エラーメッセージ */}
                      {fileError && (
                        <p className="text-sm text-red-600">{fileError}</p>
                      )}
                    </div>
                  </div>
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
