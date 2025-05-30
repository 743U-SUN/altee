import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT?.split(':')[0] || 'localhost',
  port: parseInt(process.env.MINIO_ENDPOINT?.split(':')[1] || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'altee-uploads';

// パブリックアクセスを許可するバケットポリシー
const publicPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicRead',
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
    },
  ],
};

async function setupMinio() {
  try {
    console.log('MinIO セットアップを開始します...');
    
    // バケットの存在確認
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`バケット ${BUCKET_NAME} を作成します...`);
      await minioClient.makeBucket(BUCKET_NAME);
      console.log('バケットを作成しました');
    } else {
      console.log(`バケット ${BUCKET_NAME} は既に存在します`);
    }
    
    // バケットポリシーを設定（パブリック読み取りを許可）
    console.log('バケットポリシーを設定します...');
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(publicPolicy));
    console.log('バケットポリシーを設定しました（パブリック読み取り可能）');
    
    // 現在のポリシーを確認
    const currentPolicy = await minioClient.getBucketPolicy(BUCKET_NAME);
    console.log('現在のバケットポリシー:', currentPolicy);
    
    console.log('✅ MinIOのセットアップが完了しました');
  } catch (error) {
    console.error('❌ MinIOのセットアップ中にエラーが発生しました:', error);
    process.exit(1);
  }
}

setupMinio();