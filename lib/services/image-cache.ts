/**
 * 画像キャッシュサービス
 * Amazon等の外部画像をMinIOにキャッシュして高速化
 */

import { minioClient, BUCKET_NAME } from '@/lib/minio';
import { processImageWithPreset } from '@/lib/image-processing';
import crypto from 'crypto';

/**
 * 画像URLからファイル拡張子を取得
 */
function getImageExtension(url: string): string {
  // URLから拡張子を推測
  const urlPath = url.split('?')[0]; // クエリパラメータを除去
  const match = urlPath.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  if (match) {
    return match[1].toLowerCase();
  }
  
  // デフォルトはjpg
  return 'jpg';
}

/**
 * 画像URLのハッシュを生成（ファイル名として使用）
 */
function generateImageHash(url: string): string {
  return crypto.createHash('md5').update(url).digest('hex');
}

/**
 * 外部画像をMinIOにキャッシュ（WebP変換・リサイズ付き）
 */
export async function cacheImageToMinio(imageUrl: string): Promise<string> {
  if (!imageUrl || imageUrl.startsWith('/') || imageUrl.includes('localhost:9000')) {
    // ローカル画像やすでにMinIOの画像はそのまま返す
    return imageUrl;
  }

  try {
    console.log('Caching image to MinIO with WebP conversion:', imageUrl);
    
    // ファイル名を生成（WebP拡張子で）
    const imageHash = generateImageHash(imageUrl);
    const fileName = `cached-images/${imageHash}.webp`;
    
    // すでにキャッシュされているかチェック
    try {
      await minioClient.statObject(BUCKET_NAME, fileName);
      // すでに存在する場合はMinIOのURLを返す
      const publicEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'localhost:9000';
      const cachedUrl = `http://${publicEndpoint}/${BUCKET_NAME}/${fileName}`;
      console.log('Image already cached:', cachedUrl);
      return cachedUrl;
    } catch (error) {
      // ファイルが存在しない場合は続行
    }
    
    // 外部画像をダウンロード
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageBot/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(imageBuffer);
    
    console.log('Processing image for cache:', {
      originalSize: `${Math.round(inputBuffer.length / 1024)}KB`,
      targetFormat: 'WebP',
      targetSize: '500x500px以内'
    });
    
    // WebP変換とリサイズ（500x500px以内）
    const processedResult = await processImageWithPreset(inputBuffer, 'productCache');
    
    // MinIOにアップロード
    await minioClient.putObject(
      BUCKET_NAME, 
      fileName, 
      processedResult.buffer,
      processedResult.buffer.length,
      {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000', // 1年キャッシュ
        'X-Original-Url': imageUrl,
        'X-Compression-Ratio': processedResult.compressionRatio,
      }
    );
    
    const publicEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || 'localhost:9000';
    const cachedUrl = `http://${publicEndpoint}/${BUCKET_NAME}/${fileName}`;
    
    console.log('Image cached successfully with WebP conversion:', {
      cachedUrl,
      originalSize: `${Math.round(processedResult.originalSize / 1024)}KB`,
      optimizedSize: `${Math.round(processedResult.processedSize / 1024)}KB`,
      compressionRatio: processedResult.compressionRatio
    });
    
    return cachedUrl;
    
  } catch (error) {
    console.error('Failed to cache image with WebP conversion:', error);
    // エラー時は元のURLをそのまま返す
    return imageUrl;
  }
}

/**
 * 複数の画像を並行してキャッシュ
 */
export async function cacheMultipleImages(imageUrls: string[]): Promise<string[]> {
  const promises = imageUrls.map(url => cacheImageToMinio(url));
  return Promise.all(promises);
}

/**
 * キャッシュされた画像の一覧を取得（管理用）
 */
export async function listCachedImages(): Promise<string[]> {
  try {
    const objects: string[] = [];
    const stream = minioClient.listObjects(BUCKET_NAME, 'cached-images/', true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => objects.push(obj.name || ''));
      stream.on('end', () => resolve(objects));
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('Failed to list cached images:', error);
    return [];
  }
}

/**
 * 古いキャッシュ画像を削除（管理用）
 */
export async function cleanupOldCachedImages(daysOld: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const objects: Array<{ name: string; lastModified: Date }> = [];
    const stream = minioClient.listObjects(BUCKET_NAME, 'cached-images/', true);
    
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name && obj.lastModified) {
          objects.push({ name: obj.name, lastModified: obj.lastModified });
        }
      });
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    
    // 古いファイルをフィルタリング
    const oldObjects = objects.filter(obj => obj.lastModified < cutoffDate);
    
    // 削除実行
    if (oldObjects.length > 0) {
      const objectsToDelete = oldObjects.map(obj => obj.name);
      await minioClient.removeObjects(BUCKET_NAME, objectsToDelete);
    }
    
    return oldObjects.length;
  } catch (error) {
    console.error('Failed to cleanup old cached images:', error);
    return 0;
  }
}