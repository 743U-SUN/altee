import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const updateManufacturerSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

// GET: 特定のメーカーを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const manufacturer = await db.manufacturer.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        _count: {
          select: {
            products: true,
            series: true,
          },
        },
      },
    });

    if (!manufacturer) {
      return NextResponse.json(
        { error: 'Manufacturer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(manufacturer);
  } catch (error) {
    console.error('Error fetching manufacturer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manufacturer' },
      { status: 500 }
    );
  }
}

// PUT: メーカーを更新
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
    const validated = updateManufacturerSchema.parse(body);

    // 重複チェック（自分自身を除く）
    if (validated.name || validated.slug) {
      const existing = await db.manufacturer.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(params.id) } },
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
          { error: '同じ名前またはスラッグのメーカーが既に存在します' },
          { status: 400 }
        );
      }
    }

    const manufacturer = await db.manufacturer.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.slug !== undefined && { slug: validated.slug }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.logoUrl !== undefined && { logoUrl: validated.logoUrl }),
        ...(validated.website !== undefined && { website: validated.website }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    return NextResponse.json(manufacturer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating manufacturer:', error);
    return NextResponse.json(
      { error: 'Failed to update manufacturer' },
      { status: 500 }
    );
  }
}

// DELETE: メーカーを削除
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
      where: { manufacturerId: parseInt(params.id) },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `このメーカーには ${productsCount} 件の商品が関連付けられています。先に商品を削除または更新してください。` },
        { status: 400 }
      );
    }

    await db.manufacturer.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting manufacturer:', error);
    return NextResponse.json(
      { error: 'Failed to delete manufacturer' },
      { status: 500 }
    );
  }
}