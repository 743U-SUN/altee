#!/usr/bin/env node
const puppeteer = require('puppeteer');

// コマンドライン引数を取得
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('使用方法: node web-scraper.js <URL> [検索ワード] [オプション]');
  console.log('例: node web-scraper.js https://www.youtube.com "ゲーム実況"');
  console.log('例: node web-scraper.js https://www.amazon.co.jp "キーボード" --fullpage');
  process.exit(1);
}

const targetUrl = args[0];
const searchTerm = args[1] || null;
const fullPage = args.includes('--fullpage');
const headless = !args.includes('--show'); // --showで画面表示

(async () => {
  console.log(`🚀 Starting web scraping for: ${targetUrl}`);
  
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--lang=ja-JP',
      '--font-render-hinting=none',
      '--disable-font-subpixel-positioning'
    ]
  });

  const page = await browser.newPage();
  
  // 日本語フォント設定と文字化け対策
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
  });
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  // ビューポートサイズを設定
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('🌐 Navigating to the website...');
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // 検索ワードが指定されている場合
  if (searchTerm) {
    console.log(`🔍 Searching for: "${searchTerm}"`);
    
    // 一般的な検索フィールドのセレクタを試す
    const searchSelectors = [
      'input[name="search_query"]', // YouTube
      'input[name="q"]', // Google
      '#twotabsearchtextbox', // Amazon
      'input[type="search"]',
      'input[placeholder*="検索"]',
      'input[placeholder*="search"]',
      '.search-input',
      '#search'
    ];
    
    let searchFound = false;
    for (const selector of searchSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.type(selector, searchTerm);
        
        // 検索ボタンまたはEnterを押す
        try {
          const submitSelectors = [
            '#nav-search-submit-button', // Amazon
            'button[type="submit"]',
            '.search-button',
            'input[type="submit"]'
          ];
          
          let submitted = false;
          for (const submitSelector of submitSelectors) {
            try {
              await page.click(submitSelector);
              submitted = true;
              break;
            } catch (e) {
              // 次のセレクタを試す
            }
          }
          
          if (!submitted) {
            await page.keyboard.press('Enter');
          }
        } catch (e) {
          await page.keyboard.press('Enter');
        }
        
        searchFound = true;
        break;
      } catch (e) {
        // 次のセレクタを試す
      }
    }
    
    if (!searchFound) {
      console.log('⚠️ 検索フィールドが見つかりませんでした。通常のスクリーンショットを撮影します。');
    } else {
      console.log('⏳ Waiting for search results...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // ページタイトルとURLを取得
  const title = await page.title();
  const url = page.url();
  
  console.log('📸 Taking screenshot...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `claude/healthcheck/screenshot-${timestamp}.png`;
  
  await page.screenshot({ 
    path: filename, 
    fullPage: fullPage,
    type: 'png'
  });
  
  // ページの基本情報を抽出
  console.log('📝 Extracting page information...');
  const pageInfo = await page.evaluate(() => {
    // テキストコンテンツの抽出
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim()).slice(0, 10);
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.textContent.trim(),
      href: a.href
    })).filter(l => l.text.length > 0).slice(0, 10);
    
    return {
      headings,
      links,
      description: document.querySelector('meta[name="description"]')?.content || 'No description',
      keywords: document.querySelector('meta[name="keywords"]')?.content || 'No keywords'
    };
  });
  
  console.log('\\n=== 取得結果 ===');
  console.log(`📄 タイトル: ${title}`);
  console.log(`🔗 URL: ${url}`);
  console.log(`📸 スクリーンショット: ${filename}`);
  console.log(`📝 説明: ${pageInfo.description}`);
  
  if (pageInfo.headings.length > 0) {
    console.log('\\n📋 主要な見出し:');
    pageInfo.headings.forEach((heading, index) => {
      if (heading.length > 0) {
        console.log(`  ${index + 1}. ${heading}`);
      }
    });
  }
  
  if (pageInfo.links.length > 0) {
    console.log('\\n🔗 主要なリンク:');
    pageInfo.links.forEach((link, index) => {
      if (link.text.length > 0 && link.text.length < 100) {
        console.log(`  ${index + 1}. ${link.text}`);
      }
    });
  }
  
  await browser.close();
  console.log('\\n🎉 Web scraping completed successfully!');
})().catch(error => {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
});
