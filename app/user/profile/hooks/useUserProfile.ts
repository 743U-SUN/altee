"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

// ユーザープロファイルの型定義
interface UserProfile {
  id: string
  email: string
  name?: string | null
  characterName?: string | null
  subname?: string | null
  // その他のプロファイル情報
}

// プロファイル更新用のインターフェース
interface ProfileUpdate {
  characterName?: string
  subname?: string
  // 他のフィールドも追加可能
}

export function useUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ユーザープロファイルを取得する関数をメモ化
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("認証が必要です。ログインしてください。")
        } else if (response.status === 404) {
          toast.error("ユーザー情報が見つかりません。")
        } else {
          toast.error("プロファイルの取得に失敗しました。")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("プロファイル取得エラー:", error)
      // fetchの場合はnetworkエラーなど
      if (error instanceof TypeError) {
        toast.error("ネットワークエラーが発生しました。")
      }
    } finally {
      setIsLoading(false)
    }
  }, []) // 空の依存配列でメモ化

  // ユーザープロファイルを更新する関数をメモ化
  const updateUserProfile = useCallback(async (data: ProfileUpdate) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 401) {
          toast.error("認証が必要です。ログインしてください。")
        } else if (response.status === 400) {
          toast.error("入力データに問題があります。確認してください。")
        } else {
          toast.error("プロファイルの更新に失敗しました。")
        }
        
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const updatedUser = await response.json()
      
      // ローカルのユーザー状態を更新
      setUser(updatedUser)
      
      return true
    } catch (error) {
      console.error("プロファイル更新エラー:", error)
      // fetchの場合はnetworkエラーなど
      if (error instanceof TypeError) {
        toast.error("ネットワークエラーが発生しました。")
      }
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
