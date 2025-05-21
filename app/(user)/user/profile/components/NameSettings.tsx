"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "../hooks/useUserProfile"

// バリデーションスキーマ
const nameFormSchema = z.object({
  characterName: z
    .string()
    .min(1, "キャラクター名は必須です")
    .max(50, "キャラクター名は50文字以内で入力してください"),
  subname: z
    .string()
    .max(50, "サブネームは50文字以内で入力してください")
    .optional(),
})

type NameFormValues = z.infer<typeof nameFormSchema>

export function NameSettings() {
  // ユーザープロファイルフックを使用
  const { user, isLoading, fetchUserProfile, updateUserProfile } = useUserProfile()

  // フォームの初期化
  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      characterName: "",
      subname: "",
    },
  })

  // コンポーネントがマウントされたときにユーザープロファイルを取得
  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // ユーザーデータが取得されたらフォームの値を更新
  useEffect(() => {
    if (user) {
      form.reset({
        characterName: user.characterName || "",
        subname: user.subname || "",
      })
    }
  }, [user, form])

  // フォーム送信時の処理
  async function onSubmit(data: NameFormValues) {
    const success = await updateUserProfile({
      characterName: data.characterName,
      subname: data.subname || "",
    })

    if (success) {
      toast.success("名前を保存しました")
    }
  }

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="characterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>キャラクター名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CharacterName"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    メインの表示名として使用されます。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>サブネーム</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SubName"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    補足的な名前として、括弧内に表示されます。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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
