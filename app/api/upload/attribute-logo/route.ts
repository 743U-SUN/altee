import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile, deleteFile } from '@/lib/minio';
import { 
  validateImageFile, 
  processImageWithPreset, 
  generateImageFileName 
} from '@/lib/image-processing';
import { 
  isSvgFile, 
  sanitizeSvgFile, 
  createSvgBuffer 
} from '@/lib/svg-sanitizer';

// ファイルサイズ制限
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  console.log('=== 属性ロゴアップロードAPI開始 ===');
  
  try {
    // 認証チェック（管理者のみ）
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 401 }
      );
    }

    // FormDataの取得
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
    const attributeName = formData.get('attributeName') as string;

    // リクエスト検証
    if (!attributeName) {
      return NextResponse.json(
        { error: '属性名が必要です' },
        { status: 400 }
      );
    }

    // ファイル検証（SVGと一般画像ファイルの両方をサポート）
    if (isSvgFile(file)) {
      // SVGファイルの検証
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `ファイルサイズが大きすぎます（最大${MAX_FILE_SIZE / 1024 / 1024}MB）` },
          { status: 400 }
        );
      }
    } else {
      // 一般画像ファイルの検証
      const validationError = validateImageFile(file, MAX_FILE_SIZE);
      if (validationError) {
        return NextResponse.json(
          { error: validationError },
          { status: 400 }
        );
      }
    }

    // 安全なファイル名生成関数
    const generateSafeFileName = (baseName: string, extension: string): string => {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      
      // ベース名をサニタイズ（全角・半角スペース、特殊文字を除去）
      const safeName = baseName
        .trim()
        .replace(/[\s\u3000]+/g, '-') // 全角・半角スペースをハイフンに
        .replace(/[^\w\-]/g, '') // 英数字とハイフン以外を除去
        .replace(/-+/g, '-') // 連続ハイフンを1つに
        .replace(/^-|-$/g, '') // 先頭・末尾のハイフンを除去
        .toLowerCase()
        .substring(0, 50); // 長すぎる場合は50文字に制限
      
      // 空文字になった場合のフォールバック
      const finalName = safeName || 'unnamed';
      
      return `${finalName}-${timestamp}-${randomSuffix}.${extension}`;
    };

    let fileUrl: string;
    let responseDetails: any;

    // SVGファイルかどうかで処理を分岐
    if (isSvgFile(file)) {
      console.log('SVGファイルを検出、サニタイズ処理を開始');
      
      // SVGサニタイズ処理
      const sanitizeResult = await sanitizeSvgFile(file);
      
      if (sanitizeResult.hasRemovedDangerousContent) {
        console.warn('危険なコンテンツを除去:', {
          removedElements: sanitizeResult.removedElements,
          removedAttributes: sanitizeResult.removedAttributes
        });
      }
      
      const svgBuffer = createSvgBuffer(sanitizeResult.sanitizedSvg);
      const fileName = generateSafeFileName(attributeName, 'svg');
      
      // SVGをそのままアップロード
      fileUrl = await uploadFile(
        fileName,
        svgBuffer,
        'image/svg+xml',
        'attribute-logos'
      );
      
      responseDetails = {
        format: 'svg',
        originalSize: file.size,
        optimizedSize: svgBuffer.length,
        compressionRatio: ((file.size - svgBuffer.length) / file.size * 100).toFixed(1) + '%',
        sanitized: sanitizeResult.hasRemovedDangerousContent,
        removedElements: sanitizeResult.removedElements,
        removedAttributes: sanitizeResult.removedAttributes
      };
    } else {
      console.log('ビットマップ画像を検出、WebP変換処理を開始');
      
      // ビットマップ画像の処理（PNG, JPG, WebP等）
      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      // 画像変換（logoプリセット使用）
      const processedResult = await processImageWithPreset(inputBuffer, 'logo');
      
      const fileName = generateSafeFileName(attributeName, processedResult.outputFormat);

      // MinIOアップロード
      fileUrl = await uploadFile(
        fileName, 
        processedResult.buffer, 
        processedResult.outputFormat, 
        'attribute-logos'
      );
      
      responseDetails = {
        format: processedResult.outputFormat,
        originalSize: processedResult.originalSize,
        optimizedSize: processedResult.processedSize,
        compressionRatio: processedResult.compressionRatio
      };
    }

    return NextResponse.json({
      url: fileUrl,
      message: '属性ロゴのアップロードが完了しました',
      details: responseDetails
    });

  } catch (error) {
    console.error('=== 属性ロゴアップロードAPIエラー ===', error);
    
    // より詳細なエラーメッセージを提供
    let errorMessage = 'サーバー内部エラーが発生しました';
    
    if (error instanceof Error) {
      if (error.message.includes('SVGサニタイズエラー')) {
        errorMessage = 'SVGファイルの処理中にエラーが発生しました。ファイルが破損している可能性があります。';
      } else if (error.message.includes('ファイルのアップロードに失敗')) {
        errorMessage = 'ファイルのアップロードに失敗しました。ファイル名に特殊文字が含まれている可能性があります。';
      } else if (error.message.includes('Image processing')) {
        errorMessage = '画像の処理中にエラーが発生しました。サポートされていない画像形式の可能性があります。';
      }
      
      console.error('詳細エラー:', error.message);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 401 }
      );
    }

    const { logoUrl } = await request.json();

    if (!logoUrl) {
      return NextResponse.json(
        { error: 'ロゴURLが必要です' },
        { status: 400 }
      );
    }

    try {
      const fileName = logoUrl.split('/').pop();
      if (fileName) {
        await deleteFile(`attribute-logos/${fileName}`);
      }
    } catch (error) {
      console.warn('ロゴファイル削除エラー:', error);
    }

    return NextResponse.json({
      message: '属性ロゴを削除しました'
    });

  } catch (error) {
    console.error('属性ロゴ削除エラー:', error);
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    );
  }
}