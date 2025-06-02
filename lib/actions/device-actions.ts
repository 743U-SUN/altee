/**
 * デバイス関連のサーバーアクション
 */

'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// Prismaクライアントの確認
if (!prisma) {
  console.error('[device-actions] Prisma client is not initialized!');
}
import { revalidatePath } from 'next/cache';
import type { CustomProductData } from '@/types/device';
import { fetchProductFromAmazonUrl, extractAttributes } from '@/lib/services/amazon';
import { extractASIN, addAssociateIdToUrl, detectCategoryFromTitle } from '@/lib/utils/amazon';
import { 
  createDeviceFromProductSchema, 
  createDeviceFromUrlSchema,
  updateDeviceSchema 
} from '@/lib/validation/device-validation';
import type { Product, DeviceCategory } from '@/lib/generated/prisma';

/**
 * 個別デバイスの詳細情報を取得
 */
export async function getDeviceById(deviceId: number) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }
    
    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const device = await prisma.userDevice.findFirst({
      where: {
        id: deviceId,
        userId: user.id,
      },
      include: {
        product: {
          include: {
            category: true,
            manufacturer: true,
            productColors: {
              include: {
                color: true,
              },
            },
          },
        },
        color: true,
      },
    });

    if (!device) {
      return { success: false, error: 'デバイスが見つかりません' };
    }

    // Decimal型をstring型に変換してClient Componentで使用可能にする
    const serializedDevice = {
      ...device,
      product: device.product ? {
        ...device.product,
        price: device.product.price ? device.product.price.toString() : null,
      } : null,
    };

    return { success: true, data: serializedDevice };
  } catch (error) {
    console.error('getDeviceById error:', error);
    return { success: false, error: 'デバイスの取得に失敗しました' };
  }
}

/**
 * ユーザーのデバイス一覧を取得（フィルタリング・ページネーション付き）
 */
export async function getUserDevicesFiltered(filters: {
  category?: string;
  deviceType?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }
    
    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    // フィルタ条件を構築
    const where: any = { userId: user.id };
    
    if (filters.deviceType && filters.deviceType !== 'all') {
      where.deviceType = filters.deviceType;
    }
    
    // デバイスを取得
    const devices = await prisma.userDevice.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
            manufacturer: true,
            productColors: {
              include: {
                color: true,
              },
            },
          },
        },
        color: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // カテゴリフィルタリング（カスタム商品のため）
    const filteredDevices = filters.category && filters.category !== 'all' 
      ? devices.filter(device => {
          if (device.deviceType === 'OFFICIAL') {
            return device.product?.category.slug === filters.category;
          } else {
            const customData = device.customProductData as any;
            return customData?.category === filters.category;
          }
        })
      : devices;

    // 総数を取得
    const total = await prisma.userDevice.count({ where });

    // Decimal型をstring型に変換してClient Componentで使用可能にする
    const serializedDevices = filteredDevices.map(device => ({
      ...device,
      product: device.product ? {
        ...device.product,
        price: device.product.price ? device.product.price.toString() : null,
      } : null,
    }));

    return {
      success: true,
      data: {
        devices: serializedDevices,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    };
  } catch (error) {
    console.error('getUserDevicesFiltered error:', error);
    return { success: false, error: 'デバイスの取得に失敗しました' };
  }
}

/**
 * ユーザーのデバイス一覧を取得
 */
export async function getUserDevices(userId?: string) {
  const session = await auth();
  let targetUserId = userId;
  
  // userIdが指定されていない場合、セッションから取得
  if (!targetUserId) {
    if (!session?.user?.email) {
      throw new Error('認証が必要です');
    }
    
    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    
    targetUserId = user.id;
  }

  const devices = await prisma.userDevice.findMany({
    where: { userId: targetUserId },
    include: {
      product: {
        include: {
          category: true,
          manufacturer: true,
          productColors: {
            include: {
              color: true,
            },
          },
        },
      },
      color: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Decimal型をstring型に変換してClient Componentで使用可能にする
  const serializedDevices = devices.map(device => ({
    ...device,
    product: device.product ? {
      ...device.product,
      price: device.product.price ? device.product.price.toString() : null,
    } : null,
  }));

  return serializedDevices;
}



/**
 * 公式商品からデバイスを追加
 */
export async function addDeviceFromProduct(data: {
  productId: number;
  note?: string;
  colorId?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }
    
    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const validated = createDeviceFromProductSchema.parse(data);

    // 商品の存在確認
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
    });

    if (!product) {
      return { success: false, error: '商品が見つかりません' };
    }

    // デバイスを作成
    const device = await prisma.userDevice.create({
      data: {
        userId: user.id,
        productId: validated.productId,
        colorId: validated.colorId,
        deviceType: 'OFFICIAL',
        note: validated.note,
      },
    });

    revalidatePath('/user/devices');
    return { success: true, device };
  } catch (error) {
    console.error('addDeviceFromProduct error:', error);
    return { success: false, error: 'デバイスの追加に失敗しました' };
  }
}

