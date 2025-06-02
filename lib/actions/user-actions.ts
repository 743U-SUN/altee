/**
 * ユーザー認証・プロフィール関連のサーバーアクション
 * エッジランタイムを回避してデータベース操作を実行
 */
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { containsDangerousPatterns } from '@/lib/security/sanitize';
import { validateRichTextCharacters, hasConsecutiveSymbols, sanitizeRichTextInput } from '@/lib/validation/textValidation';
import { validateHandle } from '@/lib/validation/handleValidation';

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

// サーバーサイドのサニタイゼーション関数（名前用）
const sanitizeNameInput = (input: string): string => {
  return input
    .trim() // 前後の空白を削除
    .replace(/[<>]/g, '') // HTMLタグ文字を削除
    .replace(/[^\p{L}\p{N}\s\-_。、！？]/gu, '') // 許可された文字のみ残す
    .replace(/\s+/g, ' ') // 連続した空白を単一の空白に
    .slice(0, 50) // 長さ制限を強制
}

// サーバーサイドバリデーションスキーマ（より厳密）
const profileUpdateSchema = z.object({
  characterName: z
    .string()
    .min(1, "キャラクター名は必須です")
    .max(50, "キャラクター名は50文字以内で入力してください")
    .regex(/^[^\<\>]*$/, "不正な文字が含まれています")
    .regex(/^(?!.*<script).*$/i, "スクリプトタグは使用できません")
    .regex(/^(?!.*javascript:).*$/i, "JavaScriptコードは使用できません")
    .regex(/^(?!.*data:).*$/i, "データURLは使用できません")
    .regex(/^(?!.*vbscript:).*$/i, "VBScriptは使用できません")
    .refine((val) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
    .transform(sanitizeNameInput)
    .refine((val) => val.length > 0, "有効な文字を入力してください")
    .optional(),
  subname: z
    .string()
    .max(50, "サブネームは50文字以内で入力してください")
    .regex(/^[^\<\>]*$/, "不正な文字が含まれています")
    .regex(/^(?!.*<script).*$/i, "スクリプトタグは使用できません")
    .regex(/^(?!.*javascript:).*$/i, "JavaScriptコードは使用できません")
    .regex(/^(?!.*data:).*$/i, "データURLは使用できません")
    .regex(/^(?!.*vbscript:).*$/i, "VBScriptは使用できません")
    .refine((val) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
    .transform(sanitizeNameInput)
    .optional(),
  bio: z
    .string()
    .max(1000, "自己紹介文は1000文字以内で入力してください")
    .regex(/^[^\<\>]*$/s, "不正な文字が含まれています")
    .regex(/^(?!.*<script).*$/is, "スクリプトタグは使用できません")
    .regex(/^(?!.*javascript:).*$/is, "JavaScriptコードは使用できません")
    .regex(/^(?!.*data:).*$/is, "データURLは使用できません")
    .regex(/^(?!.*vbscript:).*$/is, "VBScriptは使用できません")
    .refine((val) => !containsDangerousPatterns(val), "危険なパターンが検出されました")
    // カスタム文字チェック関数を使用（クライアントと同じアプローチ）
    .refine((val) => validateRichTextCharacters(val), "使用できない文字が含まれています。日本語文字、英数字、記号（: , \" / ? ! @ # $ % & * ( ) + = [ ] { } | \\ ` ~ など）が使用可能です")
    .refine((val) => !hasConsecutiveSymbols(val, 5), "記号を5つ以上連続して使用することはできません")
    .transform(sanitizeRichTextInput)
    .optional(),
})

/**
 * ユーザープロフィールを取得（Server Action版）
 */
export async function getUserProfile() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        characterName: true,
        subname: true,
        bio: true,
      },
    });
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }
    
    return { success: true, data: user };
  } catch (error) {
    console.error('プロファイル取得エラー:', error);
    return { success: false, error: 'サーバーエラーが発生しました' };
  }
}

/**
 * ユーザープロフィールを更新（Server Action版）
 */
export async function updateUserProfileData(data: {
  characterName?: string;
  subname?: string;
  bio?: string;
}) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }
    
    // リクエストボディの検証
    const validationResult = profileUpdateSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("バリデーションエラー:", validationResult.error.format());
      return { 
        success: false, 
        error: '入力データが無効です', 
        details: validationResult.error.format() 
      };
    }
    
    const validatedData = validationResult.data;
    
    // 空のオブジェクトを送信された場合の対策（空文字列の更新は許可）
    if (validatedData.characterName === undefined && validatedData.subname === undefined && validatedData.bio === undefined) {
      return { success: false, error: '更新するデータがありません' };
    }
    
    // データベース更新（Prismaの型安全性により、SQLインジェクションは防がれる）
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(validatedData.characterName !== undefined && { characterName: validatedData.characterName }),
        ...(validatedData.subname !== undefined && { subname: validatedData.subname }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        characterName: true,
        subname: true,
        bio: true,
      },
    });
    
    revalidatePath('/user/profile');
    revalidatePath(`/${updatedUser.id}`); // ユーザーページのキャッシュも更新
    
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("プロファイル更新エラー:", error);
    
    // Prismaエラーの場合
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return { success: false, error: 'その名前は既に使用されています' };
    }
    
    return { success: false, error: 'サーバーエラーが発生しました' };
  }
}

/**
 * ハンドル可用性チェック（Server Action版）
 */
export async function checkHandleAvailability(handle: string) {
  try {
    if (!handle) {
      return { success: false, error: 'ハンドルが指定されていません', available: false };
    }

    // バリデーションチェック
    const validation = validateHandle(handle);
    if (!validation.isValid) {
      return { success: false, error: validation.message, available: false };
    }

    // データベースで重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { handle },
      select: { id: true }
    });

    const available = !existingUser;

    return {
      success: true,
      available,
      message: available ? "使用可能です" : "このハンドルは既に使用されています"
    };

  } catch (error) {
    console.error("Handle check error:", error);
    return { 
      success: false, 
      error: 'ハンドルの確認中にエラーが発生しました', 
      available: false 
    };
  }
}

/**
 * ハンドル更新（Server Action版）
 */
export async function updateUserHandle(handle: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return { success: false, error: '認証が必要です' };
    }

    // バリデーションチェック
    const validation = validateHandle(handle);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    // 重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { handle },
      select: { id: true }
    });

    if (existingUser) {
      return { success: false, error: 'このハンドルは既に使用されています' };
    }

    // 現在のユーザー情報を取得
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, handleChangeTokens: true }
    });

    if (!currentUser) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }

    // トークンチェック
    if (currentUser.handleChangeTokens <= 0) {
      return { success: false, error: 'ハンドル変更の回数制限に達しています' };
    }

    // ハンドル更新
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        handle,
        handleChangeTokens: { decrement: 1 },
        handleChangeCount: { increment: 1 }
      },
      select: {
        id: true,
        handle: true,
        handleChangeTokens: true,
        handleChangeCount: true
      }
    });

    revalidatePath('/user/profile');
    revalidatePath(`/${updatedUser.handle}`); // 新しいハンドルのページキャッシュも更新

    return { 
      success: true, 
      data: updatedUser,
      message: 'ハンドルを更新しました'
    };

  } catch (error) {
    console.error("Handle update error:", error);
    return { success: false, error: 'ハンドルの更新中にエラーが発生しました' };
  }
}