import { z } from "zod"
import { sanitizeDisplayName, containsDangerousPatterns } from "@/lib/security/sanitize"

/**
 * 共通のバリデーションスキーマとルール
 * 全てのフォームで一貫したセキュリティ対策を適用
 */

// 改善版：セキュアで日本語対応の文字列スキーマ
// 既存機能に加えて、日本語名前用の詳細バリデーションを追加
const createSecureStringSchema = (minLength: number = 0, maxLength: number = 100) => {
  return z
    .string()
    .min(minLength, `${minLength}文字以上で入力してください`)
    .max(maxLength, `${maxLength}文字以内で入力してください`)
    // 基本的なセキュリティチェック（既存）
    .regex(/^[^\<\>]*$/, "不正な文字が含まれています")
    .regex(/^(?!.*<script).*$/i, "スクリプトタグは使用できません")
    .regex(/^(?!.*javascript:).*$/i, "JavaScriptコードは使用できません")
    .regex(/^(?!.*data:).*$/i, "データURLは使用できません")
    .regex(/^(?!.*vbscript:).*$/i, "VBScriptは使用できません")
    // 🆕 NEW: 日本語+英数字+基本記号のみ許可（完全Unicode対応）
    .regex(
      /^[\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FAF\uF900-\uFAFF\u{20000}-\u{2EBEF}a-zA-Z0-9\s\-_・。、！？]+$/u,
      "すべての日本語文字、英数字、および基本的な記号のみ使用可能です"
    )
    .refine((val: string) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
    // 🆕 NEW: 空白だけの入力を拒否（minLength > 0の場合のみ）
    .refine((val: string) => {
      if (minLength > 0) {
        return val.trim().length > 0
      }
      return true
    }, "有効な文字を入力してください")
    // 🆕 NEW: 連続する記号を制限
    .refine((val: string) => !/[\-_・。、！？]{3,}/.test(val), "記号を3つ以上連続して使用することはできません")
    // 🆕 NEW: 連続する空白を制限
    .refine((val: string) => !/\s{3,}/.test(val), "空白を3つ以上連続して使用することはできません")
    .transform(sanitizeDisplayName)
}

// 必須の名前フィールド（キャラクター名など）
export const requiredNameSchema = createSecureStringSchema(1, 50)

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
  // テキストエリアでは改行も含めてより柔軟に（完全Unicode対応）
  .regex(
    /^[\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FAF\uF900-\uFAFF\u{20000}-\u{2EBEF}a-zA-Z0-9\s\-_・。、！？\n\r]*$/u,
    "すべての日本語文字、英数字、基本的な記号、改行のみ使用可能です"
  )
  .refine((val: string) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
  .refine((val: string) => !/[\-_・。、！？]{5,}/.test(val), "記号を5つ以上連続して使用することはできません")
  .transform((text: string) => text.trim())
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
