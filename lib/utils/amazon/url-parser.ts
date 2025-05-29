/**
 * Amazon URL解析・ASIN抽出ユーティリティ
 */

/**
 * 短縮URLを実際のURLに展開する（複数回リダイレクト対応）
 * @param url 短縮URL（amzn.toなど）
 * @param maxRedirects 最大リダイレクト回数
 * @returns 展開されたURL
 */
export async function expandShortenedUrl(url: string, maxRedirects = 10): Promise<string> {
  try {
    // Amazon短縮URLかチェック
    if (!url.includes('amzn.to') && !url.includes('amzn.asia')) {
      console.log('Not a shortened URL, returning as-is:', url);
      return url;
    }
    
    let currentUrl = url;
    let redirectCount = 0;
    
    console.log('Starting URL expansion for:', url);
    
    while (redirectCount < maxRedirects) {
      console.log(`Expanding URL (attempt ${redirectCount + 1}): ${currentUrl}`);
      
      try {
        // まずGETリクエストで試行（HEADが失敗する場合があるため）
        const response = await fetch(currentUrl, {
          method: 'GET',
          redirect: 'manual', // リダイレクトを手動で処理
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
          },
        });
        
        console.log(`Response status: ${response.status}`);
        
        // リダイレクトステータスコードをチェック
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location') || response.headers.get('Location');
          if (location) {
            console.log('Found redirect location:', location);
            
            // 相対パスの場合は絶対パスに変換
            if (location.startsWith('/')) {
              const urlObj = new URL(currentUrl);
              currentUrl = urlObj.origin + location;
            } else if (location.startsWith('http')) {
              currentUrl = location;
            } else {
              // 相对パスの場合
              const urlObj = new URL(currentUrl);
              currentUrl = new URL(location, urlObj).href;
            }
            
            redirectCount++;
            
            // Amazonのメインドメインに到達したら停止
            if (currentUrl.includes('amazon.co.jp') || 
                currentUrl.includes('amazon.com') || 
                currentUrl.includes('amazon.jp')) {
              console.log(`Reached Amazon domain, final URL: ${currentUrl}`);
              return currentUrl;
            }
          } else {
            console.log('No location header found, stopping');
            break;
          }
        } else if (response.status === 200) {
          // 200レスポンスでリダイレクトがない場合、HTMLからメタリフレッシュを探す
          const text = await response.text();
          const metaRefreshMatch = text.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i);
          if (metaRefreshMatch) {
            const redirectUrl = metaRefreshMatch[1];
            console.log('Found meta refresh redirect:', redirectUrl);
            currentUrl = redirectUrl.startsWith('http') ? redirectUrl : new URL(redirectUrl, currentUrl).href;
            redirectCount++;
            continue;
          }
          
          // HTML内のJavaScriptリダイレクトを探す
          const jsRedirectMatch = text.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i) ||
                                  text.match(/location\.replace\(["']([^"']+)["']\)/i);
          if (jsRedirectMatch) {
            const redirectUrl = jsRedirectMatch[1];
            console.log('Found JavaScript redirect:', redirectUrl);
            currentUrl = redirectUrl.startsWith('http') ? redirectUrl : new URL(redirectUrl, currentUrl).href;
            redirectCount++;
            continue;
          }
          
          console.log('No further redirects found');
          break;
        } else {
          console.log(`Unexpected status code: ${response.status}`);
          break;
        }
      } catch (fetchError) {
        console.error(`Fetch error on attempt ${redirectCount + 1}:`, fetchError);
        
        // 最初のFetchで失敗した場合は元のURLを返す
        if (redirectCount === 0) {
          console.log('Initial fetch failed, returning original URL');
          return url;
        }
        break;
      }
    }
    
    console.log(`Final URL after ${redirectCount} redirects: ${currentUrl}`);
    return currentUrl;
  } catch (error) {
    console.error('Failed to expand shortened URL:', error);
    // エラーの場合は元のURLを返す
    return url;
  }
}

/**
 * Amazon URLからASINを抽出する（短縮URL対応）
 * @param url Amazon商品URL（短縮URLも対応）
 * @returns ASIN（10文字の英数字）またはnull
 */
export async function extractASIN(url: string): Promise<string | null> {
  try {
    // 短縮URLの場合は展開
    const expandedUrl = await expandShortenedUrl(url);
    return extractASINSync(expandedUrl);
  } catch (error) {
    console.error('Failed to extract ASIN:', error);
    return null;
  }
}

/**
 * Amazon URLからASINを抽出する（同期版）
 * @param url Amazon商品URL
 * @returns ASIN（10文字の英数字）またはnull
 */
export function extractASINSync(url: string): string | null {
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
 * Amazon URLを正規化する（トラッキングパラメータを削除、短縮URL対応）
 * @param url Amazon URL
 * @returns 正規化されたURL
 */
export async function normalizeAmazonUrl(url: string): Promise<string> {
  try {
    const asin = await extractASIN(url);
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
 * Amazon URLを正規化する（同期版）
 * @param url Amazon URL
 * @returns 正規化されたURL
 */
export function normalizeAmazonUrlSync(url: string): string {
  try {
    const asin = extractASINSync(url);
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
