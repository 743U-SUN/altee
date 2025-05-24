// リンク関連のバリデーション

import { z } from 'zod'

// URL検証スキーマ
export const urlSchema = z.string()
  .min(1, 'URLは必須です')
  .url('有効なURLを入力してください')
  .refine((url) => {
    // 危険なプロトコルをブロック
    const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:']
    return !dangerous.some(protocol => url.toLowerCase().startsWith(protocol))
  }, 'このURLプロトコルは許可されていません')

// サービス作成・更新用スキーマ
export const serviceSchema = z.object({
  name: z.string()
    .min(1, 'サービス名は必須です')
    .max(50, 'サービス名は50文字以内で入力してください'),
  slug: z.string()
    .min(1, 'スラッグは必須です')
    .max(30, 'スラッグは30文字以内で入力してください')
    .regex(/^[a-z0-9-]+$/, 'スラッグは英小文字、数字、ハイフンのみ使用できます'),
  description: z.string()
    .max(200, '説明は200文字以内で入力してください')
    .optional(),
  baseUrl: z.string()
    .url('有効なURLを入力してください')
    .optional()
    .or(z.literal('')),
  allowOriginalIcon: z.boolean().default(true),
})

// アイコン作成・更新用スキーマ
export const iconSchema = z.object({
  name: z.string()
    .min(1, 'アイコン名は必須です')
    .max(100, 'アイコン名は100文字以内で入力してください'),
  serviceId: z.string()
    .min(1, 'サービスを選択してください'),
  style: z.enum(['FILLED', 'OUTLINE', 'MINIMAL', 'GRADIENT', 'THREE_D']),
  colorScheme: z.enum(['ORIGINAL', 'MONOCHROME', 'WHITE', 'BLACK', 'CUSTOM']),
  description: z.string()
    .max(200, '説明は200文字以内で入力してください')
    .optional(),
})

// ユーザーリンク作成・更新用スキーマ
export const userLinkSchema = z.object({
  serviceId: z.string().min(1, 'サービスを選択してください'),
  url: urlSchema,
  title: z.string()
    .max(100, 'タイトルは100文字以内で入力してください')
    .optional(),
  description: z.string()
    .max(200, '説明は200文字以内で入力してください')
    .optional(),
  useOriginalIcon: z.boolean().default(false),
  iconId: z.string().optional(),
})

/**
 * ファイルアップロードの検証（Admin用）
 */
export function validateUploadFile(file: File): {
  isValid: boolean
  error?: string
} {
  const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']
  const maxSize = 2 * 1024 * 1024 // 2MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'サポートされていないファイル形式です。SVG、PNG、JPEG、WebPのみ許可されています。'
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'ファイルサイズが大きすぎます。最大2MBまで許可されています。'
    }
  }

  // ファイル名の検証（危険な文字を含まないか）
  const dangerousChars = /[<>:"/\\|?*]/
  if (dangerousChars.test(file.name)) {
    return {
      isValid: false,
      error: 'ファイル名に無効な文字が含まれています。'
    }
  }

  return { isValid: true }
}

/**
 * オリジナルアイコンファイルのバリデーション（SVGのみ）
 */
export function validateOriginalIconFile(file: File): {
  isValid: boolean
  error?: string
} {
  const allowedTypes = ['image/svg+xml']
  const maxSize = 1 * 1024 * 1024 // 1MB（SVGなので小さめ）

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'オリジナルアイコンはSVGファイルのみ許可されています。'
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'ファイルサイズが大きすぎます。最大1MBまで許可されています。'
    }
  }

  // ファイル名の検証（危険な文字を含まないか）
  const dangerousChars = /[<>:"/\\|?*]/
  if (dangerousChars.test(file.name)) {
    return {
      isValid: false,
      error: 'ファイル名に無効な文字が含まれています。'
    }
  }

  // SVGの基本的な構造チェック（オプション）
  if (!file.name.toLowerCase().endsWith('.svg')) {
    return {
      isValid: false,
      error: 'SVGファイルの拡張子が正しくありません。'
    }
  }

  return { isValid: true }
}

/**
 * サービス固有のURL検証
 */
export function validateServiceUrl(url: string, baseUrl?: string): boolean {
  if (!baseUrl) return true
  
  try {
    const urlObj = new URL(url)
    const baseUrlObj = new URL(baseUrl)
    
    // ドメインが一致するかチェック
    return urlObj.hostname === baseUrlObj.hostname ||
           urlObj.hostname.endsWith(`.${baseUrlObj.hostname}`)
  } catch {
    return false
  }
}

/**
 * フォームデータの検証ヘルパー
 */
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: ['バリデーションエラーが発生しました'] } }
  }
}
