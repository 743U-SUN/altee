// ユーザー用リンク一覧・作成API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { UserLinkOperations } from '@/lib/links/linkService'
import { userLinkSchema, validateFormData } from '@/lib/links/validation'
import type { LinkFilters } from '@/types/link'

interface Params {
  userId: string
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

    const { userId } = params

    // 自分のデータのみアクセス可能（管理者は除く）
    if (session.user.id !== userId && session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    const filters: LinkFilters = {
      search: searchParams.get('search') || undefined,
      serviceId: searchParams.get('serviceId') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      useOriginalIcon: searchParams.get('useOriginalIcon') ? searchParams.get('useOriginalIcon') === 'true' : undefined,
    }

    const links = await UserLinkOperations.getUserLinks(userId, filters)

    return NextResponse.json({ 
      success: true,
      links 
    })
  } catch (error) {
    console.error('ユーザーリンク取得エラー:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'リンクの取得に失敗しました' 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { userId } = params

    // 自分のデータのみ作成可能
    if (session.user.id !== userId) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    
    // バリデーション
    const validation = validateFormData(userLinkSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'バリデーションエラー',
          errors: validation.errors 
        },
        { status: 400 }
      )
    }

    // リンク作成
    const link = await UserLinkOperations.createUserLink(userId, validation.data!)

    return NextResponse.json({ 
      success: true,
      link,
      message: 'リンクを作成しました'
    })
  } catch (error) {
    console.error('ユーザーリンク作成エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'リンクの作成に失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
