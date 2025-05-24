import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateHandle } from "@/lib/validation/handleValidation";

export async function POST(request: NextRequest) {
  try {
    // 認証確認
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "認証が必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { handle } = body;

    if (!handle) {
      return NextResponse.json(
        { success: false, message: "ハンドルが指定されていません" },
        { status: 400 }
      );
    }

    // バリデーションチェック
    const validation = validateHandle(handle);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    // 現在のユーザー情報を取得
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        handle: true, 
        handleChangeTokens: true,
        handleChangeCount: true 
      }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // 変更可能トークンの確認
    if (currentUser.handleChangeTokens <= 0) {
      return NextResponse.json(
        { success: false, message: "ハンドル変更可能回数を超えています" },
        { status: 403 }
      );
    }

    // 重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { handle },
      select: { id: true }
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "このハンドルは既に使用されています" },
        { status: 409 }
      );
    }

    // ハンドル更新
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        handle,
        handleChangeTokens: currentUser.handleChangeTokens - 1,
        handleChangeCount: currentUser.handleChangeCount + 1,
      },
      select: { handle: true }
    });

    return NextResponse.json({
      success: true,
      message: "ハンドルが正常に更新されました",
      handle: updatedUser.handle
    });

  } catch (error) {
    console.error("Handle update error:", error);
    return NextResponse.json(
      { success: false, message: "ハンドルの更新中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
