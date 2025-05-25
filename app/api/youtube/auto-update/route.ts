import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { XMLParser } from 'fast-xml-parser';

interface YouTubeRSSEntry {
  'yt:videoId': string;
  title: string;
  link: {
    '@_rel': string;
    '@_href': string;
  };
  published: string;
  'media:group': {
    'media:title': string;
    'media:description': string;
    'media:thumbnail': {
      '@_url': string;
    };
  };
}

interface YouTubeRSSFeed {
  feed: {
    entry: YouTubeRSSEntry[] | YouTubeRSSEntry;
  };
}

// YouTube RSS XMLをパースして動画情報を抽出
function parseYouTubeRSS(xmlData: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const result: YouTubeRSSFeed = parser.parse(xmlData);
  
  if (!result.feed?.entry) {
    return [];
  }

  // entryが単一の場合は配列に変換
  const entries = Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry];

  return entries.map((entry) => ({
    videoId: entry['yt:videoId'],
    title: entry['media:group']?.['media:title'] || entry.title || '',
    description: entry['media:group']?.['media:description'] || '',
    url: entry.link?.['@_href'] || `https://www.youtube.com/watch?v=${entry['yt:videoId']}`,
    thumbnailUrl: entry['media:group']?.['media:thumbnail']?.['@_url'] || '',
    publishedAt: new Date(entry.published),
  }));
}

// 12時間前の時刻を取得
function getTwelveHoursAgo(): Date {
  const now = new Date();
  return new Date(now.getTime() - 12 * 60 * 60 * 1000);
}

// 最後の取得から12時間経過しているかチェック
function shouldUpdateVideos(lastFetchedAt?: Date | null): boolean {
  if (!lastFetchedAt) return true;
  return lastFetchedAt < getTwelveHoursAgo();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, handle } = body;

    // userIdまたはhandleのいずれかは必須
    if (!userId && !handle) {
      return NextResponse.json(
        { error: 'ユーザーIDまたはハンドルが必要です' },
        { status: 400 }
      );
    }

    // ユーザーを取得（handleの場合はuserIdに変換）
    let targetUserId = userId;
    if (!targetUserId && handle) {
      const user = await prisma.user.findUnique({
        where: { handle },
        select: { id: true },
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        );
      }
      
      targetUserId = user.id;
    }

    // YouTube設定を確認
    const settings = await prisma.userYoutubeSettings.findUnique({
      where: { userId: targetUserId },
    });

    // 設定がない、チャンネルIDがない、または12時間以内の場合はスキップ
    if (!settings || !settings.channelId || !shouldUpdateVideos(settings.lastFetchedAt)) {
      return NextResponse.json({
        message: '更新不要',
        reason: !settings 
          ? 'YouTube設定なし' 
          : !settings.channelId 
          ? 'チャンネルID未設定' 
          : '12時間以内に更新済み'
      });
    }

    // YouTube RSS URLを構築
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${settings.channelId}`;

    // YouTube RSS XMLを取得
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`YouTube RSS の取得に失敗: ${response.status}`);
    }

    const xmlData = await response.text();
    
    // XMLをパースして動画情報を抽出
    const videos = parseYouTubeRSS(xmlData);

    if (videos.length === 0) {
      return NextResponse.json({ message: '動画が見つかりませんでした' });
    }

    // 最大15件に制限
    const limitedVideos = videos.slice(0, 15);

    // トランザクションで設定と動画を更新
    await prisma.$transaction(async (tx) => {
      // 最後の取得時間を更新
      await tx.userYoutubeSettings.update({
        where: { userId: targetUserId },
        data: {
          lastFetchedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 既存の動画を削除
      await tx.userYoutubeVideo.deleteMany({
        where: { settingsId: settings.id },
      });

      // 新しい動画を挿入
      await Promise.all(
        limitedVideos.map((video) =>
          tx.userYoutubeVideo.create({
            data: {
              settingsId: settings.id,
              url: video.url,
              thumbnailUrl: video.thumbnailUrl,
              title: video.title,
              description: video.description,
              publishedAt: video.publishedAt,
            },
          })
        )
      );
    });

    return NextResponse.json({
      success: true,
      message: `${limitedVideos.length}件の動画を自動更新しました`,
      videoCount: limitedVideos.length,
    });

  } catch (error) {
    console.error('YouTube動画の自動更新に失敗:', error);
    
    // エラーログは出力するが、フロントエンドには影響させない
    return NextResponse.json(
      { 
        success: false,
        error: 'YouTube動画の自動更新に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
