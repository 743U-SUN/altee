"use client"

import { useEffect } from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useSecureForm } from "@/hooks/useSecureForm"
import { SecureTextField } from "@/components/forms/SecureFields"
import { z } from "zod"
import { requiredNameSchema, optionalNameSchema } from "@/lib/validation/schemas"

// NameSettings専用のスキーマ
const nameFormSchema = z.object({
  characterName: requiredNameSchema,
  subname: optionalNameSchema,
})

export function NameSettings() {
  // 共通のセキュアフォームフックを使用
  const {
    form,
    data: user,
    isLoading,
    fetchData,
    onSubmit,
  } = useSecureForm({
    schema: nameFormSchema,
    apiEndpoint: '/api/user/profile',
    method: 'PUT',
    successMessage: "名前を保存しました",
    enableAutoFetch: true,
  })

  // コンポーネントがマウントされたときにユーザープロファイルを取得
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="py-4">
      <p className="text-gray-600 mb-4">
        表示名を設定します。他のユーザーから見える名前です。
      </p>
      
      <div className="space-y-6">
        {/* 現在の名前の表示 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">現在の名前</p>
          <p className="text-lg font-medium">
            {user?.characterName || "未設定"}
            {user?.subname && ` (${user.subname})`}
          </p>
        </div>
        
        {/* 名前設定フォーム */}
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <SecureTextField
              control={form.control}
              name="characterName"
              label="キャラクター名"
              placeholder="CharacterName"
              description="メインの表示名として使用されます。英数字、ひらがな、カタカナ、漢字のみ使用可能です。"
              maxLength={20}
              required
            />
            
            <SecureTextField
              control={form.control}
              name="subname"
              label="サブネーム"
              placeholder="SubName"
              description="補足的な名前として、括弧内に表示されます。英数字、ひらがな、カタカナ、漢字のみ使用可能です。"
              maxLength={20}
            />
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存する"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
