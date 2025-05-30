/**
 * OGメタデータ取得サービス（ユーザー用）
 * PA-APIを使用せず、OGメタデータとページ情報から商品情報を取得
 */

import { extractASIN, normalizeAmazonUrl, detectCategoryFromTitle, expandShortenedUrl } from '@/lib/utils/amazon';
import { cacheImageToMinio } from '@/lib/services/image-cache';
import type { OGProductInfo } from '@/types/device';

/**
 * OGメタデータを取得する
 * @param url 対象URL
 * @returns OGメタデータ
 */
async function fetchOGMetadata(url: string): Promise<{
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}> {
  try {
    // サーバーサイドでfetchを実行
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // OGメタデータを抽出（簡易的なパーサー）
    const ogData: Record<string, string> = {};
    
    // og:title
    const titleMatch = html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:title"/i);
    if (titleMatch) ogData.title = titleMatch[1];
    
    // og:description
    const descMatch = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i) ||
                     html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:description"/i);
    if (descMatch) ogData.description = descMatch[1];
    
    // 画像取得（複数のパターンを試行）
    let imageUrl = null;
    
    // 1. og:imageを最優先で取得
    const imageMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
    if (imageMatch) {
      imageUrl = imageMatch[1];
    }
    
    // 2. Amazonメイン画像を直接抽出（og:imageがない場合）
    if (!imageUrl) {
      // Amazonのメイン画像パターン
      const amazonImagePatterns = [
        // メイン商品画像のパターン
        /data-src="(https:\/\/[\w\-\.]+\.(?:media-)?amazon\.com\/images\/[^"]+)"[^>]*id="landingImage"/i,
        /src="(https:\/\/[\w\-\.]+\.(?:media-)?amazon\.com\/images\/[^"]+)"[^>]*id="landingImage"/i,
        // 一般的な商品画像パターン
        /src="(https:\/\/[\w\-\.]+\.(?:media-)?amazon\.com\/images\/I\/[^"]+\._[^"]*\.(jpg|jpeg|png|webp)[^"]*)"/i,
        // Amazon CDN画像
        /data-src="(https:\/\/[\w\-\.]+\.ssl-images-amazon\.com\/images\/[^"]+)"/i,
        /src="(https:\/\/[\w\-\.]+\.ssl-images-amazon\.com\/images\/[^"]+)"/i,
      ];
      
      for (const pattern of amazonImagePatterns) {
        const match = html.match(pattern);
        if (match) {
          imageUrl = match[1];
          break;
        }
      }
    }
    
    // 3. 一般的なメタタグからも探す
    if (!imageUrl) {
      const metaImagePatterns = [
        /<meta\s+name="twitter:image"\s+content="([^"]+)"/i,
        /<meta\s+content="([^"]+)"\s+name="twitter:image"/i,
        /<link\s+rel="image_src"\s+href="([^"]+)"/i,
      ];
      
      for (const pattern of metaImagePatterns) {
        const match = html.match(pattern);
        if (match) {
          imageUrl = match[1];
          break;
        }
      }
    }
    
    ogData.image = imageUrl || '';
    
    // タイトルタグからも取得（OGがない場合のフォールバック）
    if (!ogData.title) {
      const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleTagMatch) ogData.title = titleTagMatch[1];
    }
    
    return {
      title: ogData.title,
      description: ogData.description,
      image: ogData.image,
      url: url,
    };
  } catch (error) {
    console.error('Failed to fetch OG metadata:', error);
    throw error;
  }
}

/**
 * 価格情報を抽出する（簡易スクレイピング）
 * @param html HTMLコンテンツ
 * @returns 価格情報
 */
function extractPriceFromHTML(html: string): string | undefined {
  // 価格パターンのマッチング（Amazon.co.jp用）
  const pricePatterns = [
    /class="a-price-whole">([0-9,]+)</,
    /class="a-price-range"[^>]*>[^¥]*¥([0-9,]+)/,
    /class="a-price"[^>]*>[^¥]*¥([0-9,]+)/,
    /¥([0-9,]+)(?:\s|<)/,
  ];
  
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      // カンマを除去して返す
      return match[1].replace(/,/g, '');
    }
  }
  
  return undefined;
}

