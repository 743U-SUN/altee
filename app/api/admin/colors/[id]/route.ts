import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const updateColorSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).regex(/^[a-zA-Z\s]+$/).optional(),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  isActive: z.boolean().optional(),
});

// GET: 特定のカラーを取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const color = await db.color.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        _count: {
          select: {
            productColors: true,
          },
        },
      },
    });

    if (!color) {
      return NextResponse.json(
        { error: 'Color not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error fetching color:', error);
    return NextResponse.json(
      { error: 'Failed to fetch color' },
      { status: 500 }
    );
  }
}

// PUT: カラーを更新
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
    const validated = updateColorSchema.parse(body);

    // 重複チェック（自分自身を除く）
    if (validated.name || validated.nameEn) {
      const existing = await db.color.findFirst({
        where: {
          AND: [
            { id: { not: parseInt(params.id) } },
            {
              OR: [
                validated.name ? { name: validated.name } : {},
                validated.nameEn ? { nameEn: validated.nameEn } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: '同じ名前のカラーが既に存在します' },
          { status: 400 }
        );
      }
    }

    const color = await db.color.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.nameEn !== undefined && { nameEn: validated.nameEn }),
        ...(validated.hexCode !== undefined && { hexCode: validated.hexCode }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating color:', error);
    return NextResponse.json(
      { error: 'Failed to update color' },
      { status: 500 }
    );
  }
}

// DELETE: カラーを削除
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
    const productColorsCount = await db.productColor.count({
      where: { colorId: parseInt(params.id) },
    });

    if (productColorsCount > 0) {
      return NextResponse.json(
        { error: `このカラーは ${productColorsCount} 件の商品に使用されています。先に商品との関連を解除してください。` },
        { status: 400 }
      );
    }

    await db.color.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json(
      { error: 'Failed to delete color' },
      { status: 500 }
    );
  }
}