// lib/image-processing.ts
import sharp from 'sharp';

// 画像変換設定の型定義
export interface ImageProcessingConfig {
  format: 'webp' | 'jpeg' | 'png';
  quality?: number;      // 画質（1-100）
  effort?: number;       // WebPのエンコード効率（0-6）
  maxWidth?: number;     // 最大幅
  maxHeight?: number;    // 最大高さ
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  withoutEnlargement?: boolean;
  progressive?: boolean; // JPEGのプログレッシブ
  lossless?: boolean;    // WebPのロスレス圧縮
}

// プリセット設定
export const IMAGE_PRESETS = {
  // アイコン用（400x400、高品質）
  icon: {
    format: 'webp' as const,
    quality: 85,
    effort: 4,
    maxWidth: 400,
    maxHeight: 400,
    fit: 'inside' as const,
    withoutEnlargement: true,
    lossless: false
  },
  
  // バナー用（600x200、高品質）
  banner: {
    format: 'webp' as const,
    quality: 85,
    effort: 4,
    maxWidth: 600,
    maxHeight: 200,
    fit: 'inside' as const,
    withoutEnlargement: true,
    lossless: false
  },
  
  // ブログ画像用（1200x800、中品質）
  blog: {
    format: 'webp' as const,
    quality: 80,
    effort: 4,
    maxWidth: 1200,
    maxHeight: 800,
    fit: 'inside' as const,
    withoutEnlargement: true,
    lossless: false
  },
  
  // サムネイル用（300x200、中品質）
  thumbnail: {
    format: 'webp' as const,
    quality: 75,
    effort: 3,
    maxWidth: 300,
    maxHeight: 200,
    fit: 'cover' as const,
    withoutEnlargement: false,
    lossless: false
  },
  
  // 高解像度画像用（2400x1600、高品質）
  highRes: {
    format: 'webp' as const,
    quality: 90,
    effort: 6,
    maxWidth: 2400,
    maxHeight: 1600,
    fit: 'inside' as const,
    withoutEnlargement: true,
    lossless: false
  },
  
  // カルーセル用（432x768、高品質）縦長
  carousel: {
    format: 'webp' as const,
    quality: 85,
    effort: 4,
    maxWidth: 432,
    maxHeight: 768,
    fit: 'inside' as const,
    withoutEnlargement: true,
    lossless: false
  }
} as const;

// 許可する入力形式
export const ALLOWED_INPUT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  'image/bmp'
];

// ファイル形式検証
export function validateImageFile(file: File, maxSize: number = 10 * 1024 * 1024): string | null {
  if (!file) {
    return 'ファイルが選択されていません';
  }

  if (!ALLOWED_INPUT_TYPES.includes(file.type)) {
    return '対応していないファイル形式です';
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `ファイルサイズは${maxSizeMB}MB以下にしてください`;
  }

  return null;
}

// 画像メタデータの型定義
export interface ImageMetadata {
  format?: string;
  width?: number;
  height?: number;
  hasAlpha?: boolean;
  density?: number;
  orientation?: number;
}

// 画像処理結果の型定義
export interface ProcessedImageResult {
  buffer: Buffer;
  metadata: ImageMetadata;
  outputFormat: string;
  originalSize: number;
  processedSize: number;
  compressionRatio: string;
}

/**
 * 画像を指定された設定で変換する
 * @param inputBuffer 入力画像のBuffer
 * @param config 変換設定
 * @returns 変換された画像の情報
 */
export async function processImage(
  inputBuffer: Buffer,
  config: ImageProcessingConfig
): Promise<ProcessedImageResult> {
  try {
    const sharpInstance = sharp(inputBuffer);
    
    // 元画像のメタデータを取得
    const metadata = await sharpInstance.metadata();
    
    console.log('画像処理開始:', {
      inputFormat: metadata.format,
      inputSize: `${metadata.width}x${metadata.height}`,
      outputFormat: config.format,
      targetSize: config.maxWidth && config.maxHeight 
        ? `${config.maxWidth}x${config.maxHeight}` 
        : '制限なし'
    });

    // リサイズ設定
    let processedInstance = sharpInstance;
    
    if (config.maxWidth || config.maxHeight) {
      processedInstance = processedInstance.resize(config.maxWidth, config.maxHeight, {
        fit: config.fit || 'inside',
        withoutEnlargement: config.withoutEnlargement !== false
      });
    }

    // フォーマット変換と品質設定
    let outputBuffer: Buffer;
    let outputFormat: string;

    switch (config.format) {
      case 'webp':
        outputBuffer = await processedInstance
          .webp({
            quality: config.quality || 80,
            effort: config.effort || 4,
            lossless: config.lossless || false
          })
          .toBuffer();
        outputFormat = 'image/webp';
        break;

      case 'jpeg':
        outputBuffer = await processedInstance
          .jpeg({
            quality: config.quality || 80,
            progressive: config.progressive || false
          })
          .toBuffer();
        outputFormat = 'image/jpeg';
        break;

      case 'png':
        outputBuffer = await processedInstance
          .png({
            quality: config.quality || 80,
            progressive: config.progressive || false
          })
          .toBuffer();
        outputFormat = 'image/png';
        break;

      default:
        throw new Error(`サポートされていない出力形式: ${config.format}`);
    }

    const compressionRatio = ((1 - outputBuffer.length / inputBuffer.length) * 100).toFixed(2);

    console.log('画像処理完了:', {
      originalSize: `${Math.round(inputBuffer.length / 1024)}KB`,
      processedSize: `${Math.round(outputBuffer.length / 1024)}KB`,
      compressionRatio: `${compressionRatio}%`
    });

    return {
      buffer: outputBuffer,
      metadata,
      outputFormat,
      originalSize: inputBuffer.length,
      processedSize: outputBuffer.length,
      compressionRatio: `${compressionRatio}%`
    };

  } catch (error) {
    console.error('画像処理エラー:', error);
    throw new Error('画像の変換に失敗しました');
  }
}

/**
 * プリセットを使用して画像を処理する
 * @param inputBuffer 入力画像のBuffer
 * @param presetName プリセット名
 * @returns 変換された画像の情報
 */
export async function processImageWithPreset(
  inputBuffer: Buffer,
  presetName: keyof typeof IMAGE_PRESETS
): Promise<ProcessedImageResult> {
  const config = IMAGE_PRESETS[presetName];
  return processImage(inputBuffer, config);
}

/**
 * ファイル名を生成する（拡張子は自動で変換される）
 * @param userId ユーザーID
 * @param prefix ファイル名のプレフィックス
 * @param outputFormat 出力形式
 * @returns 生成されたファイル名
 */
export function generateImageFileName(
  userId: string,
  prefix: string,
  outputFormat: string
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  let extension = 'webp';
  if (outputFormat === 'image/jpeg') extension = 'jpg';
  if (outputFormat === 'image/png') extension = 'png';
  
  return `${prefix}-${userId}-${timestamp}-${randomSuffix}.${extension}`;
}