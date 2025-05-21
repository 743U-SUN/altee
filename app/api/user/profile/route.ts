import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// バリデーションスキーマ
const profileUpdateSchema = z.object({
  characterName: z.string().min(1).max(50).optional(),
  subname: z.string().max(50).optional(),
  // 必要に応じて他のフィールドも追加
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        characterName: true,
        subname: true,
        // 必要に応じて他のフィールドも追加
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error("プロファイル取得エラー:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // リクエストボディの検証
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "無効なデータです", details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // ユーザープロファイルの更新
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        characterName: true,
        subname: true,
        // 必要に応じて他のフィールドも追加
      },
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("プロファイル更新エラー:", error)
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