/**
 * Amazon商品情報を取得（ユーザー用、OGメタデータベース）
 * @param url Amazon商品URL
 * @returns 商品情報
 */
export async function fetchProductFromAmazonUrl(url: string): Promise<OGProductInfo> {
  console.log('fetchProductFromAmazonUrl called with:', url);
  
  // 最初に短縮URLを展開
  const expandedUrl = await expandShortenedUrl(url);
  console.log('Expanded URL:', expandedUrl);
  
  // URLを正規化
  const normalizedUrl = await normalizeAmazonUrl(expandedUrl);
  console.log('Normalized URL:', normalizedUrl);
  
  // ASINを抽出
  const asin = await extractASIN(expandedUrl);
  console.log('Extracted ASIN:', asin);
  
  if (!asin) {
    throw new Error('有効なAmazon商品URLではありません');
  }
  
  try {
    // OGメタデータを取得
    const ogData = await fetchOGMetadata(normalizedUrl);
    
    // 簡易的な価格取得（必要に応じて）
    let price: string | undefined;
    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const html = await response.text();
      price = extractPriceFromHTML(html);
    } catch (error) {
      // 価格取得の失敗は無視
    }
    
    // タイトルのクリーンアップ（Amazonサイト名を除去）
    const cleanTitle = ogData.title
      ?.replace(/^Amazon\.co\.jp[\s:：]+/, '') // 先頭の「Amazon.co.jp: 」を除去
      ?.replace(/^Amazon\.com[\s:：]+/, '') // 先頭の「Amazon.com: 」を除去
      ?.replace(/\s*[\|｜]\s*Amazon.*$/, '') // 末尾のAmazon関連テキストを除去
      ?.trim() || 'Amazon商品';
    
    // 画像をMinIOにキャッシュ
    let cachedImageUrl = ogData.image || '/images/no-image.svg';
    if (ogData.image && !ogData.image.startsWith('/')) {
      try {
        cachedImageUrl = await cacheImageToMinio(ogData.image);
      } catch (error) {
        console.error('Failed to cache image, using original URL:', error);
        // エラー時は元のURLをそのまま使用
      }
    }
    
    return {
      title: cleanTitle,
      description: ogData.description,
      imageUrl: cachedImageUrl,
      price: price,
      asin: asin,
    };
  } catch (error) {
    console.error('Failed to fetch product info:', error);
    
    // エラー時でも最低限の情報を返す
    return {
      title: 'Amazon商品',
      imageUrl: '/images/no-image.svg',
      asin: asin,
    };
  }
}

/**
 * 商品属性を推測する（タイトルベース）
 * @param productInfo 商品情報
 * @param category カテゴリ
 * @returns 推測された属性（空のオブジェクトを返す）
 */
export async function extractAttributes(
  productInfo: OGProductInfo, 
  category?: string
): Promise<Record<string, any>> {
  // 自動属性検出は精度が低いため無効化
  return {};
}

/**
 * キャッシュ付きfetch関数（開発用）
 */
const cachedFetch = (() => {
  const cache = new Map<string, { data: any; timestamp: number }>();
  const CACHE_DURATION = 1000 * 60 * 60; // 1時間
  
  return async (url: string): Promise<OGProductInfo> => {
    const now = Date.now();
    const cached = cache.get(url);
    
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const data = await fetchProductFromAmazonUrl(url);
    cache.set(url, { data, timestamp: now });
    
    // キャッシュサイズ制限
    if (cache.size > 100) {
      const oldestKey = Array.from(cache.keys())[0];
      cache.delete(oldestKey);
    }
    
    return data;
  };
})();

// 開発環境ではキャッシュを使用
export const fetchProductInfo = process.env.NODE_ENV === 'development' 
  ? cachedFetch 
  : fetchProductFromAmazonUrl;
