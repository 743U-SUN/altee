import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// バリデーションスキーマ
const createQuestionSchema = z.object({
  categoryId: z.string().uuid(),
  question: z.string().max(30), // 新規作成時は空文字列を許可
  answer: z.string().max(1000), // 新規作成時は空文字列を許可
  sortOrder: z.number().int().min(0).optional(),
});

const updateQuestionSchema = z.object({
  questionId: z.string().uuid(),
  question: z.string().max(30).optional(), // 空文字列を許可（保存時のバリデーションはフロントエンドで実施）
  answer: z.string().max(1000).optional(), // 空文字列を許可（保存時のバリデーションはフロントエンドで実施）
  sortOrder: z.number().int().min(0).optional(),
});

const deleteQuestionSchema = z.object({
  questionId: z.string().uuid(),
});

const updateSortOrderSchema = z.object({
  categoryId: z.string().uuid(),
  questions: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
});

// POST: Q&A作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createQuestionSchema.parse(body);

    // カテゴリの存在確認と所有者チェック
    const category = await prisma.userInfoCategory.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: session.user.id,
      },
      include: {
        questions: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 404 }
      );
    }

    // sortOrderが指定されていない場合は末尾に追加
    const sortOrder = validatedData.sortOrder ?? category.questions.length;

    const question = await prisma.userInfoQuestion.create({
      data: {
        categoryId: validatedData.categoryId,
        question: validatedData.question,
        answer: validatedData.answer,
        sortOrder,
      },
    });

    return NextResponse.json({
      question,
      message: 'Q&Aを作成しました',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create question error:', error);
    return NextResponse.json(
      { error: 'Q&Aの作成に失敗しました' },
      { status: 500 }
    );
  }
}

// PATCH: Q&A更新（内容変更、並び順変更）
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();

    // 並び順更新の場合
    if (body.questions && Array.isArray(body.questions)) {
      const validatedData = updateSortOrderSchema.parse(body);

      // カテゴリの所有者チェック
      const category = await prisma.userInfoCategory.findFirst({
        where: {
          id: validatedData.categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'カテゴリが見つかりません' },
          { status: 404 }
        );
      }

      // トランザクションで並び順を更新
      await prisma.$transaction(
        validatedData.questions.map(({ id, sortOrder }) =>
          prisma.userInfoQuestion.update({
            where: { id, categoryId: validatedData.categoryId },
            data: { sortOrder },
          })
        )
      );

      return NextResponse.json({ message: '並び順を更新しました' });
    }

    // 単一Q&A更新の場合
    const validatedData = updateQuestionSchema.parse(body);

    // Q&Aの存在確認と所有者チェック
    const question = await prisma.userInfoQuestion.findFirst({
      where: { id: validatedData.questionId },
      include: {
        category: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Q&Aが見つかりません' },
        { status: 404 }
      );
    }

    if (question.category.userId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const updatedQuestion = await prisma.userInfoQuestion.update({
      where: { id: validatedData.questionId },
      data: {
        ...(validatedData.question && { question: validatedData.question }),
        ...(validatedData.answer && { answer: validatedData.answer }),
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
      },
    });

    return NextResponse.json({
      question: updatedQuestion,
      message: 'Q&Aを更新しました',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update question error:', error);
    return NextResponse.json(
      { error: 'Q&Aの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: Q&A削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = deleteQuestionSchema.parse(body);

    // Q&Aの存在確認と所有者チェック
    const question = await prisma.userInfoQuestion.findFirst({
      where: { id: validatedData.questionId },
      include: {
        category: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Q&Aが見つかりません' },
        { status: 404 }
      );
    }

    if (question.category.userId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // Q&Aを削除
    await prisma.userInfoQuestion.delete({
      where: { id: validatedData.questionId },
    });

    // 残りのQ&Aの並び順を再調整
    const remainingQuestions = await prisma.userInfoQuestion.findMany({
      where: { categoryId: question.categoryId },
      orderBy: { sortOrder: 'asc' },
    });

    await prisma.$transaction(
      remainingQuestions.map((q, index) =>
        prisma.userInfoQuestion.update({
          where: { id: q.id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({
      message: 'Q&Aを削除しました',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Delete question error:', error);
    return NextResponse.json(
      { error: 'Q&Aの削除に失敗しました' },
      { status: 500 }
    );
  }
}
