import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile, deleteFile } from '@/lib/minio';
import { prisma } from '@/lib/prisma';
import { 
  validateImageFile, 
  processImageWithPreset, 
  generateImageFileName 
} from '@/lib/image-processing';
import { sanitizeSvgFile, isSvgFile, createSvgBuffer } from '@/lib/svg-sanitizer';

// ファイルサイズ制限（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  console.log('=== アイコンアップロードAPI開始 ===');
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('ファイル情報:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      userId: userId
    });

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

    // 既存の画像があれば削除
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { iconUrl: true }
    });

    if (existingUser?.iconUrl) {
      try {
        const oldFileName = existingUser.iconUrl.split('/').pop();
        if (oldFileName) {
          await deleteFile(`icons/${oldFileName}`);
        }
      } catch (error) {
        console.warn('既存ファイルの削除に失敗:', error);
      }
    }

    // ファイルをBufferに変換
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    let fileUrl: string;
    let uploadDetails: any;

    // SVGファイルの場合はサニタイズのみ、その他はWebP変換
    if (isSvgFile(file)) {
      console.log('サニタイズ処理開始: SVGファイル');
      
      // SVGサニタイズ
      const sanitizeResult = await sanitizeSvgFile(file);
      
      if (sanitizeResult.hasRemovedDangerousContent) {
        console.log('危険なコンテンツを除去しました:', {
          removedElements: sanitizeResult.removedElements,
          removedAttributes: sanitizeResult.removedAttributes
        });
      }
      
      // サニタイズされたSVGからBufferを作成
      const sanitizedBuffer = createSvgBuffer(sanitizeResult.sanitizedSvg);
      
      // ファイル名を生成（SVGはそのまま）
      const fileName = generateImageFileName(userId, 'user-icon', 'image/svg+xml');
      
      // MinIOへのアップロード
      console.log('MinIOアップロード開始:', fileName);
      fileUrl = await uploadFile(
        fileName, 
        sanitizedBuffer, 
        'image/svg+xml', 
        'icons'
      );
      
      uploadDetails = {
        format: 'svg',
        originalSize: inputBuffer.length,
        sanitizedSize: sanitizedBuffer.length,
        hasRemovedDangerousContent: sanitizeResult.hasRemovedDangerousContent,
        removedElements: sanitizeResult.removedElements,
        removedAttributes: sanitizeResult.removedAttributes
      };
      
    } else {
      // 通常の画像ファイルのWebP変換処理
      console.log('画像変換開始: アイコン用プリセットを使用');
      const processedResult = await processImageWithPreset(inputBuffer, 'icon');

      // ファイル名を生成
      const fileName = generateImageFileName(userId, 'user-icon', processedResult.outputFormat);

      // MinIOへのアップロード
      console.log('MinIOアップロード開始:', fileName);
      fileUrl = await uploadFile(
        fileName, 
        processedResult.buffer, 
        processedResult.outputFormat, 
        'icons'
      );
      
      uploadDetails = {
        format: 'webp',
        originalSize: processedResult.originalSize,
        optimizedSize: processedResult.processedSize,
        compressionRatio: processedResult.compressionRatio
      };
    }

    // データベースを更新
    await prisma.user.update({
      where: { id: userId },
      data: { iconUrl: fileUrl }
    });

    console.log('アップロード完了:', fileUrl);

    return NextResponse.json({
      url: fileUrl,
      message: 'アップロードが完了しました',
      details: uploadDetails
    });

  } catch (error) {
    console.error('=== アップロードAPIエラー ===', error);
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
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

    const { userId } = await request.json();

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { iconUrl: true }
    });

    if (user?.iconUrl) {
      try {
        const fileName = user.iconUrl.split('/').pop();
        if (fileName) {
          await deleteFile(`icons/${fileName}`);
        }
      } catch (error) {
        console.warn('ファイル削除エラー:', error);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { iconUrl: null }
    });

    return NextResponse.json({
      message: '画像を削除しました'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    );
  }
}