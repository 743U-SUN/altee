// 管理者用個別サービス操作API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LinkServiceOperations } from '@/lib/links/linkService'

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
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { serviceId } = params
    
    const service = await LinkServiceOperations.getServiceById(serviceId)

    if (!service) {
      return NextResponse.json(
        { 
          success: false,
          error: 'サービスが見つかりません' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      service 
    })
  } catch (error) {
    console.error('サービス取得エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'サービスの取得に失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // 認証チェック
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { serviceId } = params
    const body = await request.json()
    
    const service = await LinkServiceOperations.updateService(serviceId, body)

    return NextResponse.json({ 
      success: true,
      service,
      message: 'サービスを更新しました'
    })
  } catch (error) {
    console.error('サービス更新エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'サービスの更新に失敗しました'
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
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { serviceId } = params
    
    await LinkServiceOperations.deleteService(serviceId)

    return NextResponse.json({ 
      success: true,
      message: 'サービスを削除しました'
    })
  } catch (error) {
    console.error('サービス削除エラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'サービスの削除に失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: error instanceof Error && error.message.includes('使用中') ? 400 : 500 }
    )
  }
}
