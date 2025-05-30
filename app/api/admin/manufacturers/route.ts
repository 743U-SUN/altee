import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const createManufacturerSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  isActive: z.boolean().default(true),
});

// GET: メーカー一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const manufacturers = await db.manufacturer.findMany({
      include: {
        _count: {
          select: {
            products: true,
            series: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(manufacturers);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manufacturers' },
      { status: 500 }
    );
  }
}

// POST: 新しいメーカーを作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createManufacturerSchema.parse(body);

    // 重複チェック
    const existing = await db.manufacturer.findFirst({
      where: {
        OR: [
          { name: validated.name },
          { slug: validated.slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: '同じ名前またはスラッグのメーカーが既に存在します' },
        { status: 400 }
      );
    }

    const manufacturer = await db.manufacturer.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        logoUrl: validated.logoUrl || null,
        website: validated.website || null,
        isActive: validated.isActive,
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
    console.error('Error creating manufacturer:', error);
    return NextResponse.json(
      { error: 'Failed to create manufacturer' },
      { status: 500 }
    );
  }
}