/**
 * ユーザー認証関連のサーバーアクション
 * エッジランタイムを回避してデータベース操作を実行
 */
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * 現在認証されているユーザーの詳細情報を取得
 * セッションの情報をもとに、データベースから最新の情報を取得
 */
export async function getCurrentUserDetails() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        iconUrl: true,
        handle: true,
        role: true,
        bannerUrl: true,
        characterName: true,
        handleChangeTokens: true,
        handleChangeCount: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error in getCurrentUserDetails:', error);
    return null;
  }
}

/**
 * ユーザーが存在しない場合に作成する
 * 初回ログイン時に呼び出される
 */
export async function ensureUserExists() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      throw new Error('No authenticated user');
    }

    // 既存ユーザーをチェック
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      return user;
    }

    // ユーザーが存在しない場合は作成
    const randomString = Math.random().toString(36).substring(2, 10);
    const temporaryHandle = `temp_${randomString}`;

    user = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name,
        iconUrl: session.user.image,
        handle: temporaryHandle,
        role: 'user',
        handleChangeTokens: 1,
        handleChangeCount: 0,
      },
    });

    return user;
  } catch (error) {
    console.error('Error in ensureUserExists:', error);
    throw error;
  }
}

/**
 * ユーザー情報を更新
 */
export async function updateUserProfile(data: {
  name?: string;
  iconUrl?: string;
  bannerUrl?: string;
  characterName?: string;
  bio?: string;
}) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      throw new Error('No authenticated user');
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data,
    });

    return user;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}