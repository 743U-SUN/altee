// ユーザーリンク並び替えAPI

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UserLinkOperations } from '@/lib/links/linkService'
import { z } from 'zod'

interface Params {
  userId: string
}

// リクエストボディのバリデーションスキーマ
const reorderSchema = z.object({
  links: z.array(z.object({
    id: z.string(),
    sortOrder: z.number().int().min(0)
  })).min(1, '並び替えるリンクを指定してください')
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { userId } = await params

    // 自分のデータのみ更新可能
    if (session.user.id !== userId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    // リクエストボディの取得
    const body = await request.json()
    
    // バリデーション
    const validation = reorderSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'バリデーションエラー',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    const { links } = validation.data

    // sortOrder順でソートしてからIDのみ抽出
    const linkIds = links
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(link => link.id)

    // 並び替え実行
    await UserLinkOperations.reorderUserLinks(userId, linkIds)

    return NextResponse.json({ 
      success: true,
      message: 'リンクの並び順を更新しました'
    })
  } catch (error) {
    console.error('リンク並び替えエラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'リンクの並び替えに失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
