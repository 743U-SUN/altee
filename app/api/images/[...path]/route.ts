import { NextRequest, NextResponse } from 'next/server';
import { minioClient, BUCKET_NAME } from '@/lib/minio';
import { Readable } from 'stream';

// コンテンツタイプのマッピング
const contentTypeMap: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml',
  'ico': 'image/x-icon',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
};

/**
 * ファイル拡張子からContent-Typeを取得
 */
function getContentType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase() || '';
  return contentTypeMap[extension] || 'application/octet-stream';
}

/**
 * MinIOからストリームを取得してBufferに変換
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // パラメータを待機してから使用
    const resolvedParams = await params;
    // パスセグメントを結合してオブジェクトキーを作成
    const objectKey = resolvedParams.path.join('/');
    
    if (!objectKey) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      );
    }

    console.log('Image proxy request for:', objectKey);

    // MinIOからオブジェクトの情報を取得
    let stat;
    try {
      stat = await minioClient.statObject(BUCKET_NAME, objectKey);
    } catch (error) {
      console.error('Image not found:', objectKey, error);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // MinIOからオブジェクトをストリームとして取得
    const stream = await minioClient.getObject(BUCKET_NAME, objectKey);
    const buffer = await streamToBuffer(stream);

    // Content-Typeを決定（MinIOのメタデータまたは拡張子から）
    const contentType = stat.metaData?.['content-type'] || 
                       stat.metaData?.['Content-Type'] || 
                       getContentType(objectKey);

    // レスポンスヘッダーの設定
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': buffer.length.toString(),
      // CDNとブラウザキャッシュの設定（1年間、変更不可）
      'Cache-Control': 'public, max-age=31536000, immutable',
      // ETagの設定（MinIOから提供される場合）
      ...(stat.etag && { 'ETag': stat.etag }),
      // 最終更新日時
      ...(stat.lastModified && { 'Last-Modified': stat.lastModified.toUTCString() }),
      // CORS対応
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      // セキュリティヘッダー
      'X-Content-Type-Options': 'nosniff',
    });

    // 画像データを返す
    return new NextResponse(buffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    
    // エラーの種類に応じて適切なレスポンスを返す
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Storage service unavailable' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONSリクエストの処理（CORS対応）
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24時間
    },
  });
}