import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile, deleteFile } from '@/lib/minio';
import { prisma } from '@/lib/prisma';

// ファイルサイズ制限（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 許可する画像形式
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

export async function POST(request: NextRequest) {
  console.log('=== アップロードAPI開始 ===');
  try {
    // 認証チェック
    console.log('認証チェック開始');
    const session = await auth();
    console.log('セッション情報:', session?.user?.id ? 'ログイン済み' : '未ログイン');
    
    if (!session?.user?.id) {
      console.log('認証エラー: セッションまたはユーザーIDがありません');
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    console.log('FormData取得開始');
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
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが選択されていません' },
        { status: 400 }
      );
    }

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // ファイル形式チェック
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '対応していないファイル形式です' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズは5MB以下にしてください' },
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
        // 既存の画像ファイルを削除（MinIOから）
        const oldFileName = existingUser.iconUrl.split('/').pop();
        if (oldFileName) {
          await deleteFile(`icons/${oldFileName}`);
        }
      } catch (error) {
        console.warn('既存ファイルの削除に失敗:', error);
        // 既存ファイルの削除に失敗しても継続
      }
    }

    // ファイルをBufferに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ファイル名を生成（ユニークになるようにタイムスタンプを追加）
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `user-${userId}-${timestamp}.${extension}`;

    // MinIOへのアップロード
    console.log('MinIOアップロード開始');
    console.log('MinIO設定:', {
      endpoint: process.env.MINIO_ENDPOINT,
      accessKey: process.env.MINIO_ACCESS_KEY ? '設定済み' : '未設定',
      bucketName: process.env.MINIO_BUCKET_NAME
    });
    const fileUrl = await uploadFile(fileName, buffer, file.type, 'icons');
    console.log('アップロード成功:', fileUrl);

    // データベースを更新
    await prisma.user.update({
      where: { id: userId },
      data: { iconUrl: fileUrl }
    });

    return NextResponse.json({
      url: fileUrl,
      message: 'アップロードが完了しました'
    });

  } catch (error) {
    console.error('=== アップロードAPIエラー ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 認証チェック
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

    // 現在の画像URLを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { iconUrl: true }
    });

    if (user?.iconUrl) {
      try {
        // MinIOから画像ファイルを削除
        const fileName = user.iconUrl.split('/').pop();
        if (fileName) {
          await deleteFile(`icons/${fileName}`);
        }
      } catch (error) {
        console.warn('ファイル削除エラー:', error);
        // ファイル削除に失敗してもDBからは削除する
      }
    }

    // データベースから画像URLを削除
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