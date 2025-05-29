/**
 * OGメタデータ取得サービス（ユーザー用）
 * PA-APIを使用せず、OGメタデータとページ情報から商品情報を取得
 */

import { extractASIN, normalizeAmazonUrl, detectCategoryFromTitle } from '@/lib/utils/amazon';
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
    
    ogData.image = imageUrl;
    
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
  // URLを正規化
  const normalizedUrl = normalizeAmazonUrl(url);
  
  // ASINを抽出
  const asin = extractASIN(normalizedUrl);
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
      ?.replace(/\s*[\|｜]\s*Amazon.*$/, '')
      ?.replace(/【.*?】/g, '')
      ?.trim() || 'Amazon商品';
    
    return {
      title: cleanTitle,
      description: ogData.description,
      imageUrl: ogData.image || '/images/no-image.svg',
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
 * @returns 推測された属性
 */
export async function extractAttributes(
  productInfo: OGProductInfo, 
  category?: string
): Promise<Record<string, any>> {
  const attributes: Record<string, any> = {};
  const title = productInfo.title.toLowerCase();
  const description = (productInfo.description || '').toLowerCase();
  const combined = `${title} ${description}`;
  
  // カテゴリを自動検出
  const detectedCategory = category || detectCategoryFromTitle(title);
  
  if (detectedCategory === 'mouse') {
    // DPI情報の抽出
    const dpiMatch = combined.match(/(\d+)\s*dpi/i);
    if (dpiMatch) {
      attributes.dpi_max = parseInt(dpiMatch[1]);
    }
    
    // 重量情報の抽出
    const weightMatch = combined.match(/(\d+)\s*g(?:ram)?/i);
    if (weightMatch) {
      attributes.weight = parseInt(weightMatch[1]);
    }
    
    // 接続方式
    if (combined.includes('wireless') || combined.includes('ワイヤレス')) {
      attributes.connection_type = 'wireless';
    } else if (combined.includes('wired') || combined.includes('有線')) {
      attributes.connection_type = 'wired';
    }
    
    // ボタン数
    const buttonMatch = combined.match(/(\d+)\s*(?:button|ボタン)/i);
    if (buttonMatch) {
      attributes.buttons = parseInt(buttonMatch[1]);
    }
  } else if (detectedCategory === 'keyboard') {
    // レイアウト
    if (combined.includes('60%') || combined.includes('60％')) {
      attributes.layout = '60';
    } else if (combined.includes('65%') || combined.includes('65％')) {
      attributes.layout = '65';
    } else if (combined.includes('tkl') || combined.includes('テンキーレス')) {
      attributes.layout = 'tkl';
    } else if (combined.includes('full') || combined.includes('フルサイズ')) {
      attributes.layout = 'full';
    }
    
    // スイッチタイプ
    if (combined.includes('mechanical') || combined.includes('メカニカル')) {
      attributes.switch_type = 'mechanical';
    } else if (combined.includes('magnetic') || combined.includes('磁気')) {
      attributes.switch_type = 'magnetic';
    } else if (combined.includes('optical') || combined.includes('光学')) {
      attributes.switch_type = 'optical';
    }
    
    // Rapid Trigger
    if (combined.includes('rapid trigger') || combined.includes('ラピッドトリガー')) {
      attributes.rapid_trigger = true;
    }
    
    // 接続方式
    if (combined.includes('wireless') || combined.includes('ワイヤレス')) {
      attributes.connection_type = 'wireless';
    } else if (combined.includes('wired') || combined.includes('有線')) {
      attributes.connection_type = 'wired';
    }
  }
  
  return attributes;
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
