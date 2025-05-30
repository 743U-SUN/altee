import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const createColorSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().min(1).regex(/^[a-zA-Z\s]+$/),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  isActive: z.boolean().default(true),
});

// GET: カラー一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const colors = await db.color.findMany({
      include: {
        _count: {
          select: {
            productColors: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch colors' },
      { status: 500 }
    );
  }
}

// POST: 新しいカラーを作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createColorSchema.parse(body);

    // 重複チェック
    const existing = await db.color.findFirst({
      where: {
        OR: [
          { name: validated.name },
          { nameEn: validated.nameEn },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: '同じ名前のカラーが既に存在します' },
        { status: 400 }
      );
    }

    // 最大のsortOrderを取得
    const maxSortOrder = await db.color.aggregate({
      _max: {
        sortOrder: true,
      },
    });

    const color = await db.color.create({
      data: {
        name: validated.name,
        nameEn: validated.nameEn,
        hexCode: validated.hexCode || null,
        isActive: validated.isActive,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
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
    console.error('Error creating color:', error);
    return NextResponse.json(
      { error: 'Failed to create color' },
      { status: 500 }
    );
  }
}