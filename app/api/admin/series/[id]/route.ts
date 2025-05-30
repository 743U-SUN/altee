import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const updateSeriesSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullable().optional(),
  manufacturerId: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

// GET: 特定のシリーズを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const series = await db.series.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

// PUT: シリーズを更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateSeriesSchema.parse(body);

    // メーカーの存在確認（manufacturerIdが変更される場合）
    if (validated.manufacturerId) {
      const manufacturer = await db.manufacturer.findUnique({
        where: { id: validated.manufacturerId },
      });

      if (!manufacturer) {
        return NextResponse.json(
          { error: '指定されたメーカーが見つかりません' },
          { status: 400 }
        );
      }
    }

    // 重複チェック（自分自身を除く）
    if (validated.name || validated.slug || validated.manufacturerId) {
      const currentSeries = await db.series.findUnique({
        where: { id: parseInt(params.id) },
      });

      if (!currentSeries) {
        return NextResponse.json(
          { error: 'Series not found' },
          { status: 404 }
        );
      }

      const manufacturerId = validated.manufacturerId || currentSeries.manufacturerId;
      
      const existing = await db.series.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(params.id) } },
            { manufacturerId },
            {
              OR: [
                validated.name ? { name: validated.name } : {},
                validated.slug ? { slug: validated.slug } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'このメーカーで同じ名前またはスラッグのシリーズが既に存在します' },
          { status: 400 }
        );
      }
    }

    const series = await db.series.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.slug !== undefined && { slug: validated.slug }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.manufacturerId !== undefined && { manufacturerId: validated.manufacturerId }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(series);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating series:', error);
    return NextResponse.json(
      { error: 'Failed to update series' },
      { status: 500 }
    );
  }
}

// DELETE: シリーズを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 関連する商品があるかチェック
    const productsCount = await db.product.count({
      where: { seriesId: parseInt(params.id) },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `このシリーズには ${productsCount} 件の商品が関連付けられています。先に商品を削除または更新してください。` },
        { status: 400 }
      );
    }

    await db.series.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting series:', error);
    return NextResponse.json(
      { error: 'Failed to delete series' },
      { status: 500 }
    );
  }
}