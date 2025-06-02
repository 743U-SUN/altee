/**
 * 管理者用の属性管理（色・メーカー・シリーズ）サーバーアクション
 */
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// バリデーションスキーマ
const createColorSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().min(1).regex(/^[a-zA-Z\s]+$/),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  isActive: z.boolean().default(true),
});

const updateColorSchema = z.object({
  name: z.string().min(1).optional(),
  nameEn: z.string().min(1).regex(/^[a-zA-Z\s]+$/).optional(),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  isActive: z.boolean().optional(),
});

const createManufacturerSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

const updateManufacturerSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

const createSeriesSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  manufacturerId: z.number().min(1),
  isActive: z.boolean().default(true),
});

const updateSeriesSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().nullable().optional(),
  manufacturerId: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

const reorderColorsSchema = z.object({
  colors: z.array(z.object({
    id: z.number(),
    sortOrder: z.number(),
  })),
});

// 管理者権限チェック
async function checkAdminPermission() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: '管理者権限が必要です' };
  }
  return { success: true };
}

// ========== カラー管理 ==========

/**
 * カラー一覧を取得
 */
export async function getColors() {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const colors = await prisma.color.findMany({
      include: {
        _count: {
          select: {
            productColors: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return { success: true, data: colors };
  } catch (error) {
    console.error('getColors error:', error);
    return { success: false, error: 'カラーの取得に失敗しました' };
  }
}

/**
 * 特定のカラーを取得
 */
export async function getColorById(id: number) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const color = await prisma.color.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productColors: true,
          },
        },
      },
    });

    if (!color) {
      return { success: false, error: 'カラーが見つかりません' };
    }

    return { success: true, data: color };
  } catch (error) {
    console.error('getColorById error:', error);
    return { success: false, error: 'カラーの取得に失敗しました' };
  }
}

/**
 * カラーを作成
 */
export async function createColor(data: {
  name: string;
  nameEn: string;
  hexCode?: string | null;
  isActive?: boolean;
}) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const validated = createColorSchema.parse(data);

    // 重複チェック
    const existing = await prisma.color.findFirst({
      where: {
        OR: [
          { name: validated.name },
          { nameEn: validated.nameEn },
        ],
      },
    });

    if (existing) {
      return { success: false, error: '同じ名前のカラーが既に存在します' };
    }

    // 最大のsortOrderを取得
    const maxSortOrder = await prisma.color.aggregate({
      _max: {
        sortOrder: true,
      },
    });

    const color = await prisma.color.create({
      data: {
        name: validated.name,
        nameEn: validated.nameEn,
        hexCode: validated.hexCode || null,
        isActive: validated.isActive,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
    });

    revalidatePath('/admin/attributes/colors');

    return { success: true, data: color, message: 'カラーを作成しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('createColor error:', error);
    return { success: false, error: 'カラーの作成に失敗しました' };
  }
}

/**
 * カラーを更新
 */
export async function updateColor(id: number, data: {
  name?: string;
  nameEn?: string;
  hexCode?: string | null;
  isActive?: boolean;
}) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const validated = updateColorSchema.parse(data);

    // 重複チェック（自分自身を除く）
    if (validated.name || validated.nameEn) {
      const existing = await prisma.color.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                validated.name ? { name: validated.name } : {},
                validated.nameEn ? { nameEn: validated.nameEn } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        return { success: false, error: '同じ名前のカラーが既に存在します' };
      }
    }

    const color = await prisma.color.update({
      where: { id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.nameEn !== undefined && { nameEn: validated.nameEn }),
        ...(validated.hexCode !== undefined && { hexCode: validated.hexCode }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    revalidatePath('/admin/attributes/colors');

    return { success: true, data: color, message: 'カラーを更新しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('updateColor error:', error);
    return { success: false, error: 'カラーの更新に失敗しました' };
  }
}

/**
 * カラーを削除
 */
export async function deleteColor(id: number) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    // 関連する商品があるかチェック
    const productColorsCount = await prisma.productColor.count({
      where: { colorId: id },
    });

    if (productColorsCount > 0) {
      return { 
        success: false, 
        error: `このカラーは ${productColorsCount} 件の商品に使用されています。先に商品との関連を解除してください。` 
      };
    }

    await prisma.color.delete({
      where: { id },
    });

    revalidatePath('/admin/attributes/colors');

    return { success: true, message: 'カラーを削除しました' };
  } catch (error) {
    console.error('deleteColor error:', error);
    return { success: false, error: 'カラーの削除に失敗しました' };
  }
}

