/**
 * 情報カテゴリ・質問管理関連のサーバーアクション
 */
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// バリデーションスキーマ
const createCategorySchema = z.object({
  name: z.string().min(1, "カテゴリ名は必須です").max(30, "カテゴリ名は30文字以内で入力してください"),
  sortOrder: z.number().int().min(0).optional(),
});

const updateCategorySchema = z.object({
  categoryId: z.string().uuid("有効なカテゴリIDを指定してください"),
  name: z.string().min(1, "カテゴリ名は必須です").max(30, "カテゴリ名は30文字以内で入力してください").optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const deleteCategorySchema = z.object({
  categoryId: z.string().uuid("有効なカテゴリIDを指定してください"),
});

const updateCategorySortOrderSchema = z.object({
  categories: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
});

const createQuestionSchema = z.object({
  categoryId: z.string().uuid("有効なカテゴリIDを指定してください"),
  question: z.string().max(30, "質問は30文字以内で入力してください"),
  answer: z.string().max(1000, "回答は1000文字以内で入力してください"),
  sortOrder: z.number().int().min(0).optional(),
});

const updateQuestionSchema = z.object({
  questionId: z.string().uuid("有効な質問IDを指定してください"),
  question: z.string().max(30, "質問は30文字以内で入力してください").optional(),
  answer: z.string().max(1000, "回答は1000文字以内で入力してください").optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const deleteQuestionSchema = z.object({
  questionId: z.string().uuid("有効な質問IDを指定してください"),
});

const updateQuestionSortOrderSchema = z.object({
  categoryId: z.string().uuid("有効なカテゴリIDを指定してください"),
  questions: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
});

// ========== カテゴリ管理 ==========

/**
 * ユーザーの情報カテゴリ一覧を取得（Q&A含む）
 */
export async function getUserInfoCategories() {
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

    const categories = await prisma.userInfoCategory.findMany({
      where: { userId: user.id },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return {
      success: true,
      data: categories
    };
  } catch (error) {
    console.error('getUserInfoCategories error:', error);
    return { success: false, error: 'カテゴリの取得に失敗しました' };
  }
}

/**
 * 情報カテゴリを作成
 */
export async function createInfoCategory(data: {
  name: string;
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

    const validated = createCategorySchema.parse(data);

    // カテゴリ数の制限チェック（最大5個）
    const existingCount = await prisma.userInfoCategory.count({
      where: { userId: user.id },
    });

    if (existingCount >= 5) {
      return { success: false, error: 'カテゴリは最大5個まで作成できます' };
    }

    // 重複チェック
    const existingCategory = await prisma.userInfoCategory.findFirst({
      where: {
        userId: user.id,
        name: validated.name,
      },
    });

    if (existingCategory) {
      return { success: false, error: '同名のカテゴリが既に存在します' };
    }

    // sortOrderが指定されていない場合は末尾に追加
    const sortOrder = validated.sortOrder ?? existingCount;

    const category = await prisma.userInfoCategory.create({
      data: {
        userId: user.id,
        name: validated.name,
        sortOrder,
      },
      include: {
        questions: true,
      },
    });

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return {
      success: true,
      data: category,
      message: 'カテゴリを作成しました',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('createInfoCategory error:', error);
    return { success: false, error: 'カテゴリの作成に失敗しました' };
  }
}

/**
 * 情報カテゴリを更新
 */
export async function updateInfoCategory(data: {
  categoryId: string;
  name?: string;
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

    const validated = updateCategorySchema.parse(data);

    // カテゴリの存在確認
    const existingCategory = await prisma.userInfoCategory.findFirst({
      where: {
        id: validated.categoryId,
        userId: user.id,
      },
    });

    if (!existingCategory) {
      return { success: false, error: 'カテゴリが見つかりません' };
    }

    // 名前の重複チェック（自分以外で同名があるか）
    if (validated.name) {
      const duplicateCategory = await prisma.userInfoCategory.findFirst({
        where: {
          userId: user.id,
          name: validated.name,
          id: { not: validated.categoryId },
        },
      });

      if (duplicateCategory) {
        return { success: false, error: '同名のカテゴリが既に存在します' };
      }
    }

    const updatedCategory = await prisma.userInfoCategory.update({
      where: { id: validated.categoryId },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.sortOrder !== undefined && { sortOrder: validated.sortOrder }),
      },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return {
      success: true,
      data: updatedCategory,
      message: 'カテゴリを更新しました',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('updateInfoCategory error:', error);
    return { success: false, error: 'カテゴリの更新に失敗しました' };
  }
}

/**
 * 情報カテゴリを削除
 */
export async function deleteInfoCategory(categoryId: string) {
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

    const validated = deleteCategorySchema.parse({ categoryId });

    // カテゴリの存在確認
    const existingCategory = await prisma.userInfoCategory.findFirst({
      where: {
        id: validated.categoryId,
        userId: user.id,
      },
      include: {
        questions: true,
      },
    });

    if (!existingCategory) {
      return { success: false, error: 'カテゴリが見つかりません' };
    }

    // カテゴリを削除（カスケードでQ&Aも削除される）
    await prisma.userInfoCategory.delete({
      where: { id: validated.categoryId },
    });

    // 残りのカテゴリの並び順を再調整
    const remainingCategories = await prisma.userInfoCategory.findMany({
      where: { userId: user.id },
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

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return {
      success: true,
      message: 'カテゴリを削除しました',
      deletedQuestionsCount: existingCategory.questions.length,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('deleteInfoCategory error:', error);
    return { success: false, error: 'カテゴリの削除に失敗しました' };
  }
}

/**
 * 情報カテゴリの並び順を更新
 */
export async function reorderInfoCategories(categories: { id: string; sortOrder: number }[]) {
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

    const validated = updateCategorySortOrderSchema.parse({ categories });

    // 全てのカテゴリが現在のユーザーのものかチェック
    const categoryIds = validated.categories.map(c => c.id);
    const existingCategories = await prisma.userInfoCategory.findMany({
      where: {
        id: { in: categoryIds },
        userId: user.id
      }
    });

    if (existingCategories.length !== categoryIds.length) {
      return { success: false, error: '権限のないカテゴリが含まれています' };
    }

    // トランザクションで並び順を更新
    await prisma.$transaction(
      validated.categories.map(({ id, sortOrder }) =>
        prisma.userInfoCategory.update({
          where: { id, userId: user.id },
          data: { sortOrder },
        })
      )
    );

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return { success: true, message: '並び順を更新しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('reorderInfoCategories error:', error);
    return { success: false, error: '並び順の更新に失敗しました' };
  }
}

// ========== 質問管理 ==========

/**
 * 情報質問を作成
 */
export async function createInfoQuestion(data: {
  categoryId: string;
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

    const validated = createQuestionSchema.parse(data);

    // カテゴリの存在確認と所有者チェック
    const category = await prisma.userInfoCategory.findFirst({
      where: {
        id: validated.categoryId,
        userId: user.id,
      },
      include: {
        questions: true,
      },
    });

    if (!category) {
      return { success: false, error: 'カテゴリが見つかりません' };
    }

    // sortOrderが指定されていない場合は末尾に追加
    const sortOrder = validated.sortOrder ?? category.questions.length;

    const question = await prisma.userInfoQuestion.create({
      data: {
        categoryId: validated.categoryId,
        question: validated.question,
        answer: validated.answer,
        sortOrder,
      },
    });

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return {
      success: true,
      data: question,
      message: 'Q&Aを作成しました',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('createInfoQuestion error:', error);
    return { success: false, error: 'Q&Aの作成に失敗しました' };
  }
}

/**
 * 情報質問を更新
 */
export async function updateInfoQuestion(data: {
  questionId: string;
  question?: string;
  answer?: string;
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

    const validated = updateQuestionSchema.parse(data);

    // Q&Aの存在確認と所有者チェック
    const question = await prisma.userInfoQuestion.findFirst({
      where: { id: validated.questionId },
      include: {
        category: true,
      },
    });

    if (!question) {
      return { success: false, error: 'Q&Aが見つかりません' };
    }

    if (question.category.userId !== user.id) {
      return { success: false, error: 'アクセス権限がありません' };
    }

    const updatedQuestion = await prisma.userInfoQuestion.update({
      where: { id: validated.questionId },
      data: {
        ...(validated.question !== undefined && { question: validated.question }),
        ...(validated.answer !== undefined && { answer: validated.answer }),
        ...(validated.sortOrder !== undefined && { sortOrder: validated.sortOrder }),
      },
    });

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return {
      success: true,
      data: updatedQuestion,
      message: 'Q&Aを更新しました',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('updateInfoQuestion error:', error);
    return { success: false, error: 'Q&Aの更新に失敗しました' };
  }
}

/**
 * 情報質問を削除
 */
export async function deleteInfoQuestion(questionId: string) {
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

    const validated = deleteQuestionSchema.parse({ questionId });

    // Q&Aの存在確認と所有者チェック
    const question = await prisma.userInfoQuestion.findFirst({
      where: { id: validated.questionId },
      include: {
        category: true,
      },
    });

    if (!question) {
      return { success: false, error: 'Q&Aが見つかりません' };
    }

    if (question.category.userId !== user.id) {
      return { success: false, error: 'アクセス権限がありません' };
    }

    // Q&Aを削除
    await prisma.userInfoQuestion.delete({
      where: { id: validated.questionId },
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

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return {
      success: true,
      message: 'Q&Aを削除しました',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('deleteInfoQuestion error:', error);
    return { success: false, error: 'Q&Aの削除に失敗しました' };
  }
}

/**
 * 情報質問の並び順を更新
 */
export async function reorderInfoQuestions(data: {
  categoryId: string;
  questions: { id: string; sortOrder: number }[];
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

    const validated = updateQuestionSortOrderSchema.parse(data);

    // カテゴリの所有者チェック
    const category = await prisma.userInfoCategory.findFirst({
      where: {
        id: validated.categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      return { success: false, error: 'カテゴリが見つかりません' };
    }

    // トランザクションで並び順を更新
    await prisma.$transaction(
      validated.questions.map(({ id, sortOrder }) =>
        prisma.userInfoQuestion.update({
          where: { id, categoryId: validated.categoryId },
          data: { sortOrder },
        })
      )
    );

    revalidatePath('/user/info');
    revalidatePath(`/${user.id}`);

    return { success: true, message: '並び順を更新しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('reorderInfoQuestions error:', error);
    return { success: false, error: '並び順の更新に失敗しました' };
  }
}