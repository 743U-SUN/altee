'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { uploadFile, deleteFile } from '@/lib/minio';
import { 
  validateImageFile,
  processImageWithPreset,
  generateImageFileName,
  IMAGE_PRESETS
} from '@/lib/image-processing';
import { sanitizeSvgFile, createSvgBuffer } from '@/lib/svg-sanitizer';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ファイルサイズ制限
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

// 許可されるMIMEタイプ
const ALLOWED_MIME_TYPES = [
  // 画像
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // 動画（将来対応）
  'video/mp4',
  'video/webm',
  'video/mov'
];

export interface MediaUploadResult {
  success: boolean;
  media?: {
    id: string;
    url: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    width?: number;
    height?: number;
  };
  error?: string;
}

export interface MediaFilters {
  categoryId?: string;
  search?: string;
  mimeType?: string;
  limit?: number;
  offset?: number;
}

/**
 * メディアファイルをアップロード
 */
export async function uploadMediaAction(formData: FormData): Promise<MediaUploadResult> {
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

    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;
    const altText = formData.get('altText') as string || '';
    const description = formData.get('description') as string || '';
    const tags = formData.get('tags') as string || '';

    // ファイル基本検証
    if (!file || file.size === 0) {
      return { success: false, error: 'ファイルが選択されていません' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: 'サポートされていないファイル形式です' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'ファイルサイズが制限を超えています（50MB以下）' };
    }

    // カテゴリ存在確認
    const category = await prisma.mediaCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return { success: false, error: '指定されたカテゴリが見つかりません' };
    }

    let processedBuffer: Buffer;
    let finalMimeType = file.type;
    let width: number | undefined;
    let height: number | undefined;
    let isSanitized: boolean | undefined;

    // ファイル種別ごとの処理
    if (file.type === 'image/svg+xml') {
      // SVG処理（変換なし、サニタイズのみ）
      console.log('SVGファイル処理開始:', file.name);
      try {
        const sanitizeResult = await sanitizeSvgFile(file);
        processedBuffer = createSvgBuffer(sanitizeResult.sanitizedSvg);
        isSanitized = true;
        finalMimeType = 'image/svg+xml'; // MIMEタイプを保持
        console.log('SVGサニタイズ完了:', {
          hasRemovedDangerousContent: sanitizeResult.hasRemovedDangerousContent,
          bufferSize: processedBuffer.length
        });
      } catch (error) {
        console.error('SVG sanitization error:', error);
        return { success: false, error: 'SVGファイルの処理に失敗しました' };
      }
    } else if (file.type.startsWith('image/')) {
      // 通常の画像処理（WebP変換）
      if (file.size > MAX_IMAGE_SIZE) {
        return { success: false, error: '画像ファイルは10MB以下にしてください' };
      }

      const validationError = validateImageFile(file, MAX_IMAGE_SIZE);
      if (validationError) {
        return { success: false, error: validationError };
      }

      try {
        const bytes = await file.arrayBuffer();
        const inputBuffer = Buffer.from(bytes);
        
        // 用途に応じたプリセット選択（カテゴリベース）
        let preset: keyof typeof IMAGE_PRESETS = 'default';
        if (category.slug === 'icons') {
          preset = 'icon';
        } else if (category.slug === 'banners') {
          preset = 'banner';
        }

        const processedResult = await processImageWithPreset(inputBuffer, preset);
        processedBuffer = processedResult.buffer;
        width = processedResult.width;
        height = processedResult.height;
        finalMimeType = `image/${processedResult.outputFormat}`;
      } catch (error) {
        console.error('Image processing error:', error);
        return { success: false, error: '画像の処理に失敗しました' };
      }
    } else if (file.type.startsWith('video/')) {
      // 動画はそのまま保存（将来的にサムネイル生成等を追加予定）
      const bytes = await file.arrayBuffer();
      processedBuffer = Buffer.from(bytes);
    } else {
      return { success: false, error: 'サポートされていないファイル形式です' };
    }

    // ファイル名生成（MIMEタイプから適切な拡張子を自動決定）
    const fileName = generateImageFileName(
      session.user.id,
      `media-${category.slug}`,
      finalMimeType
    );
    
    console.log('ファイル名生成完了:', {
      originalName: file.name,
      fileName,
      finalMimeType,
      bufferSize: processedBuffer.length
    });

    // MinIOアップロード
    let fileUrl: string;
    try {
      fileUrl = await uploadFile(
        fileName,
        processedBuffer,
        finalMimeType, // contentTypeとしてMIMEタイプを渡す
        `media/${category.slug}`
      );
    } catch (error) {
      console.error('MinIO upload error:', error);
      return { success: false, error: 'ファイルのアップロードに失敗しました' };
    }

    // データベース保存
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    const media = await prisma.media.create({
      data: {
        originalName: file.name,
        fileName,
        url: fileUrl,
        mimeType: finalMimeType,
        fileSize: processedBuffer.length,
        width: width || null,
        height: height || null,
        categoryId,
        uploadedBy: session.user.id,
        tags: tagsArray,
        altText: altText || null,
        description: description || null,
        isSanitized
      }
    });

    revalidatePath('/admin/media');

    return {
      success: true,
      media: {
        id: media.id,
        url: media.url,
        fileName: media.fileName,
        mimeType: media.mimeType,
        fileSize: media.fileSize,
        width: media.width || undefined,
        height: media.height || undefined
      }
    };

  } catch (error) {
    console.error('Media upload error:', error);
    return { success: false, error: 'アップロードに失敗しました' };
  }
}

