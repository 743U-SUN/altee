// 管理者用サービス一覧・作成API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LinkServiceOperations } from '@/lib/links/linkService'
import { serviceSchema, validateFormData } from '@/lib/links/validation'
import type { ServiceFilters, ServiceFormData } from '@/types/link'

export async function GET(request: NextRequest) {
  try {
    // 認証チェック（管理者のみ）
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    const filters: ServiceFilters = {
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      allowOriginalIcon: searchParams.get('allowOriginalIcon') ? searchParams.get('allowOriginalIcon') === 'true' : undefined,
    }

    const services = await LinkServiceOperations.getServices(filters)

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

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const body = await request.json()
    
    // バリデーション
    const validation = validateFormData(serviceSchema, body)
    
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

    // サービス作成
    const serviceData = {
      ...validation.data!,
      // デフォルト値を確実に設定
      allowOriginalIcon: validation.data!.allowOriginalIcon ?? true
    }
    
    const service = await LinkServiceOperations.createService(serviceData)

    return NextResponse.json({ 
      success: true,
      service,
      message: 'サービスを作成しました'
    })
  } catch (error) {
    console.error('サービス作成エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'サービスの作成に失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