/**
 * ASINで既存の商品をチェック
 */
export async function checkExistingProductByAsin(asin: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return null;
    }
    
    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return null;
    }

    // 公式商品をチェック
    const officialProduct = await prisma.product.findUnique({
      where: { asin },
      include: {
        category: true,
      },
    });

    // カスタム商品をチェック（他のユーザーが追加したもの）
    const customProducts = await prisma.userDevice.findMany({
      where: {
        deviceType: 'CUSTOM',
        customProductData: {
          path: ['asin'],
          equals: asin,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            handle: true,
            name: true,
            iconUrl: true,
          },
        },
      },
    });

    // 現在のユーザーが既に同じ商品を持っているかチェック
    const userExistingDevice = await prisma.userDevice.findFirst({
      where: {
        userId: user.id,
        OR: [
          {
            product: {
              asin,
            },
          },
          {
            deviceType: 'CUSTOM',
            customProductData: {
              path: ['asin'],
              equals: asin,
            },
          },
        ],
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return {
      officialProduct,
      customProducts,
      userExistingDevice,
      totalUsers: customProducts.length + (officialProduct ? 1 : 0),
    };
  } catch (error) {
    console.error('Error checking existing product:', error);
    return null;
  }
}

/**
 * Amazon URLから商品情報をプレビュー（追加前の確認用）
 */
export async function previewProductFromUrl(amazonUrl: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }

    console.log('Original URL:', amazonUrl);

    // ASINを抽出
    const asin = await extractASIN(amazonUrl);
    console.log('Extracted ASIN:', asin);
    
    if (!asin) {
      return { success: false, error: '有効なAmazon商品URLではありません' };
    }

    // 重複チェック
    const existingCheck = await checkExistingProductByAsin(asin);

    // 商品情報を取得
    console.log('Fetching product info for URL:', amazonUrl);
    const productInfo = await fetchProductFromAmazonUrl(amazonUrl);
    console.log('Product info retrieved:', { title: productInfo.title, asin: productInfo.asin });
    
    // カテゴリーを検出
    const detectedCategory = detectCategoryFromTitle(productInfo.title);

    return {
      success: true,
      productInfo,
      asin,
      detectedCategory,
      duplicateInfo: existingCheck,
    };
  } catch (error) {
    console.error('previewProductFromUrl error:', error);
    const errorMessage = error instanceof Error ? error.message : '商品情報の取得に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * Amazon URLからデバイスを追加（重複チェック付き）
 */
export async function addDeviceFromUrl(data: {
  amazonUrl: string;
  category?: string;
  note?: string;
  customTitle?: string;
  forceAdd?: boolean; // 重複があっても強制的に追加するかどうか
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }
    
    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, amazonAssociateId: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const validated = createDeviceFromUrlSchema.parse(data);

    // ASINを抽出
    const asin = await extractASIN(validated.amazonUrl);
    if (!asin) {
      return { success: false, error: '有効なAmazon商品URLではありません' };
    }

    // 重複チェック（forceAddがfalseの場合のみ）
    if (!data.forceAdd) {
      const existingCheck = await checkExistingProductByAsin(asin);
      
      // ユーザーが既に同じ商品を持っている場合
      if (existingCheck?.userExistingDevice) {
        return { 
          success: false, 
          error: 'DUPLICATE_USER_DEVICE',
          duplicateInfo: existingCheck 
        };
      }

      // 公式商品が存在する場合
      if (existingCheck?.officialProduct) {
        // 公式商品を使ってデバイスを作成
        const device = await prisma.userDevice.create({
          data: {
            userId: user.id,
            deviceType: 'OFFICIAL',
            productId: existingCheck.officialProduct.id,
            note: validated.note,
          },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        });

        revalidatePath('/user/devices');
        return { 
          success: true, 
          device,
          usedOfficialProduct: true,
          duplicateInfo: existingCheck 
        };
      }
    }

    // ユーザー情報を取得
    // const user = await prisma.user.findUnique({
    //   where: { id: session.user.id },
    //   select: { amazonAssociateId: true },
    // });
    // 既に上で取得済み

    // 商品情報を取得
    const productInfo = await fetchProductFromAmazonUrl(validated.amazonUrl);
    
    // カテゴリーを決定
    const category = validated.category || detectCategoryFromTitle(productInfo.title);
    
    // 属性を抽出
    const attributes = await extractAttributes(productInfo, category);

    // アフィリエイトURLを生成
    const userAffiliateUrl = user?.amazonAssociateId 
      ? addAssociateIdToUrl(validated.amazonUrl, user.amazonAssociateId)
      : undefined;

    // カスタム商品データを作成
    const customProductData: CustomProductData = {
      title: validated.customTitle || productInfo.title, // カスタムタイトルがあれば使用
      description: productInfo.description,
      imageUrl: productInfo.imageUrl,
      amazonUrl: validated.amazonUrl,
      userAffiliateUrl,
      asin,
      category,
      attributes,
      addedByUserId: user.id,
      potentialForPromotion: true, // 昇格候補フラグをtrueに
      createdAt: new Date().toISOString(),
    };

    // デバイスを作成
    const device = await prisma.userDevice.create({
      data: {
        userId: user.id,
        deviceType: 'CUSTOM',
        customProductData: customProductData as any,
        note: validated.note,
      },
    });

    revalidatePath('/user/devices');
    
    // 重複チェック情報も返す
    const finalCheck = await checkExistingProductByAsin(asin);
    return { 
      success: true, 
      device,
      usedOfficialProduct: false,
      duplicateInfo: finalCheck 
    };
  } catch (error) {
    console.error('addDeviceFromUrl error:', error);
    return { success: false, error: 'デバイスの追加に失敗しました' };
  }
}

