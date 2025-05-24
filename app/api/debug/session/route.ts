import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // セッション情報を取得
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({
        message: "認証されていません",
        session: null
      });
    }

    // データベースからユーザー情報を取得
    let dbUser = null;
    if (session.user?.id) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          handle: true,
          role: true,
          iconUrl: true,
          bannerUrl: true,
          handleChangeCount: true,
          handleChangeTokens: true,
          isPremiumUser: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    return NextResponse.json({
      message: "セッション情報",
      session: {
        user: session.user,
        expires: session.expires
      },
      dbUser,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Debug session error:", error);
    return NextResponse.json(
      { 
        message: "セッション情報の取得中にエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
