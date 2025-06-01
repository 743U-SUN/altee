#!/usr/bin/env node
const puppeteer = require('puppeteer');

// コマンドライン引数を取得
const args = process.argv.slice(2);
const port = args[0] || '3000';
const path = args[1] || '';
const url = `http://localhost:${port}${path ? '/' + path.replace(/^\/+/, '') : ''}`;

console.log(`🖥️ Starting console logger for: ${url}`);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    headless: false, // 画面表示でコンソールが見える
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--auto-open-devtools-for-tabs', // DevToolsを自動で開く
      '--lang=ja-JP'
    ]
  });

  const page = await browser.newPage();
  
  // コンソールメッセージを収集
  const consoleMessages = [];
  
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    const timestamp = new Date().toISOString();
    
    consoleMessages.push({ type, text, timestamp });
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${text}`);
  });
  
  // JavaScriptエラーもキャプチャ
  page.on('pageerror', error => {
    const timestamp = new Date().toISOString();
    consoleMessages.push({ 
      type: 'pageerror', 
      text: error.message, 
      timestamp 
    });
    console.log(`[${timestamp}] PAGEERROR: ${error.message}`);
  });
  
  // ビューポート設定
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('🌐 Navigating to the site...');
  
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    console.log('⏳ Waiting and collecting console messages...');
    
    // 少し待ってからコンソールメッセージを確認
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // DevToolsにフォーカスしてスクリーンショット
    console.log('📸 Taking screenshot with DevTools open...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `claude/healthcheck/console-visible-${timestamp}.png`;
    
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false,
      type: 'png'
    });
    
    console.log(`\\n📋 Console Messages Summary (${consoleMessages.length} total):`);
    
    if (consoleMessages.length === 0) {
      console.log('  ✅ No console messages detected');
    } else {
      const errorCount = consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror').length;
      const warningCount = consoleMessages.filter(m => m.type === 'warning').length;
      const logCount = consoleMessages.filter(m => m.type === 'log').length;
      
      console.log(`  - Errors: ${errorCount}`);
      console.log(`  - Warnings: ${warningCount}`);
      console.log(`  - Logs: ${logCount}`);
      
      console.log('\\n📝 Recent Messages:');
      consoleMessages.slice(-10).forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
      });
    }
    
    console.log(`\\n📸 Screenshot saved: ${screenshotPath}`);
    console.log('\\n💡 DevTools should be visible in the screenshot for manual console inspection');
    
    // ブラウザを少し開いたままにして手動確認できるようにする
    console.log('\\n⏰ Keeping browser open for 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error(`\\n💥 ERROR: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\\n✅ Console logging completed');
  }
  
})().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});