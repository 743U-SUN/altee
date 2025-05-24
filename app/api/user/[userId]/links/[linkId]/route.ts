// ユーザー用個別リンク操作API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UserLinkOperations } from '@/lib/links/linkService'

interface Params {
  userId: string
  linkId: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { userId, linkId } = params

    // 自分のデータのみ更新可能
    if (session.user.id !== userId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    
    // 空文字列のiconIdはnullに変換
    const updateData = {
      ...body,
      iconId: body.iconId || null
    }
    
    const link = await UserLinkOperations.updateUserLink(linkId, userId, updateData)

    return NextResponse.json({ 
      success: true,
      link,
      message: 'リンクを更新しました'
    })
  } catch (error) {
    console.error('ユーザーリンク更新エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'リンクの更新に失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { userId, linkId } = params

    // 自分のデータのみ削除可能
    if (session.user.id !== userId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }
    
    await UserLinkOperations.deleteUserLink(linkId, userId)

    return NextResponse.json({ 
      success: true,
      message: 'リンクを削除しました'
    })
  } catch (error) {
    console.error('ユーザーリンク削除エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'リンクの削除に失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
