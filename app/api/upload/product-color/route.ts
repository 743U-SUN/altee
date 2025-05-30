import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile, deleteFile } from '@/lib/minio';
import { 
  validateImageFile, 
  processImageWithPreset, 
  generateImageFileName 
} from '@/lib/image-processing';
import { sanitizeSvgFile, isSvgFile, createSvgBuffer } from '@/lib/svg-sanitizer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productId = formData.get('productId') as string;
    const colorId = formData.get('colorId') as string;

    if (!file || !productId || !colorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
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
      const fileName = generateImageFileName(`product-${productId}-color-${colorId}`, 'product-color', 'image/svg+xml');
      
      // MinIOへのアップロード
      fileUrl = await uploadFile(
        fileName, 
        sanitizedBuffer, 
        'image/svg+xml', 
        'products'
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
      console.log('画像変換開始: 商品カラー用プリセットを使用');
      const processedResult = await processImageWithPreset(inputBuffer, 'productColor');

      // ファイル名を生成
      const fileName = generateImageFileName(`product-${productId}-color-${colorId}`, 'product-color', processedResult.outputFormat);

      // MinIOへのアップロード
      fileUrl = await uploadFile(
        fileName, 
        processedResult.buffer, 
        processedResult.outputFormat, 
        'products'
      );
      
      uploadDetails = {
        format: 'webp',
        originalSize: processedResult.originalSize,
        optimizedSize: processedResult.processedSize,
        compressionRatio: processedResult.compressionRatio
      };
    }

    // 画像URLの生成（プロキシ経由のURL）
    const imageUrl = `/api/images/${fileUrl.split('/').slice(-2).join('/')}`;

    return NextResponse.json({ 
      url: imageUrl,
      details: uploadDetails 
    });
  } catch (error) {
    console.error('Error uploading product color image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE: カラー画像の削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // URLからオブジェクト名を抽出
    // プロキシURL形式: /api/images/products/filename
    let objectName: string;
    if (imageUrl.startsWith('/api/images/')) {
      objectName = imageUrl.replace('/api/images/', '');
    } else {
      // 旧形式のURL対応
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.indexOf('altee-uploads');
      if (bucketIndex === -1) {
        return NextResponse.json(
          { error: 'Invalid image URL' },
          { status: 400 }
        );
      }
      objectName = urlParts.slice(bucketIndex + 1).join('/');
    }

    // ファイル削除
    await deleteFile(objectName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product color image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}