/**
 * カラーの並び順を更新
 */
export async function reorderColors(colors: { id: number; sortOrder: number }[]) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const validated = reorderColorsSchema.parse({ colors });

    // トランザクションで一括更新
    await prisma.$transaction(
      validated.colors.map((color) =>
        prisma.color.update({
          where: { id: color.id },
          data: { sortOrder: color.sortOrder },
        })
      )
    );

    revalidatePath('/admin/attributes/colors');

    return { success: true, message: '並び順を更新しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('reorderColors error:', error);
    return { success: false, error: '並び順の更新に失敗しました' };
  }
}

// ========== メーカー管理 ==========

/**
 * メーカー一覧を取得
 */
export async function getManufacturers() {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const manufacturers = await prisma.manufacturer.findMany({
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

    return { success: true, data: manufacturers };
  } catch (error) {
    console.error('getManufacturers error:', error);
    return { success: false, error: 'メーカーの取得に失敗しました' };
  }
}

/**
 * 特定のメーカーを取得
 */
export async function getManufacturerById(id: number) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            series: true,
          },
        },
      },
    });

    if (!manufacturer) {
      return { success: false, error: 'メーカーが見つかりません' };
    }

    return { success: true, data: manufacturer };
  } catch (error) {
    console.error('getManufacturerById error:', error);
    return { success: false, error: 'メーカーの取得に失敗しました' };
  }
}

/**
 * メーカーを作成
 */
export async function createManufacturer(data: {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const validated = createManufacturerSchema.parse(data);

    // 重複チェック
    const existing = await prisma.manufacturer.findFirst({
      where: {
        OR: [
          { name: validated.name },
          { slug: validated.slug },
        ],
      },
    });

    if (existing) {
      return { success: false, error: '同じ名前またはスラッグのメーカーが既に存在します' };
    }

    const manufacturer = await prisma.manufacturer.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description || null,
        logoUrl: validated.logoUrl || null,
        website: validated.website && validated.website !== '' ? validated.website : null,
        isActive: validated.isActive,
      },
    });

    revalidatePath('/admin/attributes/manufacturers');

    return { success: true, data: manufacturer, message: 'メーカーを作成しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('createManufacturer error:', error);
    return { success: false, error: 'メーカーの作成に失敗しました' };
  }
}

/**
 * メーカーを更新
 */
export async function updateManufacturer(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const validated = updateManufacturerSchema.parse(data);

    // 重複チェック（自分自身を除く）
    if (validated.name || validated.slug) {
      const existing = await prisma.manufacturer.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                validated.name ? { name: validated.name } : {},
                validated.slug ? { slug: validated.slug } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        return { success: false, error: '同じ名前またはスラッグのメーカーが既に存在します' };
      }
    }

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.slug !== undefined && { slug: validated.slug }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.logoUrl !== undefined && { logoUrl: validated.logoUrl }),
        ...(validated.website !== undefined && { website: validated.website && validated.website !== '' ? validated.website : null }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    revalidatePath('/admin/attributes/manufacturers');

    return { success: true, data: manufacturer, message: 'メーカーを更新しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('updateManufacturer error:', error);
    return { success: false, error: 'メーカーの更新に失敗しました' };
  }
}

/**
 * メーカーを削除
 */
export async function deleteManufacturer(id: number) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    // 関連する商品があるかチェック
    const productsCount = await prisma.product.count({
      where: { manufacturerId: id },
    });

    if (productsCount > 0) {
      return { 
        success: false, 
        error: `このメーカーには ${productsCount} 件の商品が関連付けられています。先に商品を削除または更新してください。` 
      };
    }

    // 関連するシリーズがあるかチェック
    const seriesCount = await prisma.series.count({
      where: { manufacturerId: id },
    });

    if (seriesCount > 0) {
      return { 
        success: false, 
        error: `このメーカーには ${seriesCount} 件のシリーズが関連付けられています。先にシリーズを削除または更新してください。` 
      };
    }

    await prisma.manufacturer.delete({
      where: { id },
    });

    revalidatePath('/admin/attributes/manufacturers');

    return { success: true, message: 'メーカーを削除しました' };
  } catch (error) {
    console.error('deleteManufacturer error:', error);
    return { success: false, error: 'メーカーの削除に失敗しました' };
  }
}

// ========== シリーズ管理 ==========

