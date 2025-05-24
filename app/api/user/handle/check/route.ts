import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateHandle } from "@/lib/validation/handleValidation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle } = body;

    if (!handle) {
      return NextResponse.json(
        { message: "ハンドルが指定されていません", available: false },
        { status: 400 }
      );
    }

    // バリデーションチェック
    const validation = validateHandle(handle);
    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.message, available: false },
        { status: 400 }
      );
    }

    // データベースで重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { handle },
      select: { id: true }
    });

    const available = !existingUser;

    return NextResponse.json({
      available,
      message: available ? "使用可能です" : "このハンドルは既に使用されています"
    });

  } catch (error) {
    console.error("Handle check error:", error);
    return NextResponse.json(
      { message: "ハンドルの確認中にエラーが発生しました", available: false },
      { status: 500 }
    );
  }
}
