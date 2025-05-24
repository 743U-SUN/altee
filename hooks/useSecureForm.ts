"use client"

import { useState, useCallback, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, UseFormProps } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

/**
 * 汎用的なセキュアフォームフック
 * 認証、バリデーション、エラーハンドリング、レート制限を統合
 */

interface UseSecureFormOptions<T extends z.ZodObject<any>> {
  schema: T
  apiEndpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  successMessage?: string
  formOptions?: UseFormProps<z.infer<T>>
  enableAutoFetch?: boolean
}

export function useSecureForm<T extends z.ZodObject<any>>({
  schema,
  apiEndpoint,
  method = 'POST',
  onSuccess,
  onError,
  successMessage = "保存しました",
  formOptions = {},
  enableAutoFetch = true
}: UseSecureFormOptions<T>) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  // スキーマから初期値を生成（undefinedエラーを防ぐ）
  const defaultValues = useMemo(() => {
    const defaults: any = {}
    
    Object.keys(schema.shape).forEach(key => {
      const field = schema.shape[key]
      // オプショナルフィールドかどうかチェック
      if (field._def?.typeName === 'ZodOptional') {
        defaults[key] = ""
      } else if (field._def?.typeName === 'ZodString') {
        defaults[key] = ""
      } else {
        defaults[key] = ""
      }
    })
    
    return defaults
  }, [schema])

  // フォームの初期化
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues, // 常に初期値を設定
    ...formOptions,
  })

  // エラーハンドリング
  const handleError = (error: any) => {
    let errorMessage = "エラーが発生しました"

    if (error instanceof Response) {
      switch (error.status) {
        case 401:
          errorMessage = "認証が必要です。ログインしてください。"
          break
        case 403:
          errorMessage = "この操作を実行する権限がありません。"
          break
        case 404:
          errorMessage = "データが見つかりません。"
          break
        case 400:
          errorMessage = "入力データに問題があります。確認してください。"
          break
        case 429:
          errorMessage = "リクエストが多すぎます。しばらく待ってからお試しください。"
          break
        case 500:
          errorMessage = "サーバーエラーが発生しました。"
          break
      }
    } else if (error instanceof TypeError) {
      errorMessage = "ネットワークエラーが発生しました。"
    }

    toast.error(errorMessage)
    onError?.(errorMessage)
  }

  // データ取得関数（常に実行可能）
  const fetchData = useCallback(async () => {
    if (!enableAutoFetch) return

    setIsLoading(true)
    try {
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      
      // フォームの値を更新（undefinedを空文字列に変換）
      if (result && typeof result === 'object') {
        const schemaKeys = Object.keys(schema.shape)
        const formData: any = {}
        
        schemaKeys.forEach(key => {
          // undefinedまたはnullの場合は空文字列を設定
          formData[key] = result[key] ?? ""
        })
        
        form.reset(formData)
      }

    } catch (error) {
      console.error("データ取得エラー:", error)
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [apiEndpoint, enableAutoFetch, form, schema])

  // データ送信関数
  const submitData = useCallback(async (formData: z.infer<T>) => {
    setIsLoading(true)
    try {
      const response = await fetch(apiEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        handleError(response)
        return false
      }

      const result = await response.json()
      setData(result)
      
      toast.success(successMessage)
      onSuccess?.(result)
      
      return true
    } catch (error) {
      console.error("送信エラー:", error)
      handleError(error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [apiEndpoint, method, successMessage, onSuccess])

  // フォーム送信ハンドラー
  const onSubmit = form.handleSubmit(submitData)

  return {
    form,
    data,
    isLoading,
    fetchData,
    submitData,
    onSubmit,
    // フォームの状態
    errors: form.formState.errors,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    // ユーティリティ関数
    reset: form.reset,
    setValue: form.setValue,
    watch: form.watch,
  }
}

// 特定用途向けのカスタムフック

// プロファイル更新用
export function useProfileForm() {
  return useSecureForm({
    schema: z.object({
      characterName: z.string().min(1).max(50),
      subname: z.string().max(50).optional(),
    }),
    apiEndpoint: '/api/user/profile',
    method: 'PUT',
    successMessage: "プロフィールを更新しました",
    enableAutoFetch: true,
  })
}

// 設定更新用
export function useSettingsForm() {
  return useSecureForm({
    schema: z.object({
      displayName: z.string().min(1).max(50),
      email: z.string().email(),
      bio: z.string().max(1000).optional(),
    }),
    apiEndpoint: '/api/user/settings',
    method: 'PUT',
    successMessage: "設定を更新しました",
    enableAutoFetch: true,
  })
}

// お問い合わせフォーム用（データ取得不要）
export function useContactForm() {
  return useSecureForm({
    schema: z.object({
      name: z.string().min(1).max(50),
      email: z.string().email(),
      subject: z.string().min(1).max(100),
      message: z.string().min(10).max(1000),
    }),
    apiEndpoint: '/api/contact',
    method: 'POST',
    successMessage: "お問い合わせを送信しました",
    enableAutoFetch: false,
  })
}
