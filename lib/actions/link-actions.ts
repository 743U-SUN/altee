/**
 * リンク管理関連のサーバーアクション
 */
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UserLinkOperations } from '@/lib/links/linkService';
import { userLinkSchema, validateFormData, validateOriginalIconFile } from '@/lib/links/validation';
import { uploadFile } from '@/lib/minio';
import { z } from 'zod';
import type { LinkFilters, LinkFormData } from '@/types/link';

// バリデーションスキーマ
const reorderLinksSchema = z.object({
  links: z.array(z.object({
    id: z.string(),
    sortOrder: z.number().int().min(0)
  })).min(1, '並び替えるリンクを指定してください')
});

/**
 * ユーザーのリンク一覧を取得
 */
export async function getUserLinks(filters?: LinkFilters) {
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

    const links = await UserLinkOperations.getUserLinks(user.id, filters || {});

    return { success: true, data: links };
  } catch (error) {
    console.error('getUserLinks error:', error);
    return { success: false, error: 'リンクの取得に失敗しました' };
  }
}

/**
 * リンクを作成（ファイルアップロードなし版）
 */
export async function createUserLink(data: {
  serviceId: string;
  url: string;
  title?: string;
  description?: string;
  useOriginalIcon?: boolean;
  iconId?: string;
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
    const validation = validateFormData(userLinkSchema, data);
    
    if (!validation.success) {
      return { 
        success: false,
        error: 'バリデーションエラー',
        details: validation.errors 
      };
    }

    // リンク作成
    const linkData = {
      ...validation.data!,
      useOriginalIcon: validation.data!.useOriginalIcon ?? false,
      iconId: validation.data!.iconId || undefined,
    };
    
    const link = await UserLinkOperations.createUserLink(user.id, linkData);

    revalidatePath('/user/links');
    revalidatePath(`/${user.id}`); // ユーザーページのキャッシュも更新

    return { 
      success: true,
      data: link,
      message: 'リンクを作成しました'
    };
  } catch (error) {
    console.error('createUserLink error:', error);
    const errorMessage = error instanceof Error ? error.message : 'リンクの作成に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * リンクを作成（ファイルアップロード対応版）
 * FormData を使用してファイルアップロードを処理
 */
export async function createUserLinkWithFile(formData: FormData) {
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

    // FormDataからデータを抽出
    const linkData = {
      serviceId: formData.get('serviceId') as string,
      url: formData.get('url') as string,
      title: formData.get('title') as string || undefined,
      description: formData.get('description') as string || undefined,
      useOriginalIcon: formData.get('useOriginalIcon') === 'true',
      iconId: formData.get('iconId') as string || undefined,
    };

    let originalIconUrl: string | undefined;

    // ファイルの処理
    const file = formData.get('originalIconFile') as File;
    if (file && linkData.useOriginalIcon) {
      // ファイルバリデーション
      const fileValidation = validateOriginalIconFile(file);
      if (!fileValidation.isValid) {
        return { 
          success: false,
          error: fileValidation.error 
        };
      }

      // ファイル名生成（ユーザーID + タイムスタンプ）
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${user.id}-${timestamp}.${extension}`;
      
      // ファイルをBufferに変換
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      
      // MinIOにアップロード（ユーザー専用フォルダ）
      originalIconUrl = await uploadFile(
        fileName,
        fileBuffer,
        file.type,
        `user-icons/${user.id}`
      );
    }
    
    // バリデーション
    const validation = validateFormData(userLinkSchema, linkData);
    
    if (!validation.success) {
      return { 
        success: false,
        error: 'バリデーションエラー',
        details: validation.errors 
      };
    }

    // リンク作成
    const finalLinkData = {
      ...validation.data!,
      useOriginalIcon: validation.data!.useOriginalIcon ?? false,
      iconId: validation.data!.iconId || undefined,
      originalIconUrl: originalIconUrl || undefined
    };
    
    const link = await UserLinkOperations.createUserLink(user.id, finalLinkData);

    revalidatePath('/user/links');
    revalidatePath(`/${user.id}`);

    return { 
      success: true,
      data: link,
      message: 'リンクを作成しました'
    };
  } catch (error) {
    console.error('createUserLinkWithFile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'リンクの作成に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * リンクを更新
 */
export async function updateUserLink(linkId: string, data: {
  serviceId?: string;
  url?: string;
  title?: string;
  description?: string;
  useOriginalIcon?: boolean;
  iconId?: string;
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

    // serviceIdの更新は直接Prismaで処理（リレーション更新のため）
    // 空文字列のiconIdはnullに変換
    const updateData: any = {};
    
    if (data.url !== undefined) updateData.url = data.url;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.useOriginalIcon !== undefined) updateData.useOriginalIcon = data.useOriginalIcon;
    if (data.iconId !== undefined) updateData.iconId = data.iconId || null;
    
    // serviceIdが指定された場合はリレーション更新
    if (data.serviceId !== undefined) {
      updateData.service = {
        connect: { id: data.serviceId }
      };
    }
    
    const link = await prisma.userLink.update({
      where: {
        id: linkId,
        userId: user.id // セキュリティのため、自分のリンクのみ更新可能
      },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            baseUrl: true,
            allowOriginalIcon: true
          }
        },
        icon: {
          select: {
            id: true,
            name: true,
            filePath: true,
            style: true,
            colorScheme: true
          }
        }
      }
    });

    revalidatePath('/user/links');
    revalidatePath(`/${user.id}`);

    return { 
      success: true,
      data: link,
      message: 'リンクを更新しました'
    };
  } catch (error) {
    console.error('updateUserLink error:', error);
    const errorMessage = error instanceof Error ? error.message : 'リンクの更新に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * リンクを更新（ファイルアップロード対応版）
 * FormData を使用してファイルアップロードを処理
 */
export async function updateUserLinkWithFile(linkId: string, formData: FormData) {
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

    // FormDataからデータを抽出
    const linkData = {
      serviceId: formData.get('serviceId') as string,
      url: formData.get('url') as string,
      title: formData.get('title') as string || undefined,
      description: formData.get('description') as string || undefined,
      useOriginalIcon: formData.get('useOriginalIcon') === 'true',
      iconId: formData.get('iconId') as string || undefined,
    };

    let originalIconUrl: string | undefined;

    // ファイルの処理
    const file = formData.get('originalIconFile') as File;
    if (file && file.size > 0 && linkData.useOriginalIcon) {
      // ファイルバリデーション
      const fileValidation = validateOriginalIconFile(file);
      if (!fileValidation.isValid) {
        return { 
          success: false,
          error: fileValidation.error 
        };
      }

      // ファイル名生成（ユーザーID + タイムスタンプ）
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${user.id}-${timestamp}.${extension}`;
      
      // ファイルをBufferに変換
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      
      // MinIOにアップロード（ユーザー専用フォルダ）
      originalIconUrl = await uploadFile(
        fileName,
        fileBuffer,
        file.type,
        `user-icons/${user.id}`
      );
    }
    
    // バリデーション
    const validation = validateFormData(userLinkSchema, linkData);
    
    if (!validation.success) {
      return { 
        success: false,
        error: 'バリデーションエラー',
        details: validation.errors 
      };
    }

    // リンク更新のためのデータ準備
    const updateData: any = {};
    
    if (linkData.url !== undefined) updateData.url = linkData.url;
    if (linkData.title !== undefined) updateData.title = linkData.title;
    if (linkData.description !== undefined) updateData.description = linkData.description;
    if (linkData.useOriginalIcon !== undefined) updateData.useOriginalIcon = linkData.useOriginalIcon;
    if (linkData.iconId !== undefined) updateData.iconId = linkData.iconId || null;
    if (originalIconUrl !== undefined) updateData.originalIconUrl = originalIconUrl;
    
    // serviceIdが指定された場合はリレーション更新
    if (linkData.serviceId !== undefined) {
      updateData.service = {
        connect: { id: linkData.serviceId }
      };
    }
    
    const link = await prisma.userLink.update({
      where: {
        id: linkId,
        userId: user.id // セキュリティのため、自分のリンクのみ更新可能
      },
      data: updateData,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            baseUrl: true,
            allowOriginalIcon: true
          }
        },
        icon: {
          select: {
            id: true,
            name: true,
            filePath: true,
            style: true,
            colorScheme: true
          }
        }
      }
    });

    revalidatePath('/user/links');
    revalidatePath(`/${user.id}`);

    return { 
      success: true,
      data: link,
      message: 'リンクを更新しました'
    };
  } catch (error) {
    console.error('updateUserLinkWithFile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'リンクの更新に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * リンクを削除
 */
export async function deleteUserLink(linkId: string) {
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
    
    await UserLinkOperations.deleteUserLink(linkId, user.id);

    revalidatePath('/user/links');
    revalidatePath(`/${user.id}`);

    return { 
      success: true,
      message: 'リンクを削除しました'
    };
  } catch (error) {
    console.error('deleteUserLink error:', error);
    const errorMessage = error instanceof Error ? error.message : 'リンクの削除に失敗しました';
    return { success: false, error: errorMessage };
  }
}

/**
 * リンクの並び順を更新
 */
export async function reorderUserLinks(links: { id: string; sortOrder: number }[]) {
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
    const validation = reorderLinksSchema.safeParse({ links });
    
    if (!validation.success) {
      return { 
        success: false,
        error: 'バリデーションエラー',
        details: validation.error.issues
      };
    }

    const { links: validatedLinks } = validation.data;

    // sortOrder順でソートしてからIDのみ抽出
    const linkIds = validatedLinks
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(link => link.id);

    // 並び替え実行
    await UserLinkOperations.reorderUserLinks(user.id, linkIds);

    revalidatePath('/user/links');
    revalidatePath(`/${user.id}`);

    return { 
      success: true,
      message: 'リンクの並び順を更新しました'
    };
  } catch (error) {
    console.error('reorderUserLinks error:', error);
    const errorMessage = error instanceof Error ? error.message : 'リンクの並び替えに失敗しました';
    return { success: false, error: errorMessage };
  }
}