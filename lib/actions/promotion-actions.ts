'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { fetchProductFromPAAPI } from '@/lib/services/amazon/pa-api'
import { CustomProductData } from '@/types/device'

// カスタム商品の統計情報を取得
export async function getCustomProductStatistics() {
  try {
    // カスタム商品をASIN別にグループ化して集計
    const customDevices = await prisma.userDevice.findMany({
      where: {
        deviceType: 'CUSTOM',
        customProductData: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            iconUrl: true
          }
        }
      }
    })

    // ASINでグループ化
    const asinGroups = new Map<string, {
      asin: string
      title: string
      imageUrl: string
      amazonUrl: string
      category: string
      userCount: number
      users: Array<{
        id: string
        name: string | null
        handle: string | null
        iconUrl: string | null
      }>
      firstAdded: Date
      lastAdded: Date
    }>()

    // 既存の公式商品のASINを取得
    const officialASINs = await prisma.product.findMany({
      select: { asin: true }
    })
    const officialASINSet = new Set(officialASINs.map(p => p.asin))

    // カスタム商品をグループ化
    customDevices.forEach(device => {
      const customData = device.customProductData as CustomProductData
      if (!customData.asin) return

      // 既に公式商品として存在する場合はスキップ
      if (officialASINSet.has(customData.asin)) return

      if (!asinGroups.has(customData.asin)) {
        asinGroups.set(customData.asin, {
          asin: customData.asin,
          title: customData.title,
          imageUrl: customData.imageUrl,
          amazonUrl: customData.amazonUrl,
          category: customData.category,
          userCount: 0,
          users: [],
          firstAdded: device.createdAt,
          lastAdded: device.createdAt
        })
      }

      const group = asinGroups.get(customData.asin)!
      group.userCount++
      group.users.push(device.user)
      if (device.createdAt < group.firstAdded) {
        group.firstAdded = device.createdAt
      }
      if (device.createdAt > group.lastAdded) {
        group.lastAdded = device.createdAt
      }
    })

    // 配列に変換してユーザー数でソート
    const sortedGroups = Array.from(asinGroups.values())
      .sort((a, b) => b.userCount - a.userCount)

    return { success: true, data: sortedGroups }
  } catch (error) {
    console.error('Error fetching custom product statistics:', error)
    return { success: false, error: '統計情報の取得に失敗しました' }
  }
}

// カテゴリ別の統計情報を取得
export async function getCategoryStatistics() {
  try {
    // カテゴリ別のカスタム商品数を集計
    const customDevices = await prisma.userDevice.findMany({
      where: {
        deviceType: 'CUSTOM',
        customProductData: {
          not: null
        }
      }
    })

    const categoryStats = new Map<string, number>()
    
    customDevices.forEach(device => {
      const customData = device.customProductData as CustomProductData
      const category = customData.category || 'unknown'
      categoryStats.set(category, (categoryStats.get(category) || 0) + 1)
    })

    // カテゴリ情報と統合
    const categories = await prisma.deviceCategory.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    const stats = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      officialCount: category._count.products,
      customCount: categoryStats.get(category.slug) || 0
    }))

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching category statistics:', error)
    return { success: false, error: 'カテゴリ統計の取得に失敗しました' }
  }
}

// カスタム商品を公式商品に昇格
export async function promoteCustomProduct(asin: string) {
  try {
    // ASINに対応するカスタム商品を取得
    const customDevices = await prisma.userDevice.findMany({
      where: {
        deviceType: 'CUSTOM',
        customProductData: {
          path: '$.asin',
          equals: asin
        }
      }
    })

    if (customDevices.length === 0) {
      return { success: false, error: '対象のカスタム商品が見つかりません' }
    }

    // 既に公式商品として存在するかチェック
    const existingProduct = await prisma.product.findUnique({
      where: { asin }
    })

    if (existingProduct) {
      return { success: false, error: 'この商品は既に公式商品として登録されています' }
    }

    // 代表的なカスタム商品データを取得
    const representativeData = customDevices[0].customProductData as CustomProductData

    // カテゴリを取得
    const category = await prisma.deviceCategory.findUnique({
      where: { slug: representativeData.category }
    })

    if (!category) {
      return { success: false, error: 'カテゴリが見つかりません' }
    }

    // PA-APIで詳細情報を取得
    let productDetails = null
    try {
      productDetails = await fetchProductFromPAAPI(asin)
    } catch (error) {
      console.error('PA-API fetch error:', error)
      // PA-APIエラーでも昇格は続行（既存のデータを使用）
    }

    // 公式商品として作成
    const newProduct = await prisma.product.create({
      data: {
        name: productDetails?.title || representativeData.title,
        description: productDetails?.description,
        categoryId: category.id,
        amazonUrl: representativeData.amazonUrl,
        adminAffiliateUrl: productDetails?.affiliateUrl || representativeData.amazonUrl,
        asin: asin,
        imageUrl: productDetails?.imageUrl || representativeData.imageUrl,
        price: productDetails?.price ? parseFloat(productDetails.price) : null,
        attributes: productDetails?.attributes || representativeData.attributes,
        isActive: true
      }
    })

    // 関連するUserDeviceを更新
    await prisma.userDevice.updateMany({
      where: {
        deviceType: 'CUSTOM',
        customProductData: {
          path: '$.asin',
          equals: asin
        }
      },
      data: {
        deviceType: 'OFFICIAL',
        productId: newProduct.id,
        customProductData: null
      }
    })

    revalidatePath('/admin/devices')
    revalidatePath('/admin/devices/promotion')

    return { 
      success: true, 
      message: `${newProduct.name} を公式商品に昇格しました`,
      productId: newProduct.id,
      updatedCount: customDevices.length
    }
  } catch (error) {
    console.error('Error promoting custom product:', error)
    return { success: false, error: '昇格処理中にエラーが発生しました' }
  }
}

// 昇格候補の詳細情報を取得
export async function getPromotionCandidate(asin: string) {
  try {
    const customDevices = await prisma.userDevice.findMany({
      where: {
        deviceType: 'CUSTOM',
        customProductData: {
          path: '$.asin',
          equals: asin
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            iconUrl: true,
            characterName: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (customDevices.length === 0) {
      return { success: false, error: '商品が見つかりません' }
    }

    const customData = customDevices[0].customProductData as CustomProductData

    return {
      success: true,
      data: {
        asin,
        title: customData.title,
        imageUrl: customData.imageUrl,
        amazonUrl: customData.amazonUrl,
        category: customData.category,
        attributes: customData.attributes,
        users: customDevices.map(device => ({
          ...device.user,
          addedAt: device.createdAt,
          note: device.note
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching promotion candidate:', error)
    return { success: false, error: '候補情報の取得に失敗しました' }
  }
}
