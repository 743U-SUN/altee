import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile, deleteFile } from '@/lib/minio';
import { prisma } from '@/lib/prisma';
import { 
  validateImageFile, 
  processImageWithPreset, 
  generateImageFileName 
} from '@/lib/image-processing';

// ファイルサイズ制限
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  console.log('=== サイドバー画像アップロードAPI開始 ===');
  
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // FormDataの取得（エラーハンドリング必須）
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formDataError) {
      console.error('FormData パースエラー:', formDataError);
      return NextResponse.json(
        { error: 'リクエストデータの解析に失敗しました' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const sortOrder = parseInt(formData.get('sortOrder') as string || '0');

    // リクエスト検証
    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // ファイル検証
    const validationError = validateImageFile(file, MAX_FILE_SIZE);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // 現在のサイドバー画像数をチェック（最大3枚）
    const currentSidebarCount = await prisma.userImageSidebar.count({
      where: { userId }
    });

    if (currentSidebarCount >= 3) {
      return NextResponse.json(
        { error: 'サイドバー画像は最大3枚までです' },
        { status: 400 }
      );
    }

    // ファイル処理
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // 画像変換（userSidebarプリセット使用）
    const processedResult = await processImageWithPreset(inputBuffer, 'userSidebar');

    // ファイル名生成
    const fileName = generateImageFileName(userId, 'user-sidebar', processedResult.outputFormat);

    // MinIOアップロード
    const fileUrl = await uploadFile(
      fileName, 
      processedResult.buffer, 
      processedResult.outputFormat, 
      'sidebars'
    );

    // データベースに保存
    const sidebarImage = await prisma.userImageSidebar.create({
      data: {
        userId,
        imgUrl: fileUrl,
        sortOrder: sortOrder || currentSidebarCount,
        alt: file.name.split('.')[0] // ファイル名をデフォルトのaltテキストとして使用
      }
    });

    return NextResponse.json({
      id: sidebarImage.id,
      url: fileUrl,
      sortOrder: sidebarImage.sortOrder,
      message: 'サイドバー画像のアップロードが完了しました',
      details: {
        format: 'webp',
        originalSize: processedResult.originalSize,
        optimizedSize: processedResult.processedSize,
        compressionRatio: processedResult.compressionRatio
      }
    });

  } catch (error) {
    console.error('=== サイドバー画像アップロードAPIエラー ===', error);
    return NextResponse.json(
      { error: 'サーバー内部エラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { userId, imageId } = await request.json();

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    if (!imageId) {
      return NextResponse.json(
        { error: '画像IDが必要です' },
        { status: 400 }
      );
    }

    // 削除対象の画像を取得
    const sidebarImage = await prisma.userImageSidebar.findUnique({
      where: { id: imageId }
    });

    if (!sidebarImage || sidebarImage.userId !== userId) {
      return NextResponse.json(
        { error: '画像が見つかりません' },
        { status: 404 }
      );
    }

    // MinIOから画像を削除
    if (sidebarImage.imgUrl) {
      try {
        const fileName = sidebarImage.imgUrl.split('/').pop();
        if (fileName) {
          await deleteFile(`sidebars/${fileName}`);
        }
      } catch (error) {
        console.warn('ファイル削除エラー:', error);
      }
    }

    // データベースから削除
    await prisma.userImageSidebar.delete({
      where: { id: imageId }
    });

    // 削除後の並び順を調整
    const remainingImages = await prisma.userImageSidebar.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' }
    });

    // 並び順を更新
    await Promise.all(
      remainingImages.map((img, index) =>
        prisma.userImageSidebar.update({
          where: { id: img.id },
          data: { sortOrder: index }
        })
      )
    );

    return NextResponse.json({
      message: 'サイドバー画像を削除しました'
    });

  } catch (error) {
    console.error('サイドバー画像削除エラー:', error);
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    );
  }
}

// 並び順の更新とURL/Alt更新
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { userId, images, imageId, url, alt } = await request.json();

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // URL更新またはAlt更新の場合
    if (imageId && (url !== undefined || alt !== undefined)) {
      const sidebarImage = await prisma.userImageSidebar.findUnique({
        where: { id: imageId }
      });

      if (!sidebarImage || sidebarImage.userId !== userId) {
        return NextResponse.json(
          { error: '画像が見つかりません' },
          { status: 404 }
        );
      }

      const updateData: any = {};
      if (url !== undefined) updateData.url = url;
      if (alt !== undefined) updateData.alt = alt;

      await prisma.userImageSidebar.update({
        where: { id: imageId },
        data: updateData
      });

      return NextResponse.json({
        message: '更新しました'
      });
    }

    // 並び順更新の場合
    if (Array.isArray(images)) {
      // 並び順を更新
      await Promise.all(
        images.map((image) =>
          prisma.userImageSidebar.update({
            where: { id: image.id },
            data: { sortOrder: image.sortOrder }
          })
        )
      );

      return NextResponse.json({
        message: '並び順を更新しました'
      });
    }

    return NextResponse.json(
      { error: '更新データが不正です' },
      { status: 400 }
    );

  } catch (error) {
    console.error('更新エラー:', error);
    return NextResponse.json(
      { error: '更新に失敗しました' },
      { status: 500 }
    );
  }
}

// サイドバー画像の一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    const sidebarImages = await prisma.userImageSidebar.findMany({
      where: { userId },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({
      images: sidebarImages
    });

  } catch (error) {
    console.error('サイドバー画像取得エラー:', error);
    return NextResponse.json(
      { error: '取得に失敗しました' },
      { status: 500 }
    );
  }
}