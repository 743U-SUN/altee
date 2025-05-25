import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    // YouTube設定を取得
    const settings = await prisma.userYoutubeSettings.findUnique({
      where: { userId },
      include: {
        videos: {
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      settings: settings || null,
      videos: settings?.videos || [],
    });
  } catch (error) {
    console.error('YouTube設定の取得に失敗:', error);
    return NextResponse.json(
      { error: 'YouTube設定の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayCount } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    if (typeof displayCount !== 'number' || displayCount < 1 || displayCount > 15) {
      return NextResponse.json({ error: '表示数は1-15の範囲で指定してください' }, { status: 400 });
    }

    // 設定を更新（なければ作成）
    const settings = await prisma.userYoutubeSettings.upsert({
      where: { userId },
      update: {
        displayCount,
        updatedAt: new Date(),
      },
      create: {
        userId,
        displayCount,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('YouTube設定の更新に失敗:', error);
    return NextResponse.json(
      { error: 'YouTube設定の更新に失敗しました' },
      { status: 500 }
    );
  }
}
