// 管理者用リンク管理の型定義

import type { LinkService, ServiceIcon, IconStyle, IconColor } from '@/types/link'

// ダイアログの状態管理用
export interface ServiceDialogState {
  open: boolean
  mode: 'create' | 'edit'
  service: LinkService | null
}

export interface IconDialogState {
  open: boolean
  mode: 'create' | 'edit'
  icon: ServiceIcon | null
}

// フィルター状態
export interface AdminServiceFilters {
  search: string
  isActive: boolean | null
  allowOriginalIcon: boolean | null
}

export interface AdminIconFilters {
  search: string
  serviceId: string
  style: IconStyle | ''
  colorScheme: IconColor | ''
  isActive: boolean | null
}

// 統計情報
export interface LinkStatistics {
  totalServices: number
  activeServices: number
  totalIcons: number
  activeIcons: number
  totalLinks: number
  mostUsedService: {
    name: string
    count: number
  } | null
}

// テーブルの並び替え
export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

// バルクアクション
export interface BulkAction {
  type: 'activate' | 'deactivate' | 'delete'
  label: string
}

// エクスポート用データ
export interface ServiceExportData {
  id: string
  name: string
  slug: string
  description?: string
  baseUrl?: string
  allowOriginalIcon: boolean
  isActive: boolean
  iconCount: number
  linkCount: number
  createdAt: string
}

export interface IconExportData {
  id: string
  name: string
  fileName: string
  style: IconStyle
  colorScheme: IconColor
  serviceName: string
  isActive: boolean
  linkCount: number
  createdAt: string
}
