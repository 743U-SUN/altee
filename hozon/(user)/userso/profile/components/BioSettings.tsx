"use client"

import { useEffect } from "react"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useSecureForm } from "@/hooks/useSecureForm"
import { SecureTextareaField } from "@/components/forms/SecureFields"
import { bioOnlySchema } from "@/lib/validation/schemas"

export function BioSettings() {
  // 共通のセキュアフォームフックを使用
  const {
    form,
    data: user,
    isLoading,
    fetchData,
    onSubmit,
  } = useSecureForm({
    schema: bioOnlySchema,
    apiEndpoint: '/api/user/profile',
    method: 'PUT',
    successMessage: "自己紹介を保存しました",
    enableAutoFetch: true,
  })

  // コンポーネントがマウントされたときにユーザープロファイルを取得
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="py-4">
      <p className="text-gray-600 mb-4">
        自己紹介文を設定します。あなたについて他のユーザーに伝えたいことを書きましょう。
      </p>
      
      <div className="space-y-6">
        {/* 現在の自己紹介の表示 */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">現在の自己紹介</p>
          <div className="mt-2">
            {user?.bio ? (
              <p className="text-base whitespace-pre-wrap">{user.bio}</p>
            ) : (
              <p className="text-gray-400 italic">まだ自己紹介が設定されていません</p>
            )}
          </div>
        </div>
        
        {/* 自己紹介設定フォーム */}
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
      </div>
    </div>
  )
}
