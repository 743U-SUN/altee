// 管理者用リンク管理hooks

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useServices, useIcons, useApiOperation } from '@/hooks/links/useCommon'
import type { 
  LinkService, 
  ServiceIcon, 
  ServiceFormData, 
  IconFormData 
} from '@/types/link'
import type { 
  AdminServiceFilters, 
  AdminIconFilters,
  ServiceDialogState,
  IconDialogState
} from '../types'

/**
 * 管理者用サービス管理hook
 */
export function useAdminServices() {
  const [filters, setFilters] = useState<AdminServiceFilters>({
    search: '',
    isActive: null,
    allowOriginalIcon: null
  })
  
  const [serviceDialog, setServiceDialog] = useState<ServiceDialogState>({
    open: false,
    mode: 'create',
    service: null
  })

  const { services, loading, error, refetch } = useServices({
    search: filters.search || undefined,
    isActive: filters.isActive || undefined,
    allowOriginalIcon: filters.allowOriginalIcon || undefined
  })

  const { execute: executeCreate, loading: creating } = useApiOperation<LinkService>()
  const { execute: executeUpdate, loading: updating } = useApiOperation<LinkService>()
  const { execute: executeDelete, loading: deleting } = useApiOperation<void>()

  // サービス作成
  const createService = useCallback(async (data: ServiceFormData) => {
    const result = await executeCreate(async () => {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'サービスの作成に失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('サービスを作成しました')
      refetch()
      setServiceDialog({ open: false, mode: 'create', service: null })
    } else {
      toast.error(result.error || 'サービスの作成に失敗しました')
    }

    return result
  }, [executeCreate, refetch])

  // サービス更新
  const updateService = useCallback(async (id: string, data: Partial<ServiceFormData>) => {
    const result = await executeUpdate(async () => {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'サービスの更新に失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('サービスを更新しました')
      refetch()
      setServiceDialog({ open: false, mode: 'edit', service: null })
    } else {
      toast.error(result.error || 'サービスの更新に失敗しました')
    }

    return result
  }, [executeUpdate, refetch])

  // サービス削除
  const deleteService = useCallback(async (id: string) => {
    const result = await executeDelete(async () => {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'サービスの削除に失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('サービスを削除しました')
      refetch()
    } else {
      toast.error(result.error || 'サービスの削除に失敗しました')
    }

    return result
  }, [executeDelete, refetch])

  // アクティブ状態の切り替え
  const toggleServiceActive = useCallback(async (id: string, isActive: boolean) => {
    return updateService(id, { isActive })
  }, [updateService])

  return {
    // データ
    services,
    loading,
    error,
    
    // フィルター
    filters,
    setFilters,
    
    // ダイアログ
    serviceDialog,
    setServiceDialog,
    
    // 操作
    createService,
    updateService,
    deleteService,
    toggleServiceActive,
    refetch,
    
    // ローディング状態
    creating,
    updating,
    deleting
  }
}

/**
 * 管理者用アイコン管理hook
 */
export function useAdminIcons() {
  const [filters, setFilters] = useState<AdminIconFilters>({
    search: '',
    serviceId: '',
    style: '',
    colorScheme: '',
    isActive: null
  })
  
  const [iconDialog, setIconDialog] = useState<IconDialogState>({
    open: false,
    mode: 'create',
    icon: null
  })

  const { icons, loading, error, refetch } = useIcons({
    search: filters.search || undefined,
    serviceId: filters.serviceId || undefined,
    style: filters.style || undefined,
    colorScheme: filters.colorScheme || undefined,
    isActive: filters.isActive || undefined
  })

  const { execute: executeCreate, loading: creating } = useApiOperation<ServiceIcon>()
  const { execute: executeUpdate, loading: updating } = useApiOperation<ServiceIcon>()
  const { execute: executeDelete, loading: deleting } = useApiOperation<void>()

  // アイコンアップロード
  const uploadIcon = useCallback(async (data: IconFormData) => {
    const result = await executeCreate(async () => {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('name', data.name)
      formData.append('serviceId', data.serviceId)
      formData.append('style', data.style)
      formData.append('colorScheme', data.colorScheme)
      if (data.description) {
        formData.append('description', data.description)
      }

      const response = await fetch('/api/admin/icons', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'アイコンのアップロードに失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('アイコンをアップロードしました')
      refetch()
      setIconDialog({ open: false, mode: 'create', icon: null })
    } else {
      toast.error(result.error || 'アイコンのアップロードに失敗しました')
    }

    return result
  }, [executeCreate, refetch])

  // アイコン更新
  const updateIcon = useCallback(async (id: string, data: Partial<{
    name: string
    style: string
    colorScheme: string
    description: string
    isActive: boolean
  }>) => {
    const result = await executeUpdate(async () => {
      const response = await fetch(`/api/admin/icons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'アイコンの更新に失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('アイコンを更新しました')
      refetch()
      setIconDialog({ open: false, mode: 'edit', icon: null })
    } else {
      toast.error(result.error || 'アイコンの更新に失敗しました')
    }

    return result
  }, [executeUpdate, refetch])

  // アイコン削除
  const deleteIcon = useCallback(async (id: string) => {
    const result = await executeDelete(async () => {
      const response = await fetch(`/api/admin/icons/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'アイコンの削除に失敗しました')
      }

      return response.json()
    })

    if (result.success) {
      toast.success('アイコンを削除しました')
      refetch()
    } else {
      toast.error(result.error || 'アイコンの削除に失敗しました')
    }

    return result
  }, [executeDelete, refetch])

  // アクティブ状態の切り替え
  const toggleIconActive = useCallback(async (id: string, isActive: boolean) => {
    return updateIcon(id, { isActive })
  }, [updateIcon])

  return {
    // データ
    icons,
    loading,
    error,
    
    // フィルター
    filters,
    setFilters,
    
    // ダイアログ
    iconDialog,
    setIconDialog,
    
    // 操作
    uploadIcon,
    updateIcon,
    deleteIcon,
    toggleIconActive,
    refetch,
    
    // ローディング状態
    creating,
    updating,
    deleting
  }
}