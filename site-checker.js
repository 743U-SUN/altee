#!/usr/bin/env node
const puppeteer = require('puppeteer');

// コマンドライン引数を取得
const args = process.argv.slice(2);
const port = args[0] || '3000';
const path = args[1] || '';
const url = `http://localhost:${port}${path ? '/' + path.replace(/^\/+/, '') : ''}`;

// オプション解析
const options = {
  withLogin: args.includes('--login'),
  scrollCapture: args.includes('--scroll'),
  consoleCapture: args.includes('--console'),
  sessionCookie: args.find(arg => arg.startsWith('--session='))?.split('=')[1],
  username: args.find(arg => arg.startsWith('--user='))?.split('=')[1],
  password: args.find(arg => arg.startsWith('--pass='))?.split('=')[1]
};

// ヘルプ表示
if (args.includes('--help') || args.includes('-h')) {
  console.log('高機能サイトチェッカー: node site-checker.js [ポート] [パス] [オプション]');
  console.log('');
  console.log('基本使用例:');
  console.log('  node site-checker.js 3000 device');
  console.log('  node site-checker.js 3000 admin/users');
  console.log('  check-site 3000 device');
  console.log('');
  console.log('オプション:');
  console.log('  --scroll              スクロールしながらフルページキャプチャ');
  console.log('  --console             コンソールログのスクリーンショットも撮影');
  console.log('  --login               ログインフォームを自動検出・入力');
  console.log('  --user=USERNAME       ログインユーザー名');
  console.log('  --pass=PASSWORD       ログインパスワード');
  console.log('  --session=COOKIE      セッションCookieを設定');
  console.log('');
  console.log('高機能使用例:');
  console.log('  check-site 3000 admin --scroll --console');
  console.log('  check-site 3000 user/profile --login --user=test@example.com --pass=password');
  console.log('  check-site 3000 dashboard --session="session_id=abc123"');
  process.exit(0);
}

