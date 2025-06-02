/**
 * YouTube設定・おすすめ動画管理関連のサーバーアクション
 */
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// バリデーションスキーマ
const youtubeSettingsSchema = z.object({
  displayCount: z.number().int().min(1, "表示数は1以上で指定してください").max(15, "表示数は15以下で指定してください"),
});

const addRecommendVideoSchema = z.object({
  url: z.string().url("有効なURLを入力してください"),
  sortOrder: z.number().int().min(0).optional(),
});

const deleteRecommendVideoSchema = z.object({
  videoId: z.string().uuid("有効な動画IDを指定してください"),
});

const reorderRecommendVideosSchema = z.object({
  videos: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })),
});

// YouTube URLからビデオIDを抽出
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// YouTube動画の基本情報を取得（YouTube oEmbed APIを使用）
async function getVideoInfo(url: string) {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  try {
    // YouTube oEmbed APIを使用して動画情報を取得
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oEmbedUrl);
    
    if (!response.ok) {
      throw new Error('動画情報の取得に失敗しました');
    }
    
    const data = await response.json();
    
    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      title: data.title || `YouTube動画 (${videoId})`,
      description: `${data.author_name || 'YouTube'}の動画`,
    };
  } catch (error) {
    console.error('YouTube oEmbed API エラー:', error);
    // フォールバック: 基本情報のみ返す
    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      title: `YouTube動画 (${videoId})`,
      description: '',
    };
  }
}

// ========== YouTube設定 ==========

/**
 * ユーザーのYouTube設定を取得
 */
export async function getUserYoutubeSettings() {
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

    // YouTube設定を取得
    const settings = await prisma.userYoutubeSettings.findUnique({
      where: { userId: user.id },
      include: {
        videos: {
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    return {
      success: true,
      data: {
        settings: settings || null,
        videos: settings?.videos || [],
      }
    };
  } catch (error) {
    console.error('getUserYoutubeSettings error:', error);
    return { success: false, error: 'YouTube設定の取得に失敗しました' };
  }
}

/**
 * YouTube設定を更新
 */
export async function updateYoutubeSettings(data: { displayCount: number }) {
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

    const validated = youtubeSettingsSchema.parse(data);

    // 設定を更新（なければ作成）
    const settings = await prisma.userYoutubeSettings.upsert({
      where: { userId: user.id },
      update: {
        displayCount: validated.displayCount,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        displayCount: validated.displayCount,
      },
    });

    revalidatePath('/user/youtube');
    revalidatePath(`/${user.id}`);

    return { 
      success: true, 
      data: settings,
      message: 'YouTube設定を更新しました'
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('updateYoutubeSettings error:', error);
    return { success: false, error: 'YouTube設定の更新に失敗しました' };
  }
}

// ========== おすすめ動画管理 ==========

/**
 * ユーザーのおすすめ動画一覧を取得
 */
export async function getRecommendVideos() {
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

    // おすすめ動画を取得
    const videos = await prisma.userRecommendYoutube.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: 'asc' },
    });

    return { success: true, data: videos };
  } catch (error) {
    console.error('getRecommendVideos error:', error);
    return { success: false, error: 'おすすめ動画の取得に失敗しました' };
  }
}

/**
 * おすすめ動画を追加
 */
export async function addRecommendVideo(data: { url: string; sortOrder?: number }) {
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

    const validated = addRecommendVideoSchema.parse(data);

    // URLの検証
    const videoInfo = await getVideoInfo(validated.url);
    if (!videoInfo) {
      return { success: false, error: '有効なYouTube URLを入力してください' };
    }

    // 既存の動画数をチェック
    const existingCount = await prisma.userRecommendYoutube.count({
      where: { userId: user.id },
    });

    if (existingCount >= 5) {
      return { success: false, error: 'おすすめ動画は最大5つまでです' };
    }

    // 同じURLが既に登録されていないかチェック
    const existingVideo = await prisma.userRecommendYoutube.findFirst({
      where: {
        userId: user.id,
        url: videoInfo.url,
      },
    });

    if (existingVideo) {
      return { success: false, error: 'この動画は既に登録されています' };
    }

    // おすすめ動画を作成
    const video = await prisma.userRecommendYoutube.create({
      data: {
        userId: user.id,
        url: videoInfo.url,
        thumbnailUrl: videoInfo.thumbnailUrl,
        title: videoInfo.title,
        description: videoInfo.description,
        sortOrder: validated.sortOrder ?? existingCount,
      },
    });

    revalidatePath('/user/youtube');
    revalidatePath(`/${user.id}`);

    return { 
      success: true, 
      data: video,
      message: 'おすすめ動画を追加しました'
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('addRecommendVideo error:', error);
    return { success: false, error: 'おすすめ動画の追加に失敗しました' };
  }
}

/**
 * おすすめ動画を削除
 */
export async function deleteRecommendVideo(videoId: string) {
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

    const validated = deleteRecommendVideoSchema.parse({ videoId });

    // 動画を削除
    const deletedVideo = await prisma.userRecommendYoutube.delete({
      where: {
        id: validated.videoId,
        userId: user.id, // セキュリティのためユーザーIDも確認
      },
    });

    // 残りの動画の並び順を調整
    await prisma.userRecommendYoutube.updateMany({
      where: {
        userId: user.id,
        sortOrder: {
          gt: deletedVideo.sortOrder,
        },
      },
      data: {
        sortOrder: {
          decrement: 1,
        },
      },
    });

    revalidatePath('/user/youtube');
    revalidatePath(`/${user.id}`);

    return { 
      success: true,
      message: 'おすすめ動画を削除しました'
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'バリデーションエラー',
        details: error.errors 
      };
    }
    console.error('deleteRecommendVideo error:', error);
    return { success: false, error: 'おすすめ動画の削除に失敗しました' };
  }
}

/**
 * おすすめ動画の並び順を更新
 */
export async function reorderRecommendVideos(videos: { id: string; sortOrder: number }[]) {
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

    const validated = reorderRecommendVideosSchema.parse({ videos });

    // 全ての動画が現在のユーザーのものかチェック
    const videoIds = validated.videos.map(v => v.id);
    const existingVideos = await prisma.userRecommendYoutube.findMany({
      where: {
        id: { in: videoIds },
        userId: user.id
      }
    });

    if (existingVideos.length !== videoIds.length) {
      return { success: false, error: '権限のない動画が含まれています' };
    }

    // 並び順を更新
    await Promise.all(
      validated.videos.map((video) =>
        prisma.userRecommendYoutube.update({
          where: {
            id: video.id,
            userId: user.id, // セキュリティのためユーザーIDも確認
          },
          data: {
            sortOrder: video.sortOrder,
          },
        })
      )
    );

    revalidatePath('/user/youtube');
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
    console.error('reorderRecommendVideos error:', error);
    return { success: false, error: '並び順の更新に失敗しました' };
  }
}