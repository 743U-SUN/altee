import { z } from "zod"
import { sanitizeDisplayName, containsDangerousPatterns } from "@/lib/security/sanitize"

/**
 * 共通のバリデーションスキーマとルール
 * 全てのフォームで一貫したセキュリティ対策を適用
 */

// 基本的なセキュリティチェック関数
const createSecureStringSchema = (minLength: number = 0, maxLength: number = 100) => {
  return z
    .string()
    .min(minLength, `${minLength}文字以上で入力してください`)
    .max(maxLength, `${maxLength}文字以内で入力してください`)
    .regex(/^[^\<\>]*$/, "不正な文字が含まれています")
    .regex(/^(?!.*<script).*$/i, "スクリプトタグは使用できません")
    .regex(/^(?!.*javascript:).*$/i, "JavaScriptコードは使用できません")
    .regex(/^(?!.*data:).*$/i, "データURLは使用できません")
    .regex(/^(?!.*vbscript:).*$/i, "VBScriptは使用できません")
    .refine((val) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
    .transform(sanitizeDisplayName)
}

// 必須の名前フィールド（キャラクター名など）
export const requiredNameSchema = createSecureStringSchema(1, 50)
  .refine((val) => val.length > 0, "有効な文字を入力してください")

// オプションの名前フィールド（サブネームなど）
export const optionalNameSchema = createSecureStringSchema(0, 50).optional()

// メールアドレス
export const emailSchema = z
  .string()
  .email("有効なメールアドレスを入力してください")
  .max(255, "メールアドレスが長すぎます")
  .transform((email) => email.toLowerCase().trim())

// URL
export const urlSchema = z
  .string()
  .url("有効なURLを入力してください")
  .max(2000, "URLが長すぎます")
  .refine((url) => {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }, "HTTPまたはHTTPSのURLのみ許可されています")

// パスワード（新規登録・変更用）
export const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください")
  .max(128, "パスワードは128文字以内で入力してください")
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "英大文字、英小文字、数字をそれぞれ含む必要があります")

// テキストエリア用（自己紹介文など）
export const textAreaSchema = z
  .string()
  .max(1000, "1000文字以内で入力してください")
  .regex(/^[^\<\>]*$/, "不正な文字が含まれています")
  .regex(/^(?!.*<script).*$/i, "スクリプトタグは使用できません")
  .refine((val) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
  .transform((text) => text.trim())
  .optional()

// ハンドル名/ユーザー名
export const handleSchema = z
  .string()
  .min(3, "ハンドル名は3文字以上で入力してください")
  .max(30, "ハンドル名は30文字以内で入力してください")
  .regex(/^[a-zA-Z0-9_-]+$/, "英数字、アンダースコア、ハイフンのみ使用可能です")
  .regex(/^[a-zA-Z]/, "ハンドル名は英字で始まる必要があります")
  .transform((handle) => handle.toLowerCase())

// 電話番号
export const phoneSchema = z
  .string()
  .regex(/^[\d\-\(\)\+\s]+$/, "有効な電話番号を入力してください")
  .max(20, "電話番号が長すぎます")
  .optional()

// 数値（年齢など）
export const positiveIntSchema = z
  .number()
  .int("整数で入力してください")
  .positive("正の数で入力してください")
  .max(999, "値が大きすぎます")

// 日付
export const dateSchema = z
  .date()
  .refine((date) => date <= new Date(), "未来の日付は設定できません")
  .refine((date) => date >= new Date('1900-01-01'), "1900年以降の日付を入力してください")

// ファイルアップロード用（クライアントサイド）
export const imageFileSchema = z
  .any()
  .refine((file) => file instanceof File, "ファイルを選択してください")
  .refine((file) => file.size <= 5 * 1024 * 1024, "ファイルサイズは5MB以下にしてください")
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    "JPEG、PNG、WebP形式のファイルのみアップロード可能です"
  )

// 複合スキーマの例
export const userProfileSchema = z.object({
  characterName: requiredNameSchema,
  subname: optionalNameSchema,
  bio: textAreaSchema,
  handle: handleSchema.optional(),
})

// Bio専用のスキーマ
export const bioOnlySchema = z.object({
  bio: textAreaSchema,
})

export const contactFormSchema = z.object({
  name: requiredNameSchema,
  email: emailSchema,
  subject: createSecureStringSchema(1, 100),
  message: createSecureStringSchema(10, 1000),
})

export const userSettingsSchema = z.object({
  displayName: requiredNameSchema,
  email: emailSchema,
  website: urlSchema.optional(),
  bio: textAreaSchema,
  phone: phoneSchema,
})

// フォームの種類に応じた設定
export const formConfigs = {
  profile: {
    schema: userProfileSchema,
    maxFields: 4,
    rateLimit: { maxRequests: 5, windowMs: 60000 }
  },
  contact: {
    schema: contactFormSchema,
    maxFields: 4,
    rateLimit: { maxRequests: 3, windowMs: 60000 }
  },
  settings: {
    schema: userSettingsSchema,
    maxFields: 5,
    rateLimit: { maxRequests: 10, windowMs: 60000 }
  }
} as const

export type FormConfigType = keyof typeof formConfigs
