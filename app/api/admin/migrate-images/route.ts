/**
 * 既存の画像をMinIOに移行するAPI（管理者専用）
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { cacheImageToMinio } from '@/lib/services/image-cache';

export async function POST(request: NextRequest) {
  try {
    // 管理者権限チェック
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type = 'all', limit = 10 } = await request.json();

    let migratedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // 商品画像の移行
    if (type === 'all' || type === 'products') {
      const products = await db.product.findMany({
        where: {
          imageUrl: {
            not: {
              startsWith: 'http://localhost:9000',
            },
          },
        },
        take: limit,
      });

      for (const product of products) {
        if (product.imageUrl && !product.imageUrl.startsWith('/')) {
          try {
            const cachedUrl = await cacheImageToMinio(product.imageUrl);
            
            await db.product.update({
              where: { id: product.id },
              data: { imageUrl: cachedUrl },
            });
            
            migratedCount++;
            console.log(`Migrated product ${product.id}: ${cachedUrl}`);
          } catch (error) {
            errorCount++;
            const errorMsg = `Product ${product.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMsg);
            console.error('Migration error:', errorMsg);
          }
        }
      }
    }

    // カラー画像の移行
    if (type === 'all' || type === 'colors') {
      const productColors = await db.productColor.findMany({
        where: {
          imageUrl: {
            not: null,
            not: {
              startsWith: 'http://localhost:9000',
            },
          },
        },
        take: limit,
      });

      for (const productColor of productColors) {
        if (productColor.imageUrl && !productColor.imageUrl.startsWith('/')) {
          try {
            const cachedUrl = await cacheImageToMinio(productColor.imageUrl);
            
            await db.productColor.update({
              where: { id: productColor.id },
              data: { imageUrl: cachedUrl },
            });
            
            migratedCount++;
            console.log(`Migrated color ${productColor.id}: ${cachedUrl}`);
          } catch (error) {
            errorCount++;
            const errorMsg = `ProductColor ${productColor.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMsg);
            console.error('Migration error:', errorMsg);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      migratedCount,
      errorCount,
      errors: errors.slice(0, 10), // 最初の10件のエラーのみ返す
      message: `Successfully migrated ${migratedCount} images${errorCount > 0 ? `, ${errorCount} errors occurred` : ''}`,
    });

  } catch (error) {
    console.error('Image migration error:', error);
    return NextResponse.json(
      { error: 'Image migration failed' },
      { status: 500 }
    );
  }
}

// 移行状況の確認
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 統計情報を取得
    const [
      totalProducts,
      cachedProducts,
      totalColors,
      cachedColors,
    ] = await Promise.all([
      db.product.count(),
      db.product.count({
        where: {
          imageUrl: {
            startsWith: 'http://localhost:9000',
          },
        },
      }),
      db.productColor.count({
        where: {
          imageUrl: { not: null },
        },
      }),
      db.productColor.count({
        where: {
          imageUrl: {
            startsWith: 'http://localhost:9000',
          },
        },
      }),
    ]);

    return NextResponse.json({
      products: {
        total: totalProducts,
        cached: cachedProducts,
        remaining: totalProducts - cachedProducts,
      },
      colors: {
        total: totalColors,
        cached: cachedColors,
        remaining: totalColors - cachedColors,
      },
    });

  } catch (error) {
    console.error('Error getting migration status:', error);
    return NextResponse.json(
      { error: 'Failed to get migration status' },
      { status: 500 }
    );
  }
}