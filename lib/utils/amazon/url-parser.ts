/**
 * Amazon URL解析・ASIN抽出ユーティリティ
 */

/**
 * Amazon URLからASINを抽出する
 * @param url Amazon商品URL
 * @returns ASIN（10文字の英数字）またはnull
 */
export function extractASIN(url: string): string | null {
  try {
    // URLオブジェクトを作成
    const parsedUrl = new URL(url);
    
    // Amazonドメインかチェック
    if (!parsedUrl.hostname.includes('amazon')) {
      return null;
    }
    
    // パスからASINを抽出
    // パターン1: /dp/ASIN
    // パターン2: /gp/product/ASIN
    // パターン3: /exec/obidos/ASIN/ASIN
    const patterns = [
      /\/dp\/([A-Z0-9]{10})/i,
      /\/gp\/product\/([A-Z0-9]{10})/i,
      /\/exec\/obidos\/ASIN\/([A-Z0-9]{10})/i,
      /\/o\/ASIN\/([A-Z0-9]{10})/i,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1].toUpperCase();
      }
    }
    
    // クエリパラメータからもチェック
    const asinParam = parsedUrl.searchParams.get('ASIN');
    if (asinParam && /^[A-Z0-9]{10}$/i.test(asinParam)) {
      return asinParam.toUpperCase();
    }
    
    return null;
  } catch (error) {
    console.error('Failed to extract ASIN:', error);
    return null;
  }
}

/**
 * URLがAmazonのURLかどうかを判定
 * @param url チェックするURL
 * @returns Amazonドメインの場合true
 */
export function isAmazonUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const amazonDomains = [
      'amazon.co.jp',
      'amazon.com',
      'amazon.jp',
      'amzn.to', // 短縮URL
      'amzn.asia',
    ];
    
    return amazonDomains.some(domain => 
      parsedUrl.hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

/**
 * Amazon URLを正規化する（トラッキングパラメータを削除）
 * @param url Amazon URL
 * @returns 正規化されたURL
 */
export function normalizeAmazonUrl(url: string): string {
  try {
    const asin = extractASIN(url);
    if (!asin) {
      return url;
    }
    
    // シンプルな形式に正規化
    return `https://www.amazon.co.jp/dp/${asin}`;
  } catch {
    return url;
  }
}

/**
 * ASINからAmazon商品URLを生成
 * @param asin ASIN
 * @returns Amazon商品URL
 */
export function generateAmazonUrl(asin: string): string {
  return `https://www.amazon.co.jp/dp/${asin}`;
}

/**
 * URLからカテゴリを推測する（タイトルベース）
 * @param title 商品タイトル
 * @returns 推測されたカテゴリslug
 */
export function detectCategoryFromTitle(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  // マウス関連のキーワード
  const mouseKeywords = [
    'mouse', 'マウス', 'mice', 'ゲーミングマウス',
    'gaming mouse', 'wireless mouse', 'ワイヤレスマウス'
  ];
  
  // キーボード関連のキーワード
  const keyboardKeywords = [
    'keyboard', 'キーボード', 'ゲーミングキーボード',
    'gaming keyboard', 'mechanical keyboard', 'メカニカルキーボード',
    'tkl', 'テンキーレス'
  ];
  
  if (mouseKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'mouse';
  }
  
  if (keyboardKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'keyboard';
  }
  
  // デフォルトはマウス（後で変更可能）
  return 'mouse';
}
