/**
 * サーバーサイド専用のユーティリティ関数
 * このファイルはサーバーサイドでのみ使用されることを前提としています
 */

import slugify from "slugify";
import { prisma } from "@/lib/prisma";

/**
 * ユニークなハンドルを生成する関数
 * @param baseName 基となる名前
 * @returns ユニークなハンドル
 */
export async function generateUniqueHandle(baseName: string): Promise<string> {
  let handle = slugify(baseName, { lower: true, strict: true });
  
  // 既に同じハンドルが存在するか確認
  const existingUser = await prisma.user.findUnique({
    where: { handle },
  });
  
  // 既存のハンドルが見つかった場合、ランダムな数字を追加
  if (existingUser) {
    const randomSuffix = Math.floor(Math.random() * 10000);
    handle = `${handle}${randomSuffix}`;
    
    // 再度チェック（万が一の重複を避けるため）
    return generateUniqueHandle(handle);
  }
  
  return handle;
}
