"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { getUserProfile, updateUserProfileData } from "@/lib/actions/user-actions"

// ユーザープロファイルの型定義
interface UserProfile {
  id: string
  email: string
  name?: string | null
  characterName?: string | null
  subname?: string | null
  bio?: string | null
  // その他のプロファイル情報
}

// プロファイル更新用のインターフェース
interface ProfileUpdate {
  characterName?: string
  subname?: string
  bio?: string
  // 他のフィールドも追加可能
}

export function useUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ユーザープロファイルを取得する関数をメモ化
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getUserProfile()
      
      if (result.success) {
        setUser(result.data)
      } else {
        if (result.error === '認証が必要です') {
          toast.error("認証が必要です。ログインしてください。")
        } else if (result.error === 'ユーザーが見つかりません') {
          toast.error("ユーザー情報が見つかりません。")
        } else {
          toast.error(result.error || "プロファイルの取得に失敗しました。")
        }
      }
    } catch (error) {
      console.error("プロファイル取得エラー:", error)
      toast.error("ネットワークエラーが発生しました。")
    } finally {
      setIsLoading(false)
    }
  }, []) // 空の依存配列でメモ化

  // ユーザープロファイルを更新する関数をメモ化
  const updateUserProfile = useCallback(async (data: ProfileUpdate) => {
    setIsLoading(true)
    try {
      const result = await updateUserProfileData(data)
      
      if (result.success) {
        // ローカルのユーザー状態を更新
        setUser(result.data)
        toast.success("プロファイルを更新しました。")
        return true
      } else {
        if (result.error === '認証が必要です') {
          toast.error("認証が必要です。ログインしてください。")
        } else if (result.error === '入力データが無効です') {
          toast.error("入力データに問題があります。確認してください。")
        } else {
          toast.error(result.error || "プロファイルの更新に失敗しました。")
        }
        return false
      }
    } catch (error) {
      console.error("プロファイル更新エラー:", error)
      toast.error("ネットワークエラーが発生しました。")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    user,
    isLoading,
    fetchUserProfile,
    updateUserProfile,
  }
}
