import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";
import { prisma } from "./prisma";

// 既存のユーティリティ関数があればそれらを維持
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ユニークなハンドルを生成する関数
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
