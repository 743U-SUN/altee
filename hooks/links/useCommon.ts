// 共通のリンク関連hooks

import { useState, useEffect, useCallback } from 'react'
import type { LinkService, ServiceIcon, ServiceFilters, IconFilters } from '@/types/link'

/**
 * サービス一覧を取得するhook
 */
export function useServices(filters: ServiceFilters = {}) {
  const [services, setServices] = useState<LinkService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      if (filters.allowOriginalIcon !== undefined) params.append('allowOriginalIcon', filters.allowOriginalIcon.toString())
      
      const response = await fetch(`/api/admin/services?${params}`)
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
  }, [filters.search, filters.isActive, filters.allowOriginalIcon])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return { services, loading, error, refetch: fetchServices }
}

/**
 * アイコン一覧を取得するhook
 */
export function useIcons(filters: IconFilters = {}) {
  const [icons, setIcons] = useState<ServiceIcon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIcons = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.serviceId) params.append('serviceId', filters.serviceId)
      if (filters.style) params.append('style', filters.style)
      if (filters.colorScheme) params.append('colorScheme', filters.colorScheme)
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
      
      const response = await fetch(`/api/admin/icons?${params}`)
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
  }, [filters.search, filters.serviceId, filters.style, filters.colorScheme, filters.isActive])

  useEffect(() => {
    fetchIcons()
  }, [fetchIcons])

  return { icons, loading, error, refetch: fetchIcons }
}

/**
 * 特定サービスのアイコンを取得するhook
 */
export function useServiceIcons(serviceId?: string) {
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
      
      const response = await fetch(`/api/admin/services/${serviceId}/icons`)
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

/**
 * ファイルアップロード用hook
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (
    file: File,
    endpoint: string,
    additionalData?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value)
        })
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました')
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'アップロードに失敗しました'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setUploading(false)
    }
  }, [])

  return { uploadFile, uploading, error }
}

/**
 * API操作用の汎用hook
 */
export function useApiOperation<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (
    operation: () => Promise<T>
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      const data = await operation()
      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '操作に失敗しました'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error }
}