/**
 * デバイスを更新
 */
export async function updateDevice(deviceId: number, data: { note?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }
    
    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const validated = updateDeviceSchema.parse(data);

    // デバイスの所有者確認
    const device = await prisma.userDevice.findFirst({
      where: {
        id: deviceId,
        userId: user.id,
      },
    });

    if (!device) {
      return { success: false, error: 'デバイスが見つかりません' };
    }

    // 更新
    const updatedDevice = await prisma.userDevice.update({
      where: { id: deviceId },
      data: { note: validated.note },
    });

    revalidatePath('/user/devices');
    return { success: true, device: updatedDevice };
  } catch (error) {
    console.error('updateDevice error:', error);
    return { success: false, error: 'デバイスの更新に失敗しました' };
  }
}

/**
 * デバイスを削除
 */
export async function deleteDevice(deviceId: number) {
  try {
    console.log('[deleteDevice] Start - deviceId:', deviceId);
    
    const session = await auth();
    console.log('[deleteDevice] Session:', { hasSession: !!session, email: session?.user?.email });
    
    if (!session?.user?.email) {
      console.error('[deleteDevice] No session or email');
      return { success: false, error: '認証が必要です' };
    }
    
    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    console.log('[deleteDevice] User found:', { userId: user?.id });
    
    if (!user) {
      console.error('[deleteDevice] User not found for email:', session.user.email);
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    // デバイスの所有者確認
    const device = await prisma.userDevice.findFirst({
      where: {
        id: deviceId,
        userId: user.id,
      },
    });

    console.log('[deleteDevice] Device found:', { deviceId: device?.id, userId: device?.userId });

    if (!device) {
      console.error('[deleteDevice] Device not found or not owned by user:', { deviceId, userId: user.id });
      return { success: false, error: 'デバイスが見つかりません' };
    }

    // 削除
    console.log('[deleteDevice] Deleting device...');
    await prisma.userDevice.delete({
      where: { id: deviceId },
    });

    console.log('[deleteDevice] Device deleted successfully');
    revalidatePath('/user/devices');
    return { success: true };
  } catch (error) {
    console.error('[deleteDevice] Error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { success: false, error: error instanceof Error ? error.message : 'デバイスの削除に失敗しました' };
  }
}

/**
 * 公式商品一覧を取得
 */
export async function getOfficialProducts(category?: string) {
  const where = category && category !== 'all' 
    ? { category: { slug: category }, isActive: true } 
    : { isActive: true };
  
  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      manufacturer: true,
      productColors: {
        include: {
          color: true,
        },
        orderBy: {
          color: {
            sortOrder: 'asc',
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Decimal型をstring型に変換してClient Componentで使用可能にする
  const serializedProducts = products.map(product => ({
    ...product,
    price: product.price ? product.price.toString() : null,
  }));

  return serializedProducts;
}
