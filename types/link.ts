// 共通のリンク関連型定義

export interface LinkService {
  id: string
  name: string
  slug: string
  description?: string
  baseUrl?: string
  allowOriginalIcon: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  _count?: {
    icons: number
    links: number
  }
}

export interface ServiceIcon {
  id: string
  name: string
  fileName: string
  filePath: string
  style: IconStyle
  colorScheme: IconColor
  description?: string
  isActive: boolean
  sortOrder: number
  uploadedBy?: string
  createdAt: string
  updatedAt: string
  serviceId: string
  service?: {
    id: string
    name: string
    slug: string
  }
  _count?: {
    links: number
  }
}

export interface UserLink {
  id: string
  url: string
  title?: string
  description?: string
  sortOrder: number
  isActive: boolean
  useOriginalIcon: boolean
  originalIconUrl?: string
  createdAt: string
  updatedAt: string
  
  // リレーション
  userId: string
  serviceId: string
  service: {
    id: string
    name: string
    slug: string
    description?: string
    baseUrl?: string
    allowOriginalIcon: boolean
  }
  iconId?: string
  icon?: {
    id: string
    name: string
    filePath: string
    style: IconStyle
    colorScheme: IconColor
  }
}

export type IconStyle = 'FILLED' | 'OUTLINE' | 'MINIMAL' | 'GRADIENT' | 'THREE_D'
export type IconColor = 'ORIGINAL' | 'MONOCHROME' | 'WHITE' | 'BLACK' | 'CUSTOM'

// フォーム用の型
export interface LinkFormData {
  serviceId: string
  url: string
  title?: string
  description?: string
  useOriginalIcon: boolean
  iconId?: string
  originalIconFile?: File
}

// リンク更新用の型（フォームデータ + その他更新可能なプロパティ）
export interface LinkUpdateData extends Omit<LinkFormData, 'originalIconFile'> {
  isActive?: boolean
  sortOrder?: number
  originalIconUrl?: string
}

export interface ServiceFormData {
  name: string
  slug: string
  description?: string
  baseUrl?: string
  allowOriginalIcon: boolean
}

export interface IconFormData {
  name: string
  serviceId: string
  style: IconStyle
  colorScheme: IconColor
  description?: string
  file: File
}

// API レスポンス用の型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 検索・フィルター用の型
export interface LinkFilters {
  search?: string
  serviceId?: string
  isActive?: boolean
  useOriginalIcon?: boolean
}

export interface ServiceFilters {
  search?: string
  isActive?: boolean
  allowOriginalIcon?: boolean
}

export interface IconFilters {
  search?: string
  serviceId?: string
  style?: IconStyle
  colorScheme?: IconColor
  isActive?: boolean
}
