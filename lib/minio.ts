import { Client } from 'minio';

// MinIOクライアントの設定
const minioEndpoint = process.env.MINIO_ENDPOINT?.split(':')[0] || 'localhost';
const minioPort = parseInt(process.env.MINIO_ENDPOINT?.split(':')[1] || '9000');
const minioAccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const minioSecretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
const minioUseSSL = process.env.MINIO_USE_SSL === 'true';

console.log('MinIO Client 設定:', {
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: minioUseSSL,
  accessKey: minioAccessKey ? '設定済み' : '未設定',
  secretKey: minioSecretKey ? '設定済み' : '未設定'
});

export const minioClient = new Client({
  endPoint: minioEndpoint,
  port: minioPort,
  useSSL: minioUseSSL,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});

// バケット名
export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'altee-uploads';

// ファイルアップロード用のユーティリティ関数
export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string,
  folder: string = 'icons'
): Promise<string> {
  console.log('=== uploadFile関数開始 ===');
  console.log('パラメータ:', { fileName, contentType, folder, bufferSize: fileBuffer.length });
  
  try {
    // バケットが存在するかチェック
    console.log('バケットチェック:', BUCKET_NAME);
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    console.log('バケット存在:', bucketExists);
    
    if (!bucketExists) {
      console.log('バケット作成中...');
      await minioClient.makeBucket(BUCKET_NAME);
      console.log('バケット作成成功');
    }

    // ファイルパスを作成 (例: icons/user-123/avatar.jpg)
    const objectName = `${folder}/${fileName}`;

    // ファイルをアップロード
    const metaData = {
      'Content-Type': contentType,
    };
    
    await minioClient.putObject(BUCKET_NAME, objectName, fileBuffer, fileBuffer.length, metaData);

    // 公開URLを返す（開発環境ではlocalhost、本番環境では適切なエンドポイント）
    const publicEndpoint = process.env.NODE_ENV === 'development' 
      ? 'localhost:9000' 
      : process.env.MINIO_ENDPOINT;
    return `http://${publicEndpoint}/${BUCKET_NAME}/${objectName}`;
  } catch (error) {
    console.error('MinIO upload error:', error);
    throw new Error('ファイルのアップロードに失敗しました');
  }
}

// ファイル削除用のユーティリティ関数
export async function deleteFile(objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName);
  } catch (error) {
    console.error('MinIO delete error:', error);
    throw new Error('ファイルの削除に失敗しました');
  }
}

// プリサインドURL生成（一時的なアクセスURL）
export async function getPresignedUrl(
  objectName: string,
  expiry: number = 7 * 24 * 60 * 60 // 7日間
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expiry);
  } catch (error) {
    console.error('MinIO presigned URL error:', error);
    throw new Error('プリサインドURLの生成に失敗しました');
  }
}