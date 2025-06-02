/**
 * カスタムQ&A関連のサーバーアクション
 */
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// バリデーションスキーマ
const createQASchema = z.object({
  question: z.string().min(1, "質問を入力してください").max(20, "質問は20文字以内で入力してください"),
  answer: z.string().min(1, "回答を入力してください").max(50, "回答は50文字以内で入力してください"),
  sortOrder: z.number().optional().default(0),
});

const updateQASchema = z.object({
  question: z.string().min(1, "質問を入力してください").max(20, "質問は20文字以内で入力してください").optional(),
  answer: z.string().min(1, "回答を入力してください").max(50, "回答は50文字以内で入力してください").optional(),
});

const reorderQASchema = z.array(z.object({
  id: z.number(),
  sortOrder: z.number(),
}));

/**
 * ユーザーのカスタムQ&A一覧を取得
 */
export async function getUserCustomQuestions() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    const customQuestions = await prisma.userCustomQuestion.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: 'asc' }
    });

    return { success: true, data: customQuestions };
  } catch (error) {
    console.error('getUserCustomQuestions error:', error);
    return { success: false, error: 'Q&Aの取得に失敗しました' };
  }
}

/**
 * カスタムQ&Aを作成
 */
export async function createCustomQuestion(data: {
  question: string;
  answer: string;
  sortOrder?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    // バリデーション
    const validated = createQASchema.parse(data);

    // Q&Aを作成
    const customQuestion = await prisma.userCustomQuestion.create({
      data: {
        userId: user.id,
        question: validated.question.trim(),
        answer: validated.answer.trim(),
        sortOrder: validated.sortOrder || 0
      }
    });

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`); // ユーザーページのキャッシュも更新

    return { 
      success: true, 
      data: customQuestion,
      message: 'Q&Aを追加しました'
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('createCustomQuestion error:', error);
    return { success: false, error: 'Q&Aの追加に失敗しました' };
  }
}

/**
 * カスタムQ&Aを更新
 */
export async function updateCustomQuestion(questionId: number, data: {
  question?: string;
  answer?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    // バリデーション
    const validated = updateQASchema.parse(data);

    // Q&Aの存在確認
    const customQuestion = await prisma.userCustomQuestion.findUnique({
      where: { id: questionId }
    });

    if (!customQuestion || customQuestion.userId !== user.id) {
      return { success: false, error: 'Q&Aが見つかりません' };
    }

    // 更新データを準備
    const updateData: any = {};
    if (validated.question !== undefined) updateData.question = validated.question.trim();
    if (validated.answer !== undefined) updateData.answer = validated.answer.trim();

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: '更新するデータがありません' };
    }

    // Q&Aを更新
    const updatedQuestion = await prisma.userCustomQuestion.update({
      where: { id: questionId },
      data: updateData
    });

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return { 
      success: true, 
      data: updatedQuestion,
      message: 'Q&Aを更新しました'
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('updateCustomQuestion error:', error);
    return { success: false, error: 'Q&Aの更新に失敗しました' };
  }
}

/**
 * カスタムQ&Aを削除
 */
export async function deleteCustomQuestion(questionId: number) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    // Q&Aの存在確認
    const customQuestion = await prisma.userCustomQuestion.findUnique({
      where: { id: questionId }
    });

    if (!customQuestion || customQuestion.userId !== user.id) {
      return { success: false, error: 'Q&Aが見つかりません' };
    }

    // Q&Aを削除
    await prisma.userCustomQuestion.delete({
      where: { id: questionId }
    });

    // 削除後の並び順を調整
    const remainingQuestions = await prisma.userCustomQuestion.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: 'asc' }
    });

    // 並び順を更新
    await Promise.all(
      remainingQuestions.map((item, index) =>
        prisma.userCustomQuestion.update({
          where: { id: item.id },
          data: { sortOrder: index }
        })
      )
    );

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return { 
      success: true,
      message: 'Q&Aを削除しました'
    };
  } catch (error) {
    console.error('deleteCustomQuestion error:', error);
    return { success: false, error: 'Q&Aの削除に失敗しました' };
  }
}

/**
 * カスタムQ&Aの並び順を更新
 */
export async function reorderCustomQuestions(questions: { id: number; sortOrder: number }[]) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }

    // emailからユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    // バリデーション
    const validated = reorderQASchema.parse(questions);

    // 全てのQ&Aが現在のユーザーのものかチェック
    const questionIds = validated.map(q => q.id);
    const existingQuestions = await prisma.userCustomQuestion.findMany({
      where: {
        id: { in: questionIds },
        userId: user.id
      }
    });

    if (existingQuestions.length !== questionIds.length) {
      return { success: false, error: '権限のないQ&Aが含まれています' };
    }

    // 並び順を更新
    await Promise.all(
      validated.map((item) =>
        prisma.userCustomQuestion.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return { 
      success: true,
      message: '並び順を更新しました'
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('reorderCustomQuestions error:', error);
    return { success: false, error: '並び順の更新に失敗しました' };
  }
}