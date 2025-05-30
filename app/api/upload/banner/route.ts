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

// ファイルサイズ制限（8MB）
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  console.log('=== バナーアップロードAPI開始 ===');
  console.log('Request method:', request.method);
  console.log('Content-Type:', request.headers.get('content-type'));
  console.log('Content-Length:', request.headers.get('content-length'));
  
  try {
    // 認証チェック
    const session = await auth();
    console.log('セッション状態:', session?.user?.id ? 'ログイン済み' : '未ログイン');
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // FormDataの取得（エラーハンドリング強化）
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log('FormData 解析成功');
      
      // FormDataの内容をログ出力
      const entries = Array.from(formData.entries());
      console.log('FormData entries:', entries.map(([key, value]) => ({
        key,
        value: value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
      })));
      
    } catch (formDataError) {
      console.error('FormData パースエラー詳細:', {
        error: formDataError,
        message: formDataError instanceof Error ? formDataError.message : 'Unknown error',
        stack: formDataError instanceof Error ? formDataError.stack : undefined
      });
      
      return NextResponse.json(
        { error: 'リクエストデータの解析に失敗しました。ファイルサイズが大きすぎる可能性があります。' },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('バナーファイル情報:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      userId: userId,
      hasFile: !!file
    });

    // リクエスト検証
    if (!userId || userId !== session.user.id) {
      console.log('権限エラー:', { requestUserId: userId, sessionUserId: session.user.id });
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // ファイル検証
    const validationError = validateImageFile(file, MAX_FILE_SIZE);
    if (validationError) {
      console.log('ファイル検証エラー:', validationError);
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // 既存のバナー画像があれば削除
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { bannerUrl: true }
    });

    if (existingUser?.bannerUrl) {
      try {
        const oldFileName = existingUser.bannerUrl.split('/').pop();
        if (oldFileName) {
          console.log('既存バナー削除開始:', oldFileName);
          await deleteFile(`banners/${oldFileName}`);
          console.log('既存バナー削除完了');
        }
      } catch (error) {
        console.warn('既存バナーファイルの削除に失敗:', error);
      }
    }

    // ファイルをBufferに変換
    let inputBuffer: Buffer;
    try {
      const bytes = await file.arrayBuffer();
      inputBuffer = Buffer.from(bytes);
      console.log('ファイルBuffer変換完了:', inputBuffer.length, 'bytes');
    } catch (bufferError) {
      console.error('Buffer変換エラー:', bufferError);
      return NextResponse.json(
        { error: 'ファイルの読み込みに失敗しました' },
        { status: 500 }
      );
    }

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
      const fileName = generateImageFileName(userId, 'user-banner', 'image/svg+xml');
      
      // MinIOへのアップロード
      console.log('MinIOアップロード開始:', fileName);
      fileUrl = await uploadFile(
        fileName, 
        sanitizedBuffer, 
        'image/svg+xml', 
        'banners'
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
      console.log('画像変換開始: バナー用プリセットを使用');
      let processedResult;
      try {
        processedResult = await processImageWithPreset(inputBuffer, 'banner');
        console.log('画像変換完了:', {
          originalSize: processedResult.originalSize,
          processedSize: processedResult.processedSize,
          compressionRatio: processedResult.compressionRatio
        });
      } catch (imageProcessingError) {
        console.error('画像処理エラー:', imageProcessingError);
        return NextResponse.json(
          { error: '画像の変換に失敗しました。ファイル形式を確認してください。' },
          { status: 500 }
        );
      }

      // ファイル名を生成
      const fileName = generateImageFileName(userId, 'user-banner', processedResult.outputFormat);
      console.log('生成ファイル名:', fileName);

      // MinIOへのアップロード
      try {
        console.log('MinIOアップロード開始');
        fileUrl = await uploadFile(
          fileName, 
          processedResult.buffer, 
          processedResult.outputFormat, 
          'banners'
        );
        console.log('MinIOアップロード完了:', fileUrl);
      } catch (uploadError) {
        console.error('MinIOアップロードエラー:', uploadError);
        return NextResponse.json(
          { error: 'ファイルのアップロードに失敗しました' },
          { status: 500 }
        );
      }
      
      uploadDetails = {
        format: 'webp',
        originalSize: processedResult.originalSize,
        optimizedSize: processedResult.processedSize,
        compressionRatio: processedResult.compressionRatio
      };
    }

    // データベースを更新
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { bannerUrl: fileUrl }
      });
      console.log('データベース更新完了');
    } catch (dbError) {
      console.error('データベース更新エラー:', dbError);
      // MinIOからファイルを削除（ロールバック）
      try {
        await deleteFile(`banners/${fileName}`);
      } catch (rollbackError) {
        console.error('ロールバック失敗:', rollbackError);
      }
      return NextResponse.json(
        { error: 'データベースの更新に失敗しました' },
        { status: 500 }
      );
    }

    console.log('バナーアップロード完了:', fileUrl);

    return NextResponse.json({
      url: fileUrl,
      message: 'バナー画像のアップロードが完了しました',
      details: uploadDetails
    });

  } catch (error) {
    console.error('=== バナーアップロードAPIエラー ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
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

    const { userId } = await request.json();

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bannerUrl: true }
    });

    if (user?.bannerUrl) {
      try {
        const fileName = user.bannerUrl.split('/').pop();
        if (fileName) {
          await deleteFile(`banners/${fileName}`);
        }
      } catch (error) {
        console.warn('バナーファイル削除エラー:', error);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { bannerUrl: null }
    });

    return NextResponse.json({
      message: 'バナー画像を削除しました'
    });

  } catch (error) {
    console.error('バナー削除エラー:', error);
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    );
  }
}