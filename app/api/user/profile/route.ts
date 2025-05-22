import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sanitizeDisplayName, containsDangerousPatterns } from "@/lib/security/sanitize"

// サーバーサイドのサニタイゼーション関数（名前用）
const sanitizeNameInput = (input: string): string => {
  return input
    .trim() // 前後の空白を削除
    .replace(/[<>]/g, '') // HTMLタグ文字を削除
    .replace(/[^\p{L}\p{N}\s\-_。、！？]/gu, '') // 許可された文字のみ残す
    .replace(/\s+/g, ' ') // 連続した空白を単一の空白に
    .slice(0, 50) // 長さ制限を強制
}

// サーバーサイドのサニタイゼーション関数（bio用）
const sanitizeBioInput = (input: string): string => {
  return input
    .trim() // 前後の空白を削除
    .replace(/[<>]/g, '') // HTMLタグ文字を削除
    .replace(/[^\p{L}\p{N}\s\-_。、！？\n]/gu, '') // 許可された文字のみ残す（改行許可）
    .replace(/\n{3,}/g, '\n\n') // 連続した改行を2つまでに制限
    .slice(0, 1000) // 長さ制限を強制
}

// サーバーサイドバリデーションスキーマ（より厳密）
const profileUpdateSchema = z.object({
  characterName: z
    .string()
    .min(1, "キャラクター名は必須です")
    .max(50, "キャラクター名は50文字以内で入力してください")
    .regex(/^[^\<\>]*$/, "不正な文字が含まれています")
    .regex(/^(?!.*<script).*$/i, "スクリプトタグは使用できません")
    .regex(/^(?!.*javascript:).*$/i, "JavaScriptコードは使用できません")
    .regex(/^(?!.*data:).*$/i, "データURLは使用できません")
    .regex(/^(?!.*vbscript:).*$/i, "VBScriptは使用できません")
    .refine((val) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
    .transform(sanitizeNameInput)
    .refine((val) => val.length > 0, "有効な文字を入力してください")
    .optional(),
  subname: z
    .string()
    .max(50, "サブネームは50文字以内で入力してください")
    .regex(/^[^\<\>]*$/, "不正な文字が含まれています")
    .regex(/^(?!.*<script).*$/i, "スクリプトタグは使用できません")
    .regex(/^(?!.*javascript:).*$/i, "JavaScriptコードは使用できません")
    .regex(/^(?!.*data:).*$/i, "データURLは使用できません")
    .regex(/^(?!.*vbscript:).*$/i, "VBScriptは使用できません")
    .refine((val) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
    .transform(sanitizeNameInput)
    .optional(),
  bio: z
    .string()
    .max(1000, "自己紹介文は1000文字以内で入力してください")
    .regex(/^[^\<\>]*$/, "不正な文字が含まれています")
    .regex(/^(?!.*<script).*$/i, "スクリプトタグは使用できません")
    .regex(/^(?!.*javascript:).*$/i, "JavaScriptコードは使用できません")
    .regex(/^(?!.*data:).*$/i, "データURLは使用できません")
    .regex(/^(?!.*vbscript:).*$/i, "VBScriptは使用できません")
    .refine((val) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
    .transform(sanitizeBioInput)
    .optional(),
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
        bio: true,
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
    
    // Content-Typeの確認
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: "不正なContent-Type" },
        { status: 400 }
      )
    }
    
    // リクエストボディの検証
    const validationResult = profileUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      console.error("バリデーションエラー:", validationResult.error.format())
      return NextResponse.json(
        { error: "入力データが無効です", details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // 空のオブジェクトを送信された場合の対策
    if (!data.characterName && !data.subname && !data.bio) {
      return NextResponse.json(
        { error: "更新するデータがありません" },
        { status: 400 }
      )
    }
    
    // データベース更新（Prismaの型安全性により、SQLインジェクションは防がれる）
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(data.characterName !== undefined && { characterName: data.characterName }),
        ...(data.subname !== undefined && { subname: data.subname }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        characterName: true,
        subname: true,
        bio: true,
      },
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("プロファイル更新エラー:", error)
    
    // Prismaエラーの場合
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: "その名前は既に使用されています" },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    )
  }
}