/**
 * メディアファイルを削除
 */
export async function deleteMediaAction(mediaId: string): Promise<{ success: boolean; error?: string }> {
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

    // メディア取得
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { category: true }
    });

    if (!media) {
      return { success: false, error: 'メディアが見つかりません' };
    }

    // MinIOから削除
    try {
      const pathParts = media.url.split('/');
      const fileName = pathParts[pathParts.length - 1];
      await deleteFile(`media/${media.category.slug}/${fileName}`);
    } catch (error) {
      console.warn('MinIO delete warning:', error);
      // ファイル削除失敗してもDB削除は継続
    }

    // データベースから削除
    await prisma.media.delete({
      where: { id: mediaId }
    });

    revalidatePath('/admin/media');

    return { success: true };

  } catch (error) {
    console.error('Media delete error:', error);
    return { success: false, error: '削除に失敗しました' };
  }
}

/**
 * メディア情報を更新
 */
export async function updateMediaAction(
  mediaId: string,
  data: {
    altText?: string;
    description?: string;
    tags?: string[];
    categoryId?: string;
  }
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

    // メディア存在確認
    const existingMedia = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!existingMedia) {
      return { success: false, error: 'メディアが見つかりません' };
    }

    // カテゴリ変更の場合は存在確認
    if (data.categoryId && data.categoryId !== existingMedia.categoryId) {
      const category = await prisma.mediaCategory.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        return { success: false, error: '指定されたカテゴリが見つかりません' };
      }
    }

    // 更新
    await prisma.media.update({
      where: { id: mediaId },
      data: {
        altText: data.altText,
        description: data.description,
        tags: data.tags,
        categoryId: data.categoryId,
        updatedAt: new Date()
      }
    });

    revalidatePath('/admin/media');

    return { success: true };

  } catch (error) {
    console.error('Media update error:', error);
    return { success: false, error: '更新に失敗しました' };
  }
}

/**
 * メディア一覧を取得
 */
export async function getMediaListAction(filters: MediaFilters = {}) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('認証が必要です');
    }

    // 管理者権限チェック
    if (session.user.role !== 'admin') {
      throw new Error('管理者権限が必要です');
    }

    const { categoryId, search, mimeType, limit = 20, offset = 0 } = filters;

    // WHERE条件構築
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    // データ取得
    const [media, totalCount] = await Promise.all([
      prisma.media.findMany({
        where,
        include: {
          category: true,
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.media.count({ where })
    ]);

    return {
      media,
      totalCount,
      hasMore: offset + limit < totalCount
    };

  } catch (error) {
    console.error('Get media list error:', error);
    throw error;
  }
}

