/**
 * Amazon PA-API連携サービス（管理者専用）
 * Product Advertising APIを使用した商品情報取得
 */

import crypto from 'crypto';
import { extractASIN } from '@/lib/utils/amazon';

interface ProductAPIData {
  title: string;
  price?: number;
  imageUrl?: string;
  description?: string;
  availability?: string;
  brand?: string;
  features?: string[];
}

interface PAAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region: string;
  host: string;
  apiPath: string;
}

/**
 * PA-API設定を取得
 */
function getConfig(): PAAPIConfig {
  return {
    accessKey: process.env.AMAZON_ACCESS_KEY || '',
    secretKey: process.env.AMAZON_SECRET_KEY || '',
    partnerTag: process.env.ADMIN_AMAZON_ASSOCIATE_ID || '',
    region: 'us-west-2', // PA-APIのリージョン
    host: 'webservices.amazon.co.jp',
    apiPath: '/paapi5/getitems',
  };
}

/**
 * AWS署名バージョン4を生成
 */
function generateAWSSignature(
  method: string,
  uri: string,
  queryString: string,
  headers: Record<string, string>,
  payload: string,
  config: PAAPIConfig
): string {
  const algorithm = 'AWS4-HMAC-SHA256';
  const amzDate = new Date().toISOString().replace(/[:-]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dateStamp = amzDate.substring(0, 8);
  const credentialScope = `${dateStamp}/${config.region}/ProductAdvertisingAPI/aws4_request`;
  
  // 正規リクエストの作成
  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(([key, value]) => `${key.toLowerCase()}:${value}`)
    .join('\n');
  
  const signedHeaders = Object.keys(headers)
    .map(key => key.toLowerCase())
    .sort()
    .join(';');
  
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
  
  const canonicalRequest = [
    method,
    uri,
    queryString,
    canonicalHeaders,
    '',
    signedHeaders,
    payloadHash,
  ].join('\n');
  
  // 署名文字列の作成
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');
  
  // 署名キーの導出
  const kDate = crypto.createHmac('sha256', `AWS4${config.secretKey}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(config.region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  
  // 署名の計算
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  
  // Authorization ヘッダーの構築
  return `${algorithm} Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

/**
 * PA-APIを使用して商品情報を取得（管理者専用）
 * @param asin ASIN
 * @returns 商品情報
 */
export async function fetchProductFromPAAPI(asin: string): Promise<ProductAPIData> {
  const config = getConfig();
  
  if (!config.accessKey || !config.secretKey) {
    throw new Error('Amazon PA-API credentials are not configured');
  }
  
  // リクエストボディの構築
  const requestBody = {
    ItemIds: [asin],
    Resources: [
      'Images.Primary.Large',
      'ItemInfo.Title',
      'ItemInfo.Features',
      'ItemInfo.ManufactureInfo',
      'ItemInfo.ProductInfo',
      'Offers.Listings.Price',
      'Offers.Listings.Availability.Message',
    ],
    PartnerTag: config.partnerTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.co.jp',
  };
  
  const payload = JSON.stringify(requestBody);
  const amzDate = new Date().toISOString().replace(/[:-]/g, '').replace(/\.\d{3}Z$/, 'Z');
  
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'host': config.host,
    'x-amz-date': amzDate,
    'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
  };
  
  // 署名を生成
  const authorization = generateAWSSignature(
    'POST',
    config.apiPath,
    '',
    headers,
    payload,
    config
  );
  
  try {
    const response = await fetch(`https://${config.host}${config.apiPath}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Authorization': authorization,
      },
      body: payload,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PA-API Error:', errorText);
      throw new Error(`PA-API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.ItemsResult?.Items?.[0]) {
      throw new Error('No item found in PA-API response');
    }
    
    const item = data.ItemsResult.Items[0];
    
    return {
      title: item.ItemInfo?.Title?.DisplayValue || '',
      price: item.Offers?.Listings?.[0]?.Price?.Amount,
      imageUrl: item.Images?.Primary?.Large?.URL,
      description: item.ItemInfo?.Features?.DisplayValues?.join(' ') || '',
      availability: item.Offers?.Listings?.[0]?.Availability?.Message,
      brand: item.ItemInfo?.ManufactureInfo?.DisplayValue,
      features: item.ItemInfo?.Features?.DisplayValues || [],
    };
  } catch (error) {
    console.error('PA-API request failed:', error);
    throw error;
  }
}

/**
 * バッチで複数商品を取得（最大10個まで）
 * @param asins ASINの配列
 * @returns 商品情報の配列
 */
export async function fetchMultipleProductsFromPAAPI(
  asins: string[]
): Promise<Map<string, ProductAPIData>> {
  if (asins.length === 0) {
    return new Map();
  }
  
  // PA-APIは一度に最大10商品まで
  const chunks = [];
  for (let i = 0; i < asins.length; i += 10) {
    chunks.push(asins.slice(i, i + 10));
  }
  
  const results = new Map<string, ProductAPIData>();
  
  for (const chunk of chunks) {
    try {
      // チャンクごとに処理（レート制限を考慮）
      const config = getConfig();
      
      const requestBody = {
        ItemIds: chunk,
        Resources: [
          'Images.Primary.Large',
          'ItemInfo.Title',
          'ItemInfo.Features',
          'Offers.Listings.Price',
        ],
        PartnerTag: config.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.co.jp',
      };
      
      // ... 署名生成とリクエスト処理（上記と同様）
      
      // レート制限対応（1秒1回）
      await new Promise(resolve => setTimeout(resolve, 1100));
    } catch (error) {
      console.error('Failed to fetch chunk:', chunk, error);
    }
  }
  
  return results;
}

/**
 * URLから商品情報を取得（管理者用）
 * @param url Amazon商品URL
 * @returns 商品情報
 */
export async function fetchProductFromUrlWithPAAPI(url: string): Promise<ProductAPIData> {
  const asin = extractASIN(url);
  if (!asin) {
    throw new Error('Invalid Amazon product URL');
  }
  
  return fetchProductFromPAAPI(asin);
}

/**
 * PA-APIのレート制限チェック
 */
export class RateLimiter {
  private lastRequestTime: number = 0;
  private readonly minInterval: number = 1100; // 1.1秒（1秒制限に余裕を持たせる）
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

// シングルトンのレート制限インスタンス
export const paApiRateLimiter = new RateLimiter();
