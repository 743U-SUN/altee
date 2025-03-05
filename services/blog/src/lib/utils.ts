import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSのクラス名をマージするためのユーティリティ関数
 * clsxでクラス名を組み合わせた後、tailwind-mergeで重複を解決
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * スラッグ生成用の関数
 * 日本語や特殊文字を含むタイトルからURLフレンドリーなスラッグを生成
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * タイトルからスラッグを生成する関数
 * 既存のスラッグがある場合はそれを優先
 */
export function generateSlug(title: string, existingSlug?: string | null): string {
  if (existingSlug) return existingSlug;
  return slugify(title);
}

/**
 * 指定された長さで文字列を切り詰める関数
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * 抜粋（excerpt）を生成する関数
 * コンテンツからHTMLタグを除去し、指定された長さに切り詰める
 */
export function generateExcerpt(content: string, length: number = 160): string {
  // HTMLタグを除去
  const textOnly = content.replace(/<[^>]*>?/gm, '');
  return truncate(textOnly, length);
}

/**
 * 読了時間を計算する関数
 * @param content 記事の内容
 * @param wordsPerMinute 1分あたりの読語数
 * @returns 読了時間（分）
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): number {
  const textOnly = content.replace(/<[^>]*>?/gm, '');
  const words = textOnly.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * ランダムなIDを生成する関数
 */
export function generateId(length: number = 7): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * URLが有効かどうかを検証する関数
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * ページネーションに使用する範囲を計算する関数
 */
export function getPageRange(currentPage: number, totalPages: number, maxPageLinks: number = 5): number[] {
  // 表示するページ番号の個数が総ページ数より多い場合は全ページ表示
  if (totalPages <= maxPageLinks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // 表示するページ番号の範囲を決定
  const halfMaxLinks = Math.floor(maxPageLinks / 2);
  let startPage = Math.max(currentPage - halfMaxLinks, 1);
  let endPage = startPage + maxPageLinks - 1;

  // 計算したendPageが総ページ数を超える場合の調整
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPageLinks + 1, 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
}