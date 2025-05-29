/**
 * デバイス一覧API
 * GET /api/devices - デバイス一覧取得
 * POST /api/devices - デバイス作成
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { 
  createDeviceFromProductSchema, 
  createDeviceFromUrlSchema,
  getDevicesFilterSchema 
} from '@/lib/validation/device-validation';
import { fetchProductInfo, extractAttributes } from '@/lib/services/amazon';
import { extractASIN, addAssociateIdToUrl, detectCategoryFromTitle } from '@/lib/utils/amazon';
import type { CustomProductData } from '@/types/device';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // クエリパラメータを解析
    const searchParams = request.nextUrl.searchParams;
    const filter = getDevicesFilterSchema.parse({
      category: searchParams.get('category') || 'all',
      deviceType: searchParams.get('deviceType') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    });

    // フィルタ条件を構築
    const where: any = { userId: session.user.id };
    
    if (filter.deviceType !== 'all') {
      where.deviceType = filter.deviceType;
    }
    
    if (filter.category !== 'all') {
      // カテゴリフィルタは複雑なので、後でフィルタリング
    }

    // デバイスを取得
    const devices = await prisma.userDevice.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (filter.page - 1) * filter.limit,
      take: filter.limit,
    });

    // カテゴリフィルタリング（カスタム商品のため）
    const filteredDevices = filter.category === 'all' 
      ? devices 
      : devices.filter(device => {
          if (device.deviceType === 'OFFICIAL') {
            return device.product?.category.slug === filter.category;
          } else {
            const customData = device.customProductData as CustomProductData;
            return customData.category === filter.category;
          }
        });

    // 総数を取得
    const total = await prisma.userDevice.count({ where });

    return NextResponse.json({
      devices: filteredDevices,
      pagination: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    });
  } catch (error) {
    console.error('GET /api/devices error:', error);
    return NextResponse.json(
      { error: 'デバイスの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    
    // デバイスタイプを判定
    if ('productId' in body) {
      // 公式商品からの追加
      const validated = createDeviceFromProductSchema.parse(body);
      
      // 商品の存在確認
      const product = await prisma.product.findUnique({
        where: { id: validated.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: '商品が見つかりません' },
          { status: 404 }
        );
      }

      // デバイスを作成
      const device = await prisma.userDevice.create({
        data: {
          userId: session.user.id,
          productId: validated.productId,
          deviceType: 'OFFICIAL',
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

      return NextResponse.json({ device }, { status: 201 });
    } else if ('amazonUrl' in body) {
      // Amazon URLからの追加
      const validated = createDeviceFromUrlSchema.parse(body);
      
      // ASINを抽出
      const asin = extractASIN(validated.amazonUrl);
      if (!asin) {
        return NextResponse.json(
          { error: '有効なAmazon商品URLではありません' },
          { status: 400 }
        );
      }

      // ユーザー情報を取得
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { amazonAssociateId: true },
      });

      // 商品情報を取得
      const productInfo = await fetchProductInfo(validated.amazonUrl);
      
      // カテゴリーを決定
      const category = validated.category || detectCategoryFromTitle(productInfo.title);
      
      // 属性を抽出
      const attributes = await extractAttributes(productInfo, category);

      // アフィリエイトURLを生成
      const userAssociateId = validated.userAssociateId || user?.amazonAssociateId;
      const userAffiliateUrl = userAssociateId 
        ? addAssociateIdToUrl(validated.amazonUrl, userAssociateId)
        : undefined;

      // カスタム商品データを作成
      const customProductData: CustomProductData = {
        title: productInfo.title,
        description: productInfo.description,
        imageUrl: productInfo.imageUrl,
        amazonUrl: validated.amazonUrl,
        userAffiliateUrl,
        asin,
        category,
        attributes,
        addedByUserId: session.user.id,
        potentialForPromotion: false,
        createdAt: new Date().toISOString(),
      };

      // デバイスを作成
      const device = await prisma.userDevice.create({
        data: {
          userId: session.user.id,
          deviceType: 'CUSTOM',
          customProductData,
          note: validated.note,
        },
      });

      return NextResponse.json({ device }, { status: 201 });
    } else {
      return NextResponse.json(
        { error: '不正なリクエストです' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('POST /api/devices error:', error);
    return NextResponse.json(
      { error: 'デバイスの作成に失敗しました' },
      { status: 500 }
    );
  }
}
