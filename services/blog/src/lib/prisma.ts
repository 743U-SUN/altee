import { PrismaClient } from "@prisma/client";

// PrismaClientのグローバルインスタンスを管理
declare global {
  var prisma: PrismaClient | undefined;
}

// 開発モードでのホットリロード時に複数のPrismaClientインスタンスが
// 作成されるのを防ぐため、グローバル変数にキャッシュする
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}