import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const createSeriesSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  manufacturerId: z.number().min(1),
  isActive: z.boolean().default(true),
});

// GET: シリーズ一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const series = await db.series.findMany({
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
      orderBy: [
        { manufacturer: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

// POST: 新しいシリーズを作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createSeriesSchema.parse(body);

    // メーカーの存在確認
    const manufacturer = await db.manufacturer.findUnique({
      where: { id: validated.manufacturerId },
    });

    if (!manufacturer) {
      return NextResponse.json(
        { error: '指定されたメーカーが見つかりません' },
        { status: 400 }
      );
    }

    // 重複チェック（同じメーカー内でのシリーズ名とスラッグの重複を防ぐ）
    const existing = await db.series.findFirst({
      where: {
        manufacturerId: validated.manufacturerId,
        OR: [
          { name: validated.name },
          { slug: validated.slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'このメーカーで同じ名前またはスラッグのシリーズが既に存在します' },
        { status: 400 }
      );
    }

    const series = await db.series.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        manufacturerId: validated.manufacturerId,
        isActive: validated.isActive,
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
    console.error('Error creating series:', error);
    return NextResponse.json(
      { error: 'Failed to create series' },
      { status: 500 }
    );
  }
}