// ユーザー用サービス別アイコン取得API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { IconOperations } from '@/lib/links/linkService'

interface Params {
  serviceId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { serviceId } = params
    
    // ユーザー向けはアクティブなアイコンのみ取得
    const icons = await IconOperations.getIconsByService(serviceId)

    return NextResponse.json({ 
      success: true,
      icons 
    })
  } catch (error) {
    console.error('アイコン取得エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'アイコンの取得に失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
