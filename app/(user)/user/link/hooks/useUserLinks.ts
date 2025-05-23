// ユーザー用リンク管理hooks

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useApiOperation } from '@/hooks/links/useCommon'
import type { 
  UserLink, 
  LinkService, 
  ServiceIcon, 
  LinkFormData 
} from '@/types/link'

/**
 * ユーザーリンク管理hook
 */
export function useUserLinks(userId: string) {
  const [links, setLinks] = useState<UserLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { execute: executeCreate, loading: creating } = useApiOperation<UserLink>()
  const { execute: executeUpdate, loading: updating } = useApiOperation<UserLink>()
  const { execute: executeDelete, loading: deleting } = useApiOperation<void>()

  // リンク一覧取得
  const fetchLinks = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/user/${userId}/links`)
      if (!response.ok) {
        throw new Error('リンクの取得に失敗しました')
      }
      
      const data = await response.json()
      setLinks(data.links || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // リンク作成
  const createLink = useCallback(async (data: LinkFormData) => {
    const result = await executeCreate(async () => {
      const response = await fetch(`/api/user/${userId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'リンクの作成に失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('リンクを作成しました')
      fetchLinks()
    } else {
      toast.error(result.error || 'リンクの作成に失敗しました')
    }

    return result
  }, [executeCreate, fetchLinks, userId])

  // リンク更新
  const updateLink = useCallback(async (linkId: string, data: Partial<LinkFormData>) => {
    const result = await executeUpdate(async () => {
      const response = await fetch(`/api/user/${userId}/links/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'リンクの更新に失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('リンクを更新しました')
      fetchLinks()
    } else {
      toast.error(result.error || 'リンクの更新に失敗しました')
    }

    return result
  }, [executeUpdate, fetchLinks, userId])

  // リンク削除
  const deleteLink = useCallback(async (linkId: string) => {
    const result = await executeDelete(async () => {
      const response = await fetch(`/api/user/${userId}/links/${linkId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'リンクの削除に失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('リンクを削除しました')
      fetchLinks()
    } else {
      toast.error(result.error || 'リンクの削除に失敗しました')
    }

    return result
  }, [executeDelete, fetchLinks, userId])

  // アクティブ状態の切り替え
  const toggleLinkActive = useCallback(async (linkId: string, isActive: boolean) => {
    return updateLink(linkId, { isActive })
  }, [updateLink])

  return {
    // データ
    links,
    loading,
    error,
    
    // 操作
    createLink,
    updateLink,
    deleteLink,
    toggleLinkActive,
    fetchLinks,
    
    // ローディング状態
    creating,
    updating,
    deleting
  }
}

/**
 * ユーザー向けサービス一覧取得hook
 */
export function useUserServices() {
  const [services, setServices] = useState<LinkService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/user/services')
      if (!response.ok) {
        throw new Error('サービスの取得に失敗しました')
      }
      
      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return { services, loading, error, refetch: fetchServices }
}

/**
 * ユーザー向けサービス別アイコン取得hook
 */
export function useUserServiceIcons(serviceId?: string) {
  const [icons, setIcons] = useState<ServiceIcon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchIcons = useCallback(async () => {
    if (!serviceId) {
      setIcons([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/user/services/${serviceId}/icons`)
      if (!response.ok) {
        throw new Error('アイコンの取得に失敗しました')
      }
      
      const data = await response.json()
      setIcons(data.icons || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [serviceId])

  useEffect(() => {
    fetchIcons()
  }, [fetchIcons])

  return { icons, loading, error, refetch: fetchIcons }
}
