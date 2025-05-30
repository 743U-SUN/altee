import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { minioClient, BUCKET_NAME } from '@/lib/minio';
import { db } from '@/lib/prisma';
import sharp from 'sharp';

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

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' },
        { status: 400 }
      );
    }

    // 画像の処理とリサイズ
    const buffer = Buffer.from(await file.arrayBuffer());
    const processedImage = await sharp(buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer();

    // バケットの存在確認
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME);
    }

    // ファイル名の生成
    const timestamp = Date.now();
    const fileName = `products/${productId}/colors/${colorId}-${timestamp}.webp`;

    // MinIOにアップロード
    await minioClient.putObject(
      BUCKET_NAME,
      fileName,
      processedImage,
      processedImage.length,
      {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000',
      }
    );

    // 画像URLの生成（クライアントからアクセス可能なURL）
    // Docker環境ではlocalhostを使用、本番環境では環境変数を使用
    const publicEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'localhost:9000';
    const imageUrl = `http://${publicEndpoint}/${BUCKET_NAME}/${fileName}`;

    return NextResponse.json({ url: imageUrl });
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
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.indexOf(BUCKET_NAME);
    if (bucketIndex === -1) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      );
    }

    const objectName = urlParts.slice(bucketIndex + 1).join('/');
    const minioClient = getMinioClient();

    // MinIOからオブジェクトを削除
    await minioClient.removeObject(BUCKET_NAME, objectName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product color image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}