/**
 * シリーズ一覧を取得
 */
export async function getSeries() {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const series = await prisma.series.findMany({
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

    return { success: true, data: series };
  } catch (error) {
    console.error('getSeries error:', error);
    return { success: false, error: 'シリーズの取得に失敗しました' };
  }
}

/**
 * 特定のシリーズを取得
 */
export async function getSeriesById(id: number) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const series = await prisma.series.findUnique({
      where: { id },
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
    });

    if (!series) {
      return { success: false, error: 'シリーズが見つかりません' };
    }

    return { success: true, data: series };
  } catch (error) {
    console.error('getSeriesById error:', error);
    return { success: false, error: 'シリーズの取得に失敗しました' };
  }
}

/**
 * シリーズを作成
 */
export async function createSeries(data: {
  name: string;
  slug: string;
  description?: string | null;
  manufacturerId: number;
  isActive?: boolean;
}) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const validated = createSeriesSchema.parse(data);

    // メーカーの存在確認
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: validated.manufacturerId },
    });

    if (!manufacturer) {
      return { success: false, error: '指定されたメーカーが見つかりません' };
    }

    // 重複チェック（同じメーカー内でのシリーズ名とスラッグの重複を防ぐ）
    const existing = await prisma.series.findFirst({
      where: {
        manufacturerId: validated.manufacturerId,
        OR: [
          { name: validated.name },
          { slug: validated.slug },
        ],
      },
    });

    if (existing) {
      return { success: false, error: 'このメーカーで同じ名前またはスラッグのシリーズが既に存在します' };
    }

    const series = await prisma.series.create({
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

    revalidatePath('/admin/attributes/series');

    return { success: true, data: series, message: 'シリーズを作成しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('createSeries error:', error);
    return { success: false, error: 'シリーズの作成に失敗しました' };
  }
}

/**
 * シリーズを更新
 */
export async function updateSeries(id: number, data: {
  name?: string;
  slug?: string;
  description?: string | null;
  manufacturerId?: number;
  isActive?: boolean;
}) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    const validated = updateSeriesSchema.parse(data);

    // メーカーの存在確認（manufacturerIdが変更される場合）
    if (validated.manufacturerId) {
      const manufacturer = await prisma.manufacturer.findUnique({
        where: { id: validated.manufacturerId },
      });

      if (!manufacturer) {
        return { success: false, error: '指定されたメーカーが見つかりません' };
      }
    }

    // 重複チェック（自分自身を除く）
    if (validated.name || validated.slug || validated.manufacturerId) {
      const currentSeries = await prisma.series.findUnique({
        where: { id },
      });

      if (!currentSeries) {
        return { success: false, error: 'シリーズが見つかりません' };
      }

      const manufacturerId = validated.manufacturerId || currentSeries.manufacturerId;
      
      const existing = await prisma.series.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { manufacturerId },
            {
              OR: [
                validated.name ? { name: validated.name } : {},
                validated.slug ? { slug: validated.slug } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        return { success: false, error: 'このメーカーで同じ名前またはスラッグのシリーズが既に存在します' };
      }
    }

    const series = await prisma.series.update({
      where: { id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.slug !== undefined && { slug: validated.slug }),
        ...(validated.description !== undefined && { description: validated.description }),
        ...(validated.manufacturerId !== undefined && { manufacturerId: validated.manufacturerId }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
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

    revalidatePath('/admin/attributes/series');

    return { success: true, data: series, message: 'シリーズを更新しました' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('updateSeries error:', error);
    return { success: false, error: 'シリーズの更新に失敗しました' };
  }
}

/**
 * シリーズを削除
 */
export async function deleteSeries(id: number) {
  try {
    const permissionCheck = await checkAdminPermission();
    if (!permissionCheck.success) {
      return permissionCheck;
    }

    // 関連する商品があるかチェック
    const productsCount = await prisma.product.count({
      where: { seriesId: id },
    });

    if (productsCount > 0) {
      return { 
        success: false, 
        error: `このシリーズには ${productsCount} 件の商品が関連付けられています。先に商品を削除または更新してください。` 
      };
    }

    await prisma.series.delete({
      where: { id },
    });

    revalidatePath('/admin/attributes/series');

    return { success: true, message: 'シリーズを削除しました' };
  } catch (error) {
    console.error('deleteSeries error:', error);
    return { success: false, error: 'シリーズの削除に失敗しました' };
  }
}