'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface CreateCategoryData {
  name: string;
  description?: string;
  slug?: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  slug?: string;
  color?: string;
  sortOrder?: number;
}

/**
 * slugを生成する関数
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 特殊文字を除去
    .replace(/\s+/g, '-') // スペースをハイフンに
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .trim();
}

/**
 * メディアカテゴリを作成
 */
export async function createMediaCategoryAction(
  data: CreateCategoryData
): Promise<{ success: boolean; error?: string; categoryId?: string }> {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: '認証が必要です' };
    }

    // 管理者権限チェック
    if (session.user.role !== 'admin') {
      return { success: false, error: '管理者権限が必要です' };
    }

    const { name, description, slug, color } = data;

    // バリデーション
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'カテゴリ名は必須です' };
    }

    if (name.length > 50) {
      return { success: false, error: 'カテゴリ名は50文字以下にしてください' };
    }

    // slug生成または検証
    const finalSlug = slug || generateSlug(name);
    
    if (finalSlug.length === 0) {
      return { success: false, error: '有効なslugを生成できませんでした' };
    }

    // 重複チェック
    const existingByName = await prisma.mediaCategory.findUnique({
      where: { name }
    });

    if (existingByName) {
      return { success: false, error: '同じ名前のカテゴリが既に存在します' };
    }

    const existingBySlug = await prisma.mediaCategory.findUnique({
      where: { slug: finalSlug }
    });

    if (existingBySlug) {
      return { success: false, error: '同じslugのカテゴリが既に存在します' };
    }

    // 次の表示順序を取得
    const lastCategory = await prisma.mediaCategory.findFirst({
      orderBy: { sortOrder: 'desc' }
    });

    const nextSortOrder = (lastCategory?.sortOrder || 0) + 1;

    // カテゴリ作成
    const category = await prisma.mediaCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        slug: finalSlug,
        color: color || '#6366f1',
        isSystem: false,
        sortOrder: nextSortOrder
      }
    });

    revalidatePath('/admin/media');

    return { 
      success: true, 
      categoryId: category.id 
    };

  } catch (error) {
    console.error('Create category error:', error);
    return { success: false, error: 'カテゴリの作成に失敗しました' };
  }
}

/**
 * メディアカテゴリを更新
 */
export async function updateMediaCategoryAction(
  categoryId: string,
  data: UpdateCategoryData
): Promise<{ success: boolean; error?: string }> {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: '認証が必要です' };
    }

    // 管理者権限チェック
    if (session.user.role !== 'admin') {
      return { success: false, error: '管理者権限が必要です' };
    }

    // カテゴリ存在確認
    const existingCategory = await prisma.mediaCategory.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return { success: false, error: 'カテゴリが見つかりません' };
    }

    // システムカテゴリの場合、slugの変更を禁止
    if (existingCategory.isSystem && data.slug && data.slug !== existingCategory.slug) {
      return { success: false, error: 'システムカテゴリのslugは変更できません' };
    }

    // バリデーション
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        return { success: false, error: 'カテゴリ名は必須です' };
      }

      if (data.name.length > 50) {
        return { success: false, error: 'カテゴリ名は50文字以下にしてください' };
      }

      // 名前の重複チェック（自分以外）
      const existingByName = await prisma.mediaCategory.findFirst({
        where: {
          name: data.name,
          id: { not: categoryId }
        }
      });

      if (existingByName) {
        return { success: false, error: '同じ名前のカテゴリが既に存在します' };
      }
    }

    // slugの重複チェック（自分以外）
    if (data.slug !== undefined) {
      const existingBySlug = await prisma.mediaCategory.findFirst({
        where: {
          slug: data.slug,
          id: { not: categoryId }
        }
      });

      if (existingBySlug) {
        return { success: false, error: '同じslugのカテゴリが既に存在します' };
      }
    }

    // 更新データの準備
    const updateData: any = {
      updatedAt: new Date()
    };

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }

    if (data.color !== undefined) {
      updateData.color = data.color;
    }

    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }

    // 更新実行
    await prisma.mediaCategory.update({
      where: { id: categoryId },
      data: updateData
    });

    revalidatePath('/admin/media');

    return { success: true };

  } catch (error) {
    console.error('Update category error:', error);
    return { success: false, error: 'カテゴリの更新に失敗しました' };
  }
}

/**
 * メディアカテゴリを削除
 */
