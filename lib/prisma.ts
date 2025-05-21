/**
 * Prismaクライアントのシングルトンパターン実装
 * - アプリケーション全体で1つのインスタンスだけを使用する
 * - パフォーマンスと接続管理のためのベストプラクティス
 */
import { PrismaClient } from '../lib/generated/prisma';
// グローバル変数用の型定義
declare global {
  var prisma: PrismaClient | undefined;
}
// 既存のインスタンスがあればそれを使用し、なければ新しいインスタンスを作成
export const prisma = global.prisma || new PrismaClient();
// 開発環境でのホットリロード対策（本番環境では実行されない）
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
