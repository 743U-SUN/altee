import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    // おすすめ動画を取得
    const videos = await prisma.userRecommendYoutube.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('おすすめ動画の取得に失敗:', error);
    return NextResponse.json(
      { error: 'おすすめ動画の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, url, sortOrder } = body;

    if (!userId || !url) {
      return NextResponse.json(
        { error: 'ユーザーIDとURLが必要です' },
        { status: 400 }
      );
    }

    // URLの検証
    const videoInfo = await getVideoInfo(url);
    if (!videoInfo) {
      return NextResponse.json(
        { error: '有効なYouTube URLを入力してください' },
        { status: 400 }
      );
    }

    // 既存の動画数をチェック
    const existingCount = await prisma.userRecommendYoutube.count({
      where: { userId },
    });

    if (existingCount >= 5) {
      return NextResponse.json(
        { error: 'おすすめ動画は最大5つまでです' },
        { status: 400 }
      );
    }

    // 同じURLが既に登録されていないかチェック
    const existingVideo = await prisma.userRecommendYoutube.findFirst({
      where: {
        userId,
        url: videoInfo.url,
      },
    });

    if (existingVideo) {
      return NextResponse.json(
        { error: 'この動画は既に登録されています' },
        { status: 400 }
      );
    }

    // おすすめ動画を作成
    const video = await prisma.userRecommendYoutube.create({
      data: {
        userId,
        url: videoInfo.url,
        thumbnailUrl: videoInfo.thumbnailUrl,
        title: videoInfo.title,
        description: videoInfo.description,
        sortOrder: sortOrder ?? existingCount,
      },
    });

    return NextResponse.json({ video });
  } catch (error) {
    console.error('おすすめ動画の追加に失敗:', error);
    return NextResponse.json(
      { error: 'おすすめ動画の追加に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, videoId } = body;

    if (!userId || !videoId) {
      return NextResponse.json(
        { error: 'ユーザーIDと動画IDが必要です' },
        { status: 400 }
      );
    }

    // 動画を削除
    const deletedVideo = await prisma.userRecommendYoutube.delete({
      where: {
        id: videoId,
        userId, // セキュリティのためユーザーIDも確認
      },
    });

    // 残りの動画の並び順を調整
    await prisma.userRecommendYoutube.updateMany({
      where: {
        userId,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('おすすめ動画の削除に失敗:', error);
    return NextResponse.json(
      { error: 'おすすめ動画の削除に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, videos } = body;

    if (!userId || !Array.isArray(videos)) {
      return NextResponse.json(
        { error: 'ユーザーIDと動画配列が必要です' },
        { status: 400 }
      );
    }

    // 並び順を更新
    await Promise.all(
      videos.map((video) =>
        prisma.userRecommendYoutube.update({
          where: {
            id: video.id,
            userId, // セキュリティのためユーザーIDも確認
          },
          data: {
            sortOrder: video.sortOrder,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('並び順の更新に失敗:', error);
    return NextResponse.json(
      { error: '並び順の更新に失敗しました' },
      { status: 500 }
    );
  }
}
