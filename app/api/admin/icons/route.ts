// 管理者用アイコン一覧・作成API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { IconOperations } from '@/lib/links/linkService'
import { iconSchema, validateFormData, validateUploadFile } from '@/lib/links/validation'
import { uploadFile } from '@/lib/minio'
import type { IconFilters } from '@/types/link'

export async function GET(request: NextRequest) {
  try {
    // 認証チェック（管理者のみ）
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    const filters: IconFilters = {
      search: searchParams.get('search') || undefined,
      serviceId: searchParams.get('serviceId') || undefined,
      style: searchParams.get('style') as any || undefined,
      colorScheme: searchParams.get('colorScheme') as any || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    }

    const icons = await IconOperations.getIcons(filters)

    return NextResponse.json({ 
      success: true,
      icons 
    })
  } catch (error) {
    console.error('アイコン取得エラー:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'アイコンの取得に失敗しました' 
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const serviceId = formData.get('serviceId') as string
    const style = formData.get('style') as string
    const colorScheme = formData.get('colorScheme') as string
    const description = formData.get('description') as string | null

    // ファイルの検証
    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ファイルが選択されていません' 
        },
        { status: 400 }
      )
    }

    const fileValidation = validateUploadFile(file)
    if (!fileValidation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: fileValidation.error 
        },
        { status: 400 }
      )
    }

    // メタデータの検証
    const validation = validateFormData(iconSchema, {
      name,
      serviceId,
      style,
      colorScheme,
      description: description || undefined
    })
    
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

    // ファイル名生成
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${serviceId}-${timestamp}.${extension}`
    
    // ファイルをBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)
    
    // MinIOにアップロード
    const filePath = await uploadFile(
      fileName,
      fileBuffer,
      file.type,
      'icons/services'
    )

    // データベースに保存
    const icon = await IconOperations.createIcon({
      name: validation.data!.name,
      fileName,
      filePath,
      style: validation.data!.style,
      colorScheme: validation.data!.colorScheme,
      description: validation.data!.description,
      serviceId: validation.data!.serviceId,
      uploadedBy: session.user.id
    })

    return NextResponse.json({ 
      success: true,
      icon,
      message: 'アイコンをアップロードしました'
    })
  } catch (error) {
    console.error('アイコンアップロードエラー:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'アイコンのアップロードに失敗しました'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
