# セキュアフォーム共通ライブラリ使用ガイド

このプロジェクトでは、セキュリティ対策が組み込まれた共通のフォームライブラリを提供しています。

## 🛡️ セキュリティ機能

- XSS（Cross-Site Scripting）攻撃対策
- HTMLタグ・スクリプトタグの自動除去
- 入力値のサニタイゼーション
- レート制限対応
- 型安全なバリデーション
- Uncontrolled/Controlled入力エラーの自動回避

## 📁 ファイル構成

```
lib/
├── validation/
│   └── schemas.ts           # 共通バリデーションスキーマ
├── security/
│   └── sanitize.ts         # セキュリティ関数
hooks/
└── useSecureForm.ts        # セキュアフォームフック
components/
└── forms/
    └── SecureFields.tsx    # 再利用可能フィールドコンポーネント
```

## 🚀 基本的な使用方法

### 1. 共通フックの使用

```tsx
import { useEffect } from "react"
import { useSecureForm } from "@/hooks/useSecureForm"
import { userProfileSchema } from "@/lib/validation/schemas"

function MyForm() {
  const { form, isLoading, onSubmit, fetchData } = useSecureForm({
    schema: userProfileSchema,
    apiEndpoint: '/api/user/profile',
    method: 'PUT',
    successMessage: "保存しました",
    enableAutoFetch: true, // 自動データ取得を有効化
  })

  // データ取得
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {/* フィールド */}
      </form>
    </Form>
  )
}
```

### 2. セキュアフィールドの使用

```tsx
import { SecureTextField, SecureTextareaField } from "@/components/forms/SecureFields"

<SecureTextField
  control={form.control}
  name="displayName"
  label="表示名"
  placeholder="あなたの名前"
  maxLength={50}
  required
/>

<SecureTextareaField
  control={form.control}
  name="bio"
  label="自己紹介"
  placeholder="あなたについて教えてください"
  maxLength={1000}
  rows={5}
/>
```

### 3. カスタムバリデーションスキーマ

```tsx
import { z } from "zod"
import { requiredNameSchema, emailSchema, textAreaSchema } from "@/lib/validation/schemas"

const customSchema = z.object({
  name: requiredNameSchema,
  email: emailSchema,
  bio: textAreaSchema,
  age: z.number().min(0).max(150)
})
```

## 🛠️ 利用可能なコンポーネント

### フィールドコンポーネント

- `SecureTextField` - 基本的なテキスト入力
- `SecureTextareaField` - 複数行テキスト入力
- `SecureEmailField` - メールアドレス専用
- `SecurePasswordField` - パスワード専用
- `SecureUrlField` - URL専用
- `SecureTextFieldWithCounter` - 文字数カウンター付き

### バリデーションスキーマ

- `requiredNameSchema` - 必須の名前フィールド
- `optionalNameSchema` - オプションの名前フィールド
- `emailSchema` - メールアドレス
- `urlSchema` - URL
- `passwordSchema` - パスワード
- `textAreaSchema` - テキストエリア
- `handleSchema` - ユーザー名/ハンドル
- `bioOnlySchema` - 自己紹介専用

### 複合スキーマ

- `userProfileSchema` - ユーザープロフィール全体
- `contactFormSchema` - お問い合わせフォーム
- `userSettingsSchema` - ユーザー設定

## 📝 useSecureFormのオプション

```tsx
interface UseSecureFormOptions {
  schema: ZodSchema              // バリデーションスキーマ（必須）
  apiEndpoint: string           // APIエンドポイント（必須）
  method?: string               // HTTPメソッド（デフォルト: 'POST'）
  onSuccess?: (data) => void    // 成功時のコールバック
  onError?: (error) => void     // エラー時のコールバック
  successMessage?: string       // 成功メッセージ（デフォルト: "保存しました"）
  enableAutoFetch?: boolean     // 自動データ取得（デフォルト: true）
  formOptions?: UseFormProps    // react-hook-formのオプション
}
```

## 📝 実際の使用例

### プロフィール編集フォーム

```tsx
"use client"

import { useEffect } from "react"
import { useSecureForm } from "@/hooks/useSecureForm"
import { z } from "zod"
import { requiredNameSchema, optionalNameSchema } from "@/lib/validation/schemas"
import { SecureTextField } from "@/components/forms/SecureFields"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

const profileSchema = z.object({
  characterName: requiredNameSchema,
  subname: optionalNameSchema,
})

export function ProfileForm() {
  const { form, data: user, isLoading, fetchData, onSubmit } = useSecureForm({
    schema: profileSchema,
    apiEndpoint: '/api/user/profile',
    method: 'PUT',
    successMessage: "プロフィールを更新しました",
  })

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      {/* 現在のデータ表示 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium">現在のプロフィール</h3>
        <p>{user?.characterName || "未設定"}</p>
      </div>

      {/* フォーム */}
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <SecureTextField
            control={form.control}
            name="characterName"
            label="キャラクター名"
            placeholder="CharacterName"
            maxLength={50}
            required
          />
          
          <SecureTextField
            control={form.control}
            name="subname"
            label="サブネーム"
            placeholder="SubName"
            maxLength={50}
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "保存中..." : "保存する"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
```

### 自己紹介フォーム

```tsx
"use client"

import { useEffect } from "react"
import { useSecureForm } from "@/hooks/useSecureForm"
import { bioOnlySchema } from "@/lib/validation/schemas"
import { SecureTextareaField } from "@/components/forms/SecureFields"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

export function BioForm() {
  const { form, data: user, isLoading, fetchData, onSubmit } = useSecureForm({
    schema: bioOnlySchema,
    apiEndpoint: '/api/user/profile',
    method: 'PUT',
    successMessage: "自己紹介を保存しました",
  })

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <SecureTextareaField
          control={form.control}
          name="bio"
          label="自己紹介"
          placeholder="あなたについて教えてください..."
          description="1000文字以内で自己紹介を入力してください。改行も使用できます。"
          maxLength={1000}
          rows={6}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "保存中..." : "保存する"}
        </Button>
      </form>
    </Form>
  )
}
```

## ⚠️ 重要な注意点

### 1. **データ取得について**
- `enableAutoFetch: true`（デフォルト）の場合、`fetchData()`を`useEffect`で呼び出してください
- 新規作成フォームの場合は`enableAutoFetch: false`に設定してください

### 2. **undefinedエラーの回避**
- フォームフィールドは自動的に空文字列で初期化されます
- `value={field.value || ""}`が自動的に適用されます

### 3. **セキュリティ**
- 必ずセキュアフィールドコンポーネントを使用してください
- サーバーサイドでも同じスキーマでバリデーションを行ってください
- APIエンドポイントでレート制限を実装してください

### 4. **型安全性**
- TypeScriptの型チェックを活用してください
- スキーマから型が自動推論されます

## 🧪 テスト項目

以下の悪意のある入力をテストして、適切にブロックされることを確認してください：

```
<script>alert('XSS')</script>
javascript:alert('XSS')
<img src="x" onerror="alert('XSS')">
<iframe src="evil.com"></iframe>
data:text/html,<script>alert('XSS')</script>
```

## 🔧 トラブルシューティング

### Q: フォームフィールドが空で表示される
A: `fetchData()`を`useEffect`で呼び出していることを確認してください

### Q: "uncontrolled to controlled" エラーが発生する
A: 最新版では自動的に解決されます。SecureFieldコンポーネントを使用してください

### Q: バリデーションが効かない
A: スキーマが正しく設定されているか確認してください

これで、セキュアで使いやすいフォームライブラリの完全ガイドです！
