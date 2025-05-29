/**
 * エッジランタイム環境用のPrismaクライアント設定
 * - Next.jsのミドルウェアやエッジランタイムでは制限された機能のみ使用
 */
import { PrismaClient } from '@/lib/generated/prisma';

declare global {
  var __prismaEdge: PrismaClient | undefined;
}

// エッジランタイム用のPrismaクライアント
// 接続プールやトランザクション機能は制限される
export const prismaEdge = globalThis.__prismaEdge || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaEdge = prismaEdge;
}

export { prismaEdge as db };
