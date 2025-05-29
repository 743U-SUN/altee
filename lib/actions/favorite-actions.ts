'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { formatPublicProductForDisplay } from '@/lib/utils/product/formatters'

// お気に入りの追加/削除（トグル）
export async function toggleFavorite(productId: number) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' }
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    // 既存のお気に入りをチェック
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId
        }
      }
    })

    if (existingFavorite) {
      // 既に存在する場合は削除
      await prisma.userFavorite.delete({
        where: {
          id: existingFavorite.id
        }
      })

      revalidatePath('/user/favorites')
      revalidatePath('/device')
      
      return { 
        success: true, 
        isFavorited: false,
        message: 'お気に入りから削除しました' 
      }
    } else {
      // 存在しない場合は追加
      await prisma.userFavorite.create({
        data: {
          userId: user.id,
          productId: productId
        }
      })

      revalidatePath('/user/favorites')
      revalidatePath('/device')
      
      return { 
        success: true, 
        isFavorited: true,
        message: 'お気に入りに追加しました' 
      }
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { success: false, error: 'お気に入りの更新に失敗しました' }
  }
}

// ユーザーのお気に入りを取得
export async function getUserFavorites() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です', data: [] }
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません', data: [] };
    }

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: user.id
      },
      include: {
        product: {
          include: {
            category: true,
            _count: {
              select: { userDevices: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 表示用にフォーマット
    const formattedFavorites = favorites.map(fav => ({
      ...fav,
      product: formatPublicProductForDisplay(fav.product)
    }))

    return { success: true, data: formattedFavorites }
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return { success: false, error: 'お気に入りの取得に失敗しました', data: [] }
  }
}

// 商品に対するお気に入り状態を取得
export async function getFavoriteStatus(productIds: number[]) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return {}
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return {};
    }

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: user.id,
        productId: {
          in: productIds
        }
      },
      select: {
        productId: true
      }
    })

    // productId -> boolean のマップを作成
    const favoriteMap: Record<number, boolean> = {}
    productIds.forEach(id => {
      favoriteMap[id] = false
    })
    favorites.forEach(fav => {
      favoriteMap[fav.productId] = true
    })

    return favoriteMap
  } catch (error) {
    console.error('Error fetching favorite status:', error)
    return {}
  }
}

// お気に入り数を取得（統計用）
export async function getFavoriteCount(productId: number) {
  try {
    const count = await prisma.userFavorite.count({
      where: {
        productId: productId
      }
    })
    return count
  } catch (error) {
    console.error('Error fetching favorite count:', error)
    return 0
  }
}

// お気に入りからの一括削除
export async function removeMultipleFavorites(productIds: number[]) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' }
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    await prisma.userFavorite.deleteMany({
      where: {
        userId: user.id,
        productId: {
          in: productIds
        }
      }
    })

    revalidatePath('/user/favorites')
    
    return { 
      success: true, 
      message: `${productIds.length}件のお気に入りを削除しました` 
    }
  } catch (error) {
    console.error('Error removing favorites:', error)
    return { success: false, error: 'お気に入りの削除に失敗しました' }
  }
}

// お気に入り商品のカテゴリ別統計
export async function getFavoriteCategoryStats() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です', data: [] }
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません', data: [] };
    }

    const favorites = await prisma.userFavorite.findMany({
      where: {
        userId: user.id
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })

    // カテゴリ別に集計
    const categoryMap = new Map<string, { 
      id: number
      name: string
      slug: string
      count: number 
    }>()

    favorites.forEach(fav => {
      const category = fav.product.category
      if (!categoryMap.has(category.slug)) {
        categoryMap.set(category.slug, {
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: 0
        })
      }
      const stat = categoryMap.get(category.slug)!
      stat.count++
    })

    const stats = Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching favorite category stats:', error)
    return { success: false, error: '統計情報の取得に失敗しました', data: [] }
  }
}
