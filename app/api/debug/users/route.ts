import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 全ユーザーの情報を取得（デバッグ用）
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        role: true,
        handleChangeCount: true,
        handleChangeTokens: true,
        isPremiumUser: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      message: "全ユーザー情報",
      users,
      count: users.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Debug users error:", error);
    return NextResponse.json(
      { 
        message: "ユーザー情報の取得中にエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
