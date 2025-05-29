/**
 * Amazonアフィリエイト関連ユーティリティ
 */

import { extractASIN, isAmazonUrl } from './url-parser';

/**
 * Amazon URLにアソシエイトIDを付与する
 * @param url Amazon URL
 * @param associateId アソシエイトID
 * @returns アソシエイトID付きURL
 */
export function addAssociateIdToUrl(url: string, associateId: string): string {
  if (!associateId || !isAmazonUrl(url)) {
    return url;
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // 既存のtagパラメータを削除
    parsedUrl.searchParams.delete('tag');
    
    // 新しいアソシエイトIDを追加
    parsedUrl.searchParams.set('tag', associateId);
    
    return parsedUrl.toString();
  } catch (error) {
    console.error('Failed to add associate ID:', error);
    return url;
  }
}

/**
 * URLからアソシエイトIDを抽出する
 * @param url Amazon URL
 * @returns アソシエイトIDまたはnull
 */
export function extractAssociateId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get('tag');
  } catch {
    return null;
  }
}

/**
 * アソシエイトIDを削除したクリーンなURLを生成
 * @param url Amazon URL
 * @returns クリーンなURL
 */
export function removeAssociateId(url: string): string {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.delete('tag');
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

/**
 * 短縮URLを生成（ASINベース）
 * @param asin ASIN
 * @param associateId アソシエイトID（オプション）
 * @returns 短縮URL
 */
export function generateShortUrl(asin: string, associateId?: string): string {
  let url = `https://amzn.to/${asin}`;
  
  if (associateId) {
    url = `${url}?tag=${associateId}`;
  }
  
  return url;
}

/**
 * 複数のアソシエイトIDからランダムに選択（負荷分散用）
 * @param associateIds アソシエイトIDの配列
 * @returns ランダムに選択されたアソシエイトID
 */
export function selectRandomAssociateId(associateIds: string[]): string {
  if (associateIds.length === 0) {
    throw new Error('No associate IDs provided');
  }
  
  const randomIndex = Math.floor(Math.random() * associateIds.length);
  return associateIds[randomIndex];
}

/**
 * アソシエイトIDの検証
 * @param associateId アソシエイトID
 * @returns 有効な形式の場合true
 */
export function isValidAssociateId(associateId: string): boolean {
  // Amazonアソシエイトタグは通常、英数字とハイフンで構成
  // 末尾に-22などの国コードが付く
  const pattern = /^[a-zA-Z0-9\-]+$/;
  return pattern.test(associateId) && associateId.length <= 20;
}
