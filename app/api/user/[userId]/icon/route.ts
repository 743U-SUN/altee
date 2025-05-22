import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // 本人確認（自分のiconUrlのみ取得可能）
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // データベースから最新のiconUrlを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { iconUrl: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      iconUrl: user.iconUrl
    });

  } catch (error) {
    console.error('User icon fetch error:', error);
    return NextResponse.json(
      { error: 'アイコン情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}