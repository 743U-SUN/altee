// リンク関連の共通サービス関数

import { prisma } from '@/lib/prisma'
import type { LinkService, ServiceIcon, UserLink, LinkFilters, ServiceFilters, IconFilters } from '@/types/link'

/**
 * サービス関連の操作
 */
export class LinkServiceOperations {
  // サービス一覧取得
  static async getServices(filters: ServiceFilters = {}) {
    const where: any = {}
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }
    
    if (filters.allowOriginalIcon !== undefined) {
      where.allowOriginalIcon = filters.allowOriginalIcon
    }

    return await prisma.linkService.findMany({
      where,
      include: {
        _count: {
          select: {
            icons: true,
            links: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })
  }

  // サービス詳細取得
  static async getServiceById(id: string) {
    return await prisma.linkService.findUnique({
      where: { id },
      include: {
        icons: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            icons: true,
            links: true
          }
        }
      }
    })
  }

  // サービス作成
  static async createService(data: {
    name: string
    slug: string
    description?: string
    baseUrl?: string
    allowOriginalIcon: boolean
  }) {
    // スラッグの重複チェック
    const existing = await prisma.linkService.findUnique({
      where: { slug: data.slug }
    })
    
    if (existing) {
      throw new Error('このスラッグは既に使用されています')
    }

    // 最大sortOrderを取得
    const maxSortOrder = await prisma.linkService.findFirst({
      select: { sortOrder: true },
      orderBy: { sortOrder: 'desc' }
    })

    return await prisma.linkService.create({
      data: {
        ...data,
        sortOrder: (maxSortOrder?.sortOrder || 0) + 1
      },
      include: {
        _count: {
          select: {
            icons: true,
            links: true
          }
        }
      }
    })
  }

  // サービス更新
  static async updateService(id: string, data: Partial<{
    name: string
    slug: string
    description: string
    baseUrl: string
    allowOriginalIcon: boolean
    isActive: boolean
    sortOrder: number
  }>) {
    // スラッグ重複チェック（自分以外）
    if (data.slug) {
      const existing = await prisma.linkService.findFirst({
        where: {
          slug: data.slug,
          NOT: { id }
        }
      })
      
      if (existing) {
        throw new Error('このスラッグは既に使用されています')
      }
    }

    return await prisma.linkService.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            icons: true,
            links: true
          }
        }
      }
    })
  }

  // サービス削除
  static async deleteService(id: string) {
    // 使用中のリンクがあるかチェック
    const linkCount = await prisma.userLink.count({
      where: { serviceId: id }
    })

    if (linkCount > 0) {
      throw new Error('このサービスは使用中のため削除できません')
    }

    return await prisma.linkService.delete({
      where: { id }
    })
  }
}

/**
 * アイコン関連の操作
 */
export class IconOperations {
  // アイコン一覧取得
  static async getIcons(filters: IconFilters = {}) {
    const where: any = {}
    
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' }
    }
    
    if (filters.serviceId) {
      where.serviceId = filters.serviceId
    }
    
    if (filters.style) {
      where.style = filters.style
    }
    
