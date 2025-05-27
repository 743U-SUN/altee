// 管理者用個別アイコン操作API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { IconOperations } from '@/lib/links/linkService'

interface Params {
  iconId: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { iconId } = await params
    const body = await request.json()
    
    const icon = await IconOperations.updateIcon(iconId, body)

    return NextResponse.json({ 
      success: true,
      icon,
      message: 'アイコンを更新しました'
    })
  } catch (error) {
    console.error('アイコン更新エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'アイコンの更新に失敗しました'
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
  { params }: { params: Promise<Params> }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { iconId } = await params
    
    await IconOperations.deleteIcon(iconId)

    return NextResponse.json({ 
      success: true,
      message: 'アイコンを削除しました'
    })
  } catch (error) {
    console.error('アイコン削除エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'アイコンの削除に失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: error instanceof Error && error.message.includes('使用中') ? 400 : 500 }
    )
  }
}