console.log(`🔍 Starting advanced site health check for: ${url}`);
if (options.withLogin) console.log('🔐 Login mode enabled');
if (options.scrollCapture) console.log('📜 Scroll capture enabled');
if (options.consoleCapture) console.log('🖥️ Console capture enabled');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--lang=ja-JP',
      '--font-render-hinting=none',
      '--disable-font-subpixel-positioning',
      '--force-device-scale-factor=1'
    ]
  });

  const page = await browser.newPage();
  
  // エラーとログを収集する配列
  const errors = [];
  const warnings = [];
  const consoleMessages = [];
  const networkErrors = [];
  
  // ビューポートサイズを設定
  await page.setViewport({ width: 1920, height: 1080 });
  
  // 日本語フォント設定と文字化け対策
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
  });
  
  // セッションCookieを設定
  if (options.sessionCookie) {
    console.log('🍪 Setting session cookie...');
    const [name, value] = options.sessionCookie.split('=');
    await page.setCookie({
      name: name,
      value: value,
      domain: 'localhost',
      path: '/'
    });
  }
  
  // 日本語フォントを設定
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        * {
          font-family: 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif !important;
        }
      `;
      if (document.head) {
        document.head.appendChild(style);
      }
    });
  });
  
  // コンソールメッセージをキャプチャ
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    consoleMessages.push({ type, text, timestamp: new Date().toISOString() });
    
    if (type === 'error') {
      errors.push(`❌ Console Error: ${text}`);
    } else if (type === 'warning') {
      warnings.push(`⚠️ Console Warning: ${text}`);
    }
  });
  
  // JavaScriptエラーをキャプチャ
  page.on('pageerror', error => {
    errors.push(`💥 JavaScript Error: ${error.message}`);
  });
  
  // リクエスト失敗をキャプチャ
  page.on('requestfailed', request => {
    networkErrors.push(`🌐 Network Error: ${request.url()} - ${request.failure().errorText}`);
  });
  
  // レスポンスエラーをキャプチャ
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`📡 HTTP Error: ${response.url()} - ${response.status()} ${response.statusText()}`);
    }
  });
  
  try {
    console.log('🌐 Navigating to the site...');
    
    // ページにアクセス
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    if (!response.ok()) {
      errors.push(`🚫 Site Access Error: ${response.status()} ${response.statusText()}`);
    }
    
    // ログイン処理
    if (options.withLogin && options.username && options.password) {
      console.log('🔐 Attempting to login...');
      
      // 一般的なログインフィールドを検索
      const loginSelectors = [
        'input[type="email"]',
        'input[type="text"][name*="email"]',
        'input[type="text"][name*="username"]',
        'input[name="email"]',
        'input[name="username"]',
        'input[placeholder*="メール"]',
        'input[placeholder*="ユーザー"]'
      ];
      
      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="パスワード"]'
      ];
      
      let loginSuccess = false;
      
      for (const loginSelector of loginSelectors) {
        try {
          await page.waitForSelector(loginSelector, { timeout: 3000 });
          await page.type(loginSelector, options.username);
          
          for (const passSelector of passwordSelectors) {
            try {
              await page.type(passSelector, options.password);
              
              // ログインボタンを探して押す
              const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("ログイン")',
                'button:contains("Sign in")',
                '.login-button',
                '.signin-button'
              ];
              
              for (const submitSelector of submitSelectors) {
                try {
                  await page.click(submitSelector);
                  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
                  loginSuccess = true;
                  break;
                } catch (e) {
                  // 次のセレクタを試す
                }
              }
              
              if (loginSuccess) break;
            } catch (e) {
              // 次のパスワードセレクタを試す
            }
          }
          
          if (loginSuccess) break;
        } catch (e) {
          // 次のログインセレクタを試す
        }
      }
      
      if (loginSuccess) {
        console.log('✅ Login appears successful');
      } else {
        console.log('⚠️ Could not complete login automatically');
      }
    }
    
    console.log('⏳ Checking for runtime errors...');
    
    // 少し待ってからページの状態をチェック
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // スクロールキャプチャ機能
    if (options.scrollCapture) {
      console.log('📜 Performing scroll capture...');
      
      // ページの高さを取得
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      console.log(`📏 Page dimensions: ${bodyHeight}px height, ${viewportHeight}px viewport`);
      
      // スクロールしながらキャプチャ
      const scrollSteps = Math.ceil(bodyHeight / viewportHeight);
      console.log(`🔄 Performing ${scrollSteps} scroll steps...`);
      
      for (let i = 0; i < scrollSteps; i++) {
        const scrollY = i * viewportHeight;
        console.log(`   Step ${i + 1}/${scrollSteps}: Scrolling to ${scrollY}px`);
        
        await page.evaluate((step, vh) => {
          window.scrollTo(0, step * vh);
        }, i, viewportHeight);
        
        // 遅延読み込みコンテンツを待つ
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 最後に一番上に戻る
      console.log('🔝 Scrolling back to top...');
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // ページの基本情報を取得
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        readyState: document.readyState,
        hasErrors: !!document.querySelector('.error, .error-message, [class*="error"]'),
        has404: document.body.textContent.toLowerCase().includes('404'),
        hasReactErrors: !!document.querySelector('[data-reactroot] .error, .react-error-boundary'),
        linksCount: document.querySelectorAll('a').length,
        imagesCount: document.querySelectorAll('img').length,
        formsCount: document.querySelectorAll('form').length,
        scrollHeight: document.body.scrollHeight,
        isLoggedIn: !!(document.querySelector('[data-testid="user-menu"]') || 
                       document.querySelector('.user-profile') ||
                       document.querySelector('.logout') ||
                       document.querySelector('[href*="logout"]'))
      };
    });
    
    // スクリーンショットを撮影
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `claude/healthcheck/site-check-${timestamp}.png`;
    
    console.log('📸 Taking main screenshot...');
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true,
      type: 'png'
    });
    
    // コンソールログのスクリーンショット
    let consoleScreenshotPath = null;
    if (options.consoleCapture) {
      console.log('🖥️ Taking console screenshot with visible DevTools...');
      
      // コンソールメッセージを視覚的に表示してスクリーンショット
      console.log('📝 Creating visual console log display...');
      consoleScreenshotPath = `claude/healthcheck/console-${timestamp}.png`;
      
      // コンソールメッセージをページにオーバーレイ表示
      await page.evaluate((messages) => {
        const consoleDiv = document.createElement('div');
        consoleDiv.style.position = 'fixed';
        consoleDiv.style.top = '0';
        consoleDiv.style.left = '0';
        consoleDiv.style.width = '100%';
        consoleDiv.style.height = '100%';
        consoleDiv.style.backgroundColor = '#1e1e1e';
        consoleDiv.style.color = '#ffffff';
        consoleDiv.style.fontFamily = 'Consolas, "Courier New", monospace';
        consoleDiv.style.fontSize = '14px';
        consoleDiv.style.padding = '20px';
        consoleDiv.style.overflow = 'auto';
        consoleDiv.style.zIndex = '99999';
        consoleDiv.style.border = '2px solid #333';
        
        // タイトル
        const title = document.createElement('div');
        title.textContent = '🖥️ Console Messages';
        title.style.color = '#61dafb';
        title.style.fontSize = '18px';
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '20px';
        title.style.borderBottom = '1px solid #333';
        title.style.paddingBottom = '10px';
        consoleDiv.appendChild(title);
        
        // 統計情報
        const stats = document.createElement('div');
        const errorCount = messages.filter(m => m.type === 'error' || m.type === 'pageerror').length;
        const warningCount = messages.filter(m => m.type === 'warning').length;
        const logCount = messages.filter(m => m.type === 'log' || m.type === 'info').length;
        
        stats.innerHTML = `
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <span style="color: #f56565;">❌ Errors: ${errorCount}</span>
            <span style="color: #ed8936;">⚠️ Warnings: ${warningCount}</span>
            <span style="color: #68d391;">📝 Logs: ${logCount}</span>
            <span style="color: #4299e1;">📊 Total: ${messages.length}</span>
          </div>
        `;
        consoleDiv.appendChild(stats);
        
        // メッセージリスト
        messages.forEach((msg, index) => {
          const msgDiv = document.createElement('div');
          msgDiv.style.marginBottom = '8px';
          msgDiv.style.padding = '8px';
          msgDiv.style.borderRadius = '4px';
          msgDiv.style.fontSize = '13px';
          msgDiv.style.lineHeight = '1.4';
          
          const timestamp = new Date(msg.timestamp).toLocaleTimeString();
          
          let bgColor = '#2d3748';
          let textColor = '#ffffff';
          let icon = '📝';
          
          if (msg.type === 'error' || msg.type === 'pageerror') {
            bgColor = '#742a2a';
            textColor = '#fed7d7';
            icon = '❌';
          } else if (msg.type === 'warning') {
            bgColor = '#744210';
            textColor = '#fef5e7';
            icon = '⚠️';
          } else if (msg.type === 'info') {
            bgColor = '#2a4365';
            textColor = '#bee3f8';
            icon = 'ℹ️';
          } else if (msg.type === 'log') {
            bgColor = '#22543d';
            textColor = '#c6f6d5';
            icon = '📝';
          }
          
          msgDiv.style.backgroundColor = bgColor;
          msgDiv.style.color = textColor;
          
          msgDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start;">
              <span style="margin-right: 8px; flex-shrink: 0;">${icon}</span>
              <div style="flex: 1;">
                <div style="font-size: 11px; opacity: 0.8; margin-bottom: 4px;">[${timestamp}] ${msg.type.toUpperCase()}</div>
                <div style="word-break: break-word;">${msg.text}</div>
              </div>
            </div>
          `;
          
          consoleDiv.appendChild(msgDiv);
        });
        
        document.body.appendChild(consoleDiv);
      }, consoleMessages);
      
      // 少し待ってからスクリーンショット
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.screenshot({ 
        path: consoleScreenshotPath,
        fullPage: false,
        type: 'png'
      });
      
      console.log('✅ Console screenshot captured with visual overlay');
    }
    
    // 結果レポートを生成
    console.log('\\n📋 === ADVANCED SITE HEALTH CHECK REPORT ===');
    console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
    console.log(`🔗 URL: ${url}`);
    console.log(`📄 Title: ${pageInfo.title}`);
    console.log(`📊 Status: ${response.status()} ${response.statusText()}`);
    console.log(`📸 Main Screenshot: ${screenshotPath}`);
    if (consoleScreenshotPath) {
      console.log(`🖥️ Console Screenshot: ${consoleScreenshotPath}`);
    }
    
    console.log(`\\n📈 Page Stats:`);
    console.log(`  - Ready State: ${pageInfo.readyState}`);
    console.log(`  - Page Height: ${pageInfo.scrollHeight}px`);
    console.log(`  - Links: ${pageInfo.linksCount}`);
    console.log(`  - Images: ${pageInfo.imagesCount}`);
    console.log(`  - Forms: ${pageInfo.formsCount}`);
    console.log(`  - Login Status: ${pageInfo.isLoggedIn ? '✅ Logged in' : '❌ Not logged in'}`);
    
    // エラーサマリー
    const totalErrors = errors.length + networkErrors.length;
    const totalWarnings = warnings.length;
    
    if (totalErrors === 0 && totalWarnings === 0) {
      console.log('\\n✅ SUCCESS: No errors or warnings detected!');
    } else {
      console.log(`\\n⚠️ ISSUES FOUND: ${totalErrors} errors, ${totalWarnings} warnings`);
    }
    
    // エラー詳細
    if (errors.length > 0) {
      console.log('\\n🚨 ERRORS:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // ネットワークエラー詳細
    if (networkErrors.length > 0) {
      console.log('\\n🌐 NETWORK ERRORS:');
      networkErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // 警告詳細
    if (warnings.length > 0) {
      console.log('\\n⚠️ WARNINGS:');
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    // 特殊チェック
    if (pageInfo.hasErrors) {
      console.log('\\n🚩 Page contains error elements detected!');
    }
    
    if (pageInfo.has404) {
      console.log('\\n🚩 Page content suggests 404 error!');
    }
    
    if (pageInfo.hasReactErrors) {
      console.log('\\n🚩 React error boundary detected!');
    }
    
    // コンソールメッセージサマリー
    if (consoleMessages.length > 0) {
      console.log(`\\n📝 Console Messages: ${consoleMessages.length} total`);
      const errorCount = consoleMessages.filter(m => m.type === 'error').length;
      const warningCount = consoleMessages.filter(m => m.type === 'warning').length;
      const logCount = consoleMessages.filter(m => m.type === 'log').length;
      
      console.log(`  - Errors: ${errorCount}`);
      console.log(`  - Warnings: ${warningCount}`);
      console.log(`  - Logs: ${logCount}`);
      
      if (options.consoleCapture && consoleMessages.length > 0) {
        console.log('\\n📋 Recent Console Messages:');
        consoleMessages.slice(-10).forEach((msg, index) => {
          console.log(`  ${msg.type.toUpperCase()}: ${msg.text}`);
        });
      }
    }
    
    console.log('\\n=== END ADVANCED REPORT ===\\n');
    
    // 終了コード設定
    if (totalErrors > 0) {
      process.exit(1); // エラーがある場合は終了コード1
    } else {
      process.exit(0); // 正常終了
    }
    
  } catch (error) {
    console.error(`\\n💥 CRITICAL ERROR: ${error.message}`);
    console.log('\\n📸 Taking error screenshot...');
    
    try {
      await page.screenshot({ 
        path: `claude/healthcheck/error-site-check-${Date.now()}.png`, 
        fullPage: true 
      });
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError.message);
    }
    
    process.exit(1);
  } finally {
    await browser.close();
  }
  
})().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});