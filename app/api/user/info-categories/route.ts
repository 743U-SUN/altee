import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// バリデーションスキーマ
const createCategorySchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(30),
  sortOrder: z.number().int().min(0).optional(),
});

const updateCategorySchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(30).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const deleteCategorySchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

const updateSortOrderSchema = z.object({
  userId: z.string().uuid(),
  categories: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
});

// GET: カテゴリ一覧取得（Q&A含む）
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userIdが必要です' }, { status: 400 });
    }

    // 本人のみアクセス可能
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const categories = await prisma.userInfoCategory.findMany({
      where: { userId },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'カテゴリの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: カテゴリ作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // 本人のみアクセス可能
    if (session.user.id !== validatedData.userId) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // カテゴリ数の制限チェック（最大5個）
    const existingCount = await prisma.userInfoCategory.count({
      where: { userId: validatedData.userId },
    });

    if (existingCount >= 5) {
      return NextResponse.json(
        { error: 'カテゴリは最大5個まで作成できます' },
        { status: 400 }
      );
    }

    // 重複チェック
    const existingCategory = await prisma.userInfoCategory.findFirst({
      where: {
        userId: validatedData.userId,
        name: validatedData.name,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: '同名のカテゴリが既に存在します' },
        { status: 400 }
      );
    }

    // sortOrderが指定されていない場合は末尾に追加
    const sortOrder = validatedData.sortOrder ?? existingCount;

    const category = await prisma.userInfoCategory.create({
      data: {
        userId: validatedData.userId,
        name: validatedData.name,
        sortOrder,
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json({
      category,
      message: 'カテゴリを作成しました',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'カテゴリの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PATCH: カテゴリ更新（名前変更、並び順変更）
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();

    // 並び順更新の場合
    if (body.categories && Array.isArray(body.categories)) {
      const validatedData = updateSortOrderSchema.parse(body);

      // 本人のみアクセス可能
      if (session.user.id !== validatedData.userId) {
        return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
      }

      // トランザクションで並び順を更新
      await prisma.$transaction(
        validatedData.categories.map(({ id, sortOrder }) =>
          prisma.userInfoCategory.update({
            where: { id, userId: validatedData.userId },
            data: { sortOrder },
          })
        )
      );

      return NextResponse.json({ message: '並び順を更新しました' });
    }

    // 単一カテゴリ更新の場合
    const validatedData = updateCategorySchema.parse(body);

    // 本人のみアクセス可能
    if (session.user.id !== validatedData.userId) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // カテゴリの存在確認
    const existingCategory = await prisma.userInfoCategory.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: validatedData.userId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 404 }
      );
    }

    // 名前の重複チェック（自分以外で同名があるか）
    if (validatedData.name) {
      const duplicateCategory = await prisma.userInfoCategory.findFirst({
        where: {
          userId: validatedData.userId,
          name: validatedData.name,
          id: { not: validatedData.categoryId },
        },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: '同名のカテゴリが既に存在します' },
          { status: 400 }
        );
      }
    }

    const updatedCategory = await prisma.userInfoCategory.update({
      where: { id: validatedData.categoryId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
      },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({
      category: updatedCategory,
      message: 'カテゴリを更新しました',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'カテゴリの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: カテゴリ削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = deleteCategorySchema.parse(body);

    // 本人のみアクセス可能
    if (session.user.id !== validatedData.userId) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // カテゴリの存在確認
    const existingCategory = await prisma.userInfoCategory.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: validatedData.userId,
      },
      include: {
        questions: true,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 404 }
      );
    }

    // カテゴリを削除（カスケードでQ&Aも削除される）
    await prisma.userInfoCategory.delete({
      where: { id: validatedData.categoryId },
    });

    // 残りのカテゴリの並び順を再調整
    const remainingCategories = await prisma.userInfoCategory.findMany({
      where: { userId: validatedData.userId },
      orderBy: { sortOrder: 'asc' },
    });

    await prisma.$transaction(
      remainingCategories.map((category, index) =>
        prisma.userInfoCategory.update({
          where: { id: category.id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({
      message: 'カテゴリを削除しました',
      deletedQuestionsCount: existingCategory.questions.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'カテゴリの削除に失敗しました' },
      { status: 500 }
    );
  }
}
