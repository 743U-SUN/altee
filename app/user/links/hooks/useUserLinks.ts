// ユーザー用リンク管理hooks

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useApiOperation } from '@/hooks/links/useCommon'
import { 
  getUserLinks, 
  createUserLink, 
  createUserLinkWithFile, 
  updateUserLink,
  updateUserLinkWithFile,
  deleteUserLink,
  reorderUserLinks 
} from '@/lib/actions/link-actions'
import { getActiveServices, getIconsByService } from '@/lib/actions/service-actions'
import type { 
  UserLink, 
  LinkService, 
  ServiceIcon, 
  LinkFormData,
  LinkUpdateData
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
      
      const result = await getUserLinks()
      if (result.success) {
        setLinks(result.data || [])
      } else {
        throw new Error(result.error || 'リンクの取得に失敗しました')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // リンク作成
  const createLink = useCallback(async (data: LinkFormData) => {
    const result = await executeCreate(async () => {
      if (data.originalIconFile) {
        // ファイルアップロードの場合はFormDataを使用
        const formData = new FormData()
        formData.append('serviceId', data.serviceId)
        formData.append('url', data.url)
        if (data.title) formData.append('title', data.title)
        if (data.description) formData.append('description', data.description)
        formData.append('useOriginalIcon', data.useOriginalIcon.toString())
        if (data.iconId) formData.append('iconId', data.iconId)
        formData.append('originalIconFile', data.originalIconFile)
        
        return await createUserLinkWithFile(formData)
      } else {
        // 通常のServer Action使用
        return await createUserLink({
          serviceId: data.serviceId,
          url: data.url,
          title: data.title,
          description: data.description,
          useOriginalIcon: data.useOriginalIcon,
          iconId: data.iconId
        })
      }
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
  const updateLink = useCallback(async (linkId: string, data: Partial<LinkUpdateData> | LinkFormData) => {
    const result = await executeUpdate(async () => {
      // ファイルアップロードの場合
      if ('originalIconFile' in data && data.originalIconFile) {
        const formData = new FormData()
        formData.append('serviceId', data.serviceId)
        formData.append('url', data.url)
        if (data.title) formData.append('title', data.title)
        if (data.description) formData.append('description', data.description)
        formData.append('useOriginalIcon', data.useOriginalIcon.toString())
        if (data.iconId) formData.append('iconId', data.iconId)
        formData.append('originalIconFile', data.originalIconFile)
        
        return await updateUserLinkWithFile(linkId, formData)
      } else {
        // 通常のServer Action使用
        return await updateUserLink(linkId, {
          serviceId: 'serviceId' in data ? data.serviceId : undefined,
          url: 'url' in data ? data.url : undefined,
          title: 'title' in data ? data.title : undefined,
          description: 'description' in data ? data.description : undefined,
          useOriginalIcon: 'useOriginalIcon' in data ? data.useOriginalIcon : undefined,
          iconId: 'iconId' in data ? data.iconId : undefined
        })
      }
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
      return await deleteUserLink(linkId)
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

  // リンク並び替え
  const reorderLinks = useCallback(async (reorderedLinks: UserLink[]) => {
    const result = await executeUpdate(async () => {
      const linksToReorder = reorderedLinks.map((link, index) => ({
        id: link.id,
        sortOrder: index
      }))
      
      return await reorderUserLinks(linksToReorder)
    })

    if (result.success) {
      toast.success('リンクの並び順を更新しました')
      // 楽観的更新: 成功時はローカル状態を即座に更新
      setLinks(reorderedLinks.map((link, index) => ({
        ...link,
        sortOrder: index
      })))
    } else {
      toast.error(result.error || 'リンクの並び替えに失敗しました')
      // エラー時は元のデータを再取得
      fetchLinks()
    }

    return result
  }, [executeUpdate, fetchLinks, userId])

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
    reorderLinks,
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
      
      const result = await getActiveServices()
      if (result.success) {
        setServices(result.data || [])
      } else {
        throw new Error(result.error || 'サービスの取得に失敗しました')
      }
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
      
      const result = await getIconsByService(serviceId)
      if (result.success) {
        setIcons(result.data || [])
      } else {
        throw new Error(result.error || 'アイコンの取得に失敗しました')
      }
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
