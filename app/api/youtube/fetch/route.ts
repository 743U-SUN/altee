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
    const { userId, channelId, displayCount } = body;

    if (!userId || !channelId) {
      return NextResponse.json(
        { error: 'ユーザーIDとチャンネルIDが必要です' },
        { status: 400 }
      );
    }

    if (typeof displayCount !== 'number' || displayCount < 1 || displayCount > 15) {
      return NextResponse.json(
        { error: '表示数は1-15の範囲で指定してください' },
        { status: 400 }
      );
    }

    // 既存の設定を確認
    const existingSettings = await prisma.userYoutubeSettings.findUnique({
      where: { userId },
    });

    // 12時間以内の場合は再取得をスキップ（強制フラグがない限り）
    const forceUpdate = body.forceUpdate === true;
    if (!forceUpdate && existingSettings?.lastFetchedAt && !shouldUpdateVideos(existingSettings.lastFetchedAt)) {
      // 既存の動画データを返す
      const videos = await prisma.userYoutubeVideo.findMany({
        where: { settingsId: existingSettings.id },
        orderBy: { publishedAt: 'desc' },
      });

      return NextResponse.json({
        settings: existingSettings,
        videos,
        message: '最近取得済みのため、既存データを返しました',
      });
    }

    // YouTube RSS URLを構築
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    // YouTube RSS XMLを取得
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`YouTube RSS の取得に失敗しました: ${response.status}`);
    }

    const xmlData = await response.text();
    
    // XMLをパースして動画情報を抽出
    const videos = parseYouTubeRSS(xmlData);

    if (videos.length === 0) {
      return NextResponse.json(
        { error: 'チャンネルから動画が見つかりませんでした' },
        { status: 404 }
      );
    }

    // 最大15件に制限
    const limitedVideos = videos.slice(0, 15);

    // トランザクションで設定と動画を更新
    const result = await prisma.$transaction(async (tx) => {
      // 設定を更新または作成
      const settings = await tx.userYoutubeSettings.upsert({
        where: { userId },
        update: {
          channelId,
          displayCount,
          lastFetchedAt: new Date(),
          updatedAt: new Date(),
        },
        create: {
          userId,
          channelId,
          displayCount,
          lastFetchedAt: new Date(),
        },
      });

      // 既存の動画を削除
      await tx.userYoutubeVideo.deleteMany({
        where: { settingsId: settings.id },
      });

      // 新しい動画を挿入
      const createdVideos = await Promise.all(
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

      return { settings, videos: createdVideos };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('YouTube動画の取得に失敗:', error);
    
    // エラーメッセージを詳細化
    let errorMessage = 'YouTube動画の取得に失敗しました';
    if (error instanceof Error) {
      if (error.message.includes('YouTube RSS')) {
        errorMessage = 'YouTubeチャンネルが見つからないか、RSSフィードにアクセスできません';
      } else if (error.message.includes('XML')) {
        errorMessage = 'YouTubeデータの解析に失敗しました';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