    if (filters.colorScheme) {
      where.colorScheme = filters.colorScheme
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    return await prisma.serviceIcon.findMany({
      where,
      include: {
        service: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: { links: true }
        }
      },
      orderBy: [
        { service: { name: 'asc' } },
        { sortOrder: 'asc' }
      ]
    })
  }

  // サービス別アイコン取得
  static async getIconsByService(serviceId: string) {
    return await prisma.serviceIcon.findMany({
      where: {
        serviceId,
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    })
  }

  // アイコン作成
  static async createIcon(data: {
    name: string
    fileName: string
    filePath: string
    style: string
    colorScheme: string
    description?: string
    serviceId: string
    uploadedBy?: string
  }) {
    // 最大sortOrderを取得
    const maxSortOrder = await prisma.serviceIcon.findFirst({
      where: { serviceId: data.serviceId },
      select: { sortOrder: true },
      orderBy: { sortOrder: 'desc' }
    })

    return await prisma.serviceIcon.create({
      data: {
        ...data,
        sortOrder: (maxSortOrder?.sortOrder || 0) + 1
      } as any,
      include: {
        service: {
          select: { id: true, name: true, slug: true }
        }
      }
    })
  }

  // アイコン更新
  static async updateIcon(id: string, data: Partial<{
    name: string
    style: string
    colorScheme: string
    description: string
    isActive: boolean
    sortOrder: number
  }>) {
    return await prisma.serviceIcon.update({
      where: { id },
      data: data as any,
      include: {
        service: {
          select: { id: true, name: true, slug: true }
        },
        _count: {
          select: { links: true }
        }
      }
    })
  }

  // アイコン削除
  static async deleteIcon(id: string) {
    // 使用中のリンクがあるかチェック
    const linkCount = await prisma.userLink.count({
      where: { iconId: id }
    })

    if (linkCount > 0) {
      throw new Error('このアイコンは使用中のため削除できません')
    }

    return await prisma.serviceIcon.delete({
      where: { id }
    })
  }
}

/**
 * ユーザーリンク関連の操作
 */
export class UserLinkOperations {
  // ユーザーリンク一覧取得
  static async getUserLinks(userId: string, filters: LinkFilters = {}) {
    const where: any = { userId }
    
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { url: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
    
    if (filters.serviceId) {
      where.serviceId = filters.serviceId
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }
    
    if (filters.useOriginalIcon !== undefined) {
      where.useOriginalIcon = filters.useOriginalIcon
    }

    return await prisma.userLink.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            baseUrl: true,
            allowOriginalIcon: true
          }
        },
        icon: {
          select: {
            id: true,
            name: true,
            filePath: true,
            style: true,
            colorScheme: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })
  }

  // ユーザーリンク作成
  static async createUserLink(userId: string, data: {
    serviceId: string
    url: string
    title?: string
    description?: string
    useOriginalIcon: boolean
    originalIconUrl?: string
    iconId?: string
  }) {
    // 最大sortOrderを取得
    const maxSortOrder = await prisma.userLink.findFirst({
      where: { userId },
      select: { sortOrder: true },
      orderBy: { sortOrder: 'desc' }
    })

    return await prisma.userLink.create({
      data: {
        ...data,
        userId,
        sortOrder: (maxSortOrder?.sortOrder || 0) + 1
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            baseUrl: true,
            allowOriginalIcon: true
          }
        },
        icon: {
          select: {
            id: true,
            name: true,
            filePath: true,
            style: true,
            colorScheme: true
          }
        }
      }
    })
  }

  // ユーザーリンク更新
  static async updateUserLink(id: string, userId: string, data: Partial<{
    url: string
    title: string
    description: string
    useOriginalIcon: boolean
    originalIconUrl: string
    iconId: string
    isActive: boolean
    sortOrder: number
  }>) {
    return await prisma.userLink.update({
      where: {
        id,
        userId // セキュリティのため、自分のリンクのみ更新可能
      },
      data,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            baseUrl: true,
            allowOriginalIcon: true
          }
        },
        icon: {
          select: {
            id: true,
            name: true,
            filePath: true,
            style: true,
            colorScheme: true
          }
        }
      }
    })
  }

  // ユーザーリンク削除
  static async deleteUserLink(id: string, userId: string) {
    return await prisma.userLink.delete({
      where: {
        id,
        userId // セキュリティのため、自分のリンクのみ削除可能
      }
    })
  }

  // リンク順序更新
  static async reorderUserLinks(userId: string, linkIds: string[]) {
    const transaction = linkIds.map((linkId, index) =>
      prisma.userLink.update({
        where: {
          id: linkId,
          userId // セキュリティのため
        },
        data: { sortOrder: index }
      })
    )

    return await prisma.$transaction(transaction)
  }
}
