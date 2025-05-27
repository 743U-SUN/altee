import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    // ユーザーをhandleで検索
    const user = await prisma.user.findUnique({
      where: { handle },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // ユーザーのバナー画像を取得（sortOrderでソート）
    const banners = await prisma.userImageBanner.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        url: true,
        imgUrl: true,
        alt: true,
        sortOrder: true,
      }
    });

    return NextResponse.json({
      success: true,
      banners
    });

  } catch (error) {
    console.error('Banner API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
