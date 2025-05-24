import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "email and role are required" },
        { status: 400 }
      );
    }

    // ユーザーのroleを更新
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        role: true
      }
    });

    return NextResponse.json({
      message: `User role updated to ${role}`,
      user: updatedUser,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { 
        message: "ユーザーロールの更新中にエラーが発生しました",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
