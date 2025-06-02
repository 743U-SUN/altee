'server-only'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UserImageBanner, UserImageCarousel } from '@/app/(handle)/[handle]/types/handle-types'

/**
 * ユーザーのバナー画像を取得
 */
export async function getUserBanners(handle: string): Promise<UserImageBanner[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { handle },
      select: {
        imageBanners: {
          select: {
            id: true,
            url: true,
            imgUrl: true,
            alt: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    return user?.imageBanners || [];
  } catch (error) {
    console.error('Error fetching user banners:', error);
    return [];
  }
}

/**
 * ユーザーのカルーセル画像を取得
 */
export async function getUserCarousel(handle: string): Promise<UserImageCarousel[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { handle },
      select: {
        imageCarousels: {
          select: {
            id: true,
            url: true,
            imgUrl: true,
            alt: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    return user?.imageCarousels || [];
  } catch (error) {
    console.error('Error fetching user carousel:', error);
    return [];
  }
}

/**
 * YouTube動画の自動更新
 */
export async function autoUpdateYouTubeVideos(handle: string): Promise<{ success: boolean; videoCount: number; error?: string }> {
  try {
    // YouTube自動更新APIを呼び出し（既存のAPIエンドポイントを活用）
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/youtube/auto-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ handle }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // 成功時はページを再検証
    if (result.success) {
      revalidatePath(`/${handle}`);
    }

    return {
      success: result.success,
      videoCount: result.videoCount || 0,
    };
  } catch (error) {
    console.error('Error updating YouTube videos:', error);
    return {
      success: false,
      videoCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}