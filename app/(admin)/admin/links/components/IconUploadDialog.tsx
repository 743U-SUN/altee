// アイコンアップロードダイアログコンポーネント

'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDropzone } from 'react-dropzone'
import { Upload, X, AlertCircle, Check, Loader2 } from 'lucide-react'

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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

import { iconSchema } from '@/lib/links/validation'
import type { IconFormData, LinkService } from '@/types/link'

interface IconUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  services: LinkService[]
  onSuccess: () => void
  onSubmit: (data: IconFormData) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

export function IconUploadDialog({
  open,
  onOpenChange,
  services,
  onSuccess,
  onSubmit,
  loading
}: IconUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const form = useForm<Omit<IconFormData, 'file'>>({
    resolver: zodResolver(iconSchema),
    defaultValues: {
      name: '',
      serviceId: '',
      style: 'FILLED',
      colorScheme: 'ORIGINAL',
      description: '',
    }
  })

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setFileError(null)
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0].code === 'file-too-large') {
        setFileError('ファイルサイズが大きすぎます（最大2MB）')
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setFileError('サポートされていないファイル形式です')
      } else {
        setFileError('ファイルのアップロードに失敗しました')
      }
      return
    }

    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      
      // ファイル名からアイコン名を推測
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      if (!form.getValues('name')) {
        form.setValue('name', nameWithoutExt)
      }
    }
  }, [form])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false
  })

  const removeFile = () => {
    setSelectedFile(null)
    setFileError(null)
  }

  const handleSubmit = async (data: Omit<IconFormData, 'file'>) => {
    if (!selectedFile) {
      setFileError('ファイルを選択してください')
      return
    }

    const result = await onSubmit({
      ...data,
      file: selectedFile
    })

    if (result.success) {
      form.reset()
      setSelectedFile(null)
      setFileError(null)
      onSuccess()
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedFile(null)
    setFileError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>アイコンをアップロード</DialogTitle>
          <DialogDescription>
            新しいアイコンをアップロードして、サービスに追加します。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* ファイルアップロード */}
            <div className="space-y-4">
              <FormLabel>アイコンファイル *</FormLabel>
              
              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">
                      {isDragActive ? 'ファイルをドロップしてください' : 'SVGファイルをドラッグ＆ドロップ'}
                    </p>
                    <p className="text-sm text-gray-500">
                      または、クリックしてファイルを選択
                    </p>
                    <div className="flex justify-center gap-2 text-xs text-gray-400">
                      <span>SVG</span>
                      <span>•</span>
                      <span>PNG</span>
                      <span>•</span>
                      <span>JPEG</span>
                      <span>•</span>
                      <span>WebP</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 border rounded-lg p-2 bg-gray-50 flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="プレビュー"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{selectedFile.name}</h4>
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                        <p className="text-xs text-gray-400">
                          {selectedFile.type}
                        </p>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* エラー表示 */}
              {fileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>サービス *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="サービスを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>スタイル</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* アップロードガイドライン */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">推奨事項</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 正方形（1:1）の比率がおすすめです</li>
                <li>• 最小サイズ: 64×64px、推奨サイズ: 512×512px</li>
                <li>• 背景が透明なSVGまたはPNGが最適です</li>
                <li>• シンプルで視認性の高いデザインを心がけてください</li>
              </ul>
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
              <Button 
                type="submit" 
                disabled={loading || !selectedFile}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                アップロード
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
