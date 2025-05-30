import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const reorderSchema = z.object({
  colors: z.array(z.object({
    id: z.number(),
    sortOrder: z.number(),
  })),
});

// PUT: カラーの並び順を更新
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = reorderSchema.parse(body);

    // トランザクションで一括更新
    await db.$transaction(
      validated.colors.map((color) =>
        db.color.update({
          where: { id: color.id },
          data: { sortOrder: color.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error reordering colors:', error);
    return NextResponse.json(
      { error: 'Failed to reorder colors' },
      { status: 500 }
    );
  }
}