export async function deleteMediaCategoryAction(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: '認証が必要です' };
    }

    // 管理者権限チェック
    if (session.user.role !== 'admin') {
      return { success: false, error: '管理者権限が必要です' };
    }

    // カテゴリ取得
    const category = await prisma.mediaCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            media: true
          }
        }
      }
    });

    if (!category) {
      return { success: false, error: 'カテゴリが見つかりません' };
    }

    // システムカテゴリの削除を禁止
    if (category.isSystem) {
      return { success: false, error: 'システムカテゴリは削除できません' };
    }

    // メディアファイルが存在する場合は削除を禁止
    if (category._count.media > 0) {
      return { success: false, error: 'メディアファイルが存在するカテゴリは削除できません' };
    }

    // 削除実行
    await prisma.mediaCategory.delete({
      where: { id: categoryId }
    });

    revalidatePath('/admin/media');

    return { success: true };

  } catch (error) {
    console.error('Delete category error:', error);
    return { success: false, error: 'カテゴリの削除に失敗しました' };
  }
}

/**
 * カテゴリの表示順序を更新
 */
export async function updateCategorySortOrderAction(
  categoryOrders: { id: string; sortOrder: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: '認証が必要です' };
    }

    // 管理者権限チェック
    if (session.user.role !== 'admin') {
      return { success: false, error: '管理者権限が必要です' };
    }

    // トランザクションで一括更新
    await prisma.$transaction(
      categoryOrders.map(({ id, sortOrder }) =>
        prisma.mediaCategory.update({
          where: { id },
          data: { sortOrder }
        })
      )
    );

    revalidatePath('/admin/media');

    return { success: true };

  } catch (error) {
    console.error('Update sort order error:', error);
    return { success: false, error: '表示順序の更新に失敗しました' };
  }
}

/**
 * カテゴリ一覧を取得
 */
export async function getMediaCategoriesAction() {
  try {
    const categories = await prisma.mediaCategory.findMany({
      orderBy: {
        sortOrder: 'asc'
      },
      include: {
        _count: {
          select: {
            media: true
          }
        }
      }
    });

    return categories;

  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
}

/**
 * システムカテゴリを初期化（開発用）
 */
export async function initializeSystemCategoriesAction(): Promise<{ success: boolean; error?: string }> {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: '認証が必要です' };
    }

    // 管理者権限チェック
    if (session.user.role !== 'admin') {
      return { success: false, error: '管理者権限が必要です' };
    }

    const defaultCategories = [
      {
        name: "記事用画像",
        slug: "article-images",
        description: "ブログ記事やニュースで使用する画像",
        color: "#10b981",
        isSystem: true,
        sortOrder: 1
      },
      {
        name: "背景画像",
        slug: "backgrounds", 
        description: "ユーザーが選択できる背景画像",
        color: "#8b5cf6",
        isSystem: true,
        sortOrder: 2
      },
      {
        name: "バナー画像",
        slug: "banners",
        description: "プロモーションやヘッダーで使用するバナー",
        color: "#f59e0b", 
        isSystem: true,
        sortOrder: 3
      },
      {
        name: "アイコン・ロゴ",
        slug: "icons",
        description: "SVGアイコンやロゴファイル",
        color: "#ef4444",
        isSystem: true,
        sortOrder: 4
      },
      {
        name: "デバイス画像", 
        slug: "device-images",
        description: "製品・デバイス関連の画像",
        color: "#3b82f6",
        isSystem: true,
        sortOrder: 5
      },
      {
        name: "ユーザー投稿",
        slug: "user-content",
        description: "ユーザーがアップロードした画像（管理用）",
        color: "#6b7280",
        isSystem: true,
        sortOrder: 6
      }
    ];

    // 既存のシステムカテゴリをチェック
    const existingCategories = await prisma.mediaCategory.findMany({
      where: {
        slug: {
          in: defaultCategories.map(cat => cat.slug)
        }
      }
    });

    const existingSlugs = new Set(existingCategories.map(cat => cat.slug));

    // 未作成のカテゴリのみ作成
    const categoriesToCreate = defaultCategories.filter(
      cat => !existingSlugs.has(cat.slug)
    );

    if (categoriesToCreate.length > 0) {
      await prisma.mediaCategory.createMany({
        data: categoriesToCreate
      });
    }

    revalidatePath('/admin/media');

    return { success: true };

  } catch (error) {
    console.error('Initialize system categories error:', error);
    return { success: false, error: 'システムカテゴリの初期化に失敗しました' };
  }
}