import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const updateColorsSchema = z.object({
  colors: z.array(z.object({
    colorId: z.number(),
    imageUrl: z.string().nullable(),
    isDefault: z.boolean(),
  })),
});

// PUT: 商品のカラー設定を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.productId);
    const body = await request.json();
    const validated = updateColorsSchema.parse(body);

    // 商品の存在確認
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // トランザクションで既存のカラー設定を削除して新規作成
    await db.$transaction(async (tx) => {
      // 既存のカラー設定を削除
      await tx.productColor.deleteMany({
        where: { productId },
      });

      // 新しいカラー設定を作成
      if (validated.colors.length > 0) {
        await tx.productColor.createMany({
          data: validated.colors.map((color) => ({
            productId,
            colorId: color.colorId,
            imageUrl: color.imageUrl,
            isDefault: color.isDefault,
          })),
        });
      }
    });

    // 更新後のデータを取得
    const updatedProduct = await db.product.findUnique({
      where: { id: productId },
      include: {
        productColors: {
          include: {
            color: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating product colors:', error);
    return NextResponse.json(
      { error: 'Failed to update product colors' },
      { status: 500 }
    );
  }
}

// GET: 商品のカラー設定を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const productColors = await db.productColor.findMany({
      where: { productId: parseInt(resolvedParams.productId) },
      include: {
        color: true,
      },
      orderBy: {
        color: {
          sortOrder: 'asc',
        },
      },
    });

    return NextResponse.json(productColors);
  } catch (error) {
    console.error('Error fetching product colors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product colors' },
      { status: 500 }
    );
  }
}