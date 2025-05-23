// ユーザー用サービス一覧取得API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LinkServiceOperations } from '@/lib/links/linkService'

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // ユーザー向けはアクティブなサービスのみ取得
    const services = await LinkServiceOperations.getServices({
      isActive: true
    })

    return NextResponse.json({ 
      success: true,
      services 
    })
  } catch (error) {
    console.error('サービス取得エラー:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'サービスの取得に失敗しました' 
      },
      { status: 500 }
    )
  }
}
