# Puppeteer Web Automation ガイド

このプロジェクトには、Puppeteerを使用したWebサイトの自動化とヘルスチェック機能が含まれています。

## 概要

PuppeteerはGoogle Chromeをプログラムで制御するためのNode.jsライブラリです。このプロジェクトでは、以下の2つの主要なスクリプトを提供しています：

- **site-checker.js**: 高機能localhost開発サイトヘルスチェッカー（メイン）
- **web-scraper.js**: 汎用Webスクレイピングツール

## セットアップ

### 必要な依存関係

```bash
# Puppeteerをインストール
npm install puppeteer

# Chromiumブラウザをインストール（Ubuntu/WSL2）
sudo apt update && sudo apt install -y chromium-browser
```

### エイリアスの設定

```bash
# エイリアスを追加
echo 'alias check-site="node $(pwd)/site-checker.js"' >> ~/.bashrc
echo 'alias scrape="node $(pwd)/web-scraper.js"' >> ~/.bashrc
source ~/.bashrc
```

## 使用方法

### 1. 高機能サイトヘルスチェック（site-checker.js）

localhost開発サイトの詳細な健康状態をチェックします。

#### 基本使用法

```bash
# デフォルト（localhost:3000）
node site-checker.js

# 指定ポート
node site-checker.js 3001

# 特定のパスをチェック
node site-checker.js 3000 device              # localhost:3000/device
node site-checker.js 3000 admin/users         # localhost:3000/admin/users
node site-checker.js 3000 /api/health         # localhost:3000/api/health

# エイリアス使用
check-site 3000                # localhost:3000
check-site 3000 device         # localhost:3000/device
check-site 3001 admin/devices  # localhost:3001/admin/devices

# ヘルプ表示
node site-checker.js --help
```

#### 高機能オプション

**🔐 ログイン機能**
```bash
# 自動ログイン（フォーム自動検出）
node site-checker.js 3000 admin --login --user=admin@example.com --pass=password123

# セッションCookieを使用
node site-checker.js 3000 dashboard --session="session_id=abc123xyz"

# エイリアス使用
check-site 3000 user/profile --login --user=test@example.com --pass=mypassword
```

**📜 スクロールキャプチャ**
```bash
# スクロールしながらフルページスクリーンショット
node site-checker.js 3000 device --scroll

# 遅延読み込みコンテンツも取得
check-site 3000 catalog --scroll
```

**🖥️ コンソールログキャプチャ**
```bash
# コンソールログのスクリーンショットも撮影
node site-checker.js 3000 admin --console

# エイリアス使用
check-site 3000 device --console
```

**🚀 全機能組み合わせ**
```bash
# 完全な高機能チェック
node site-checker.js 3000 admin/users --scroll --console --login --user=admin@test.com --pass=password

# エイリアス使用
check-site 3000 dashboard --scroll --console --session="auth_token=xyz789"
```

#### 検出可能なエラー・情報

- ❌ **コンソールエラー**: JavaScript実行エラー
- 🌐 **ネットワークエラー**: 404、500、接続失敗
- 💥 **JavaScriptエラー**: 実行時例外
- 🚩 **React/Next.jsエラー**: Error Boundaryなど
- ⚠️ **警告**: Console warnings
- 🔐 **ログイン状態**: 認証状態の検出
- 📏 **ページ寸法**: スクロール可能な高さ
- 📊 **コンテンツ統計**: リンク、画像、フォーム数

#### 出力例

```
📋 === ADVANCED SITE HEALTH CHECK REPORT ===
🕒 Timestamp: 2025-06-01T13:52:16.247Z
🔗 URL: http://localhost:3000/device
📄 Title: Alteeアプリケーション - デバイスカタログ
📊 Status: 200 OK
📸 Main Screenshot: claude/healthcheck/site-check-2025-06-01T13-52-15-614Z.png
🖥️ Console Screenshot: claude/healthcheck/console-2025-06-01T13-52-15-614Z.png

📈 Page Stats:
  - Ready State: complete
  - Page Height: 2450px
  - Links: 28
  - Images: 14
  - Forms: 1
  - Login Status: ✅ Logged in

✅ SUCCESS: No errors or warnings detected!

📝 Console Messages: 13 total
  - Errors: 0
  - Warnings: 0
  - Logs: 8
```

### 2. 汎用Webスクレイピング（web-scraper.js）

任意のWebサイトをスクレイピングします。

#### 基本使用法

```bash
# 基本スクリーンショット
node web-scraper.js <URL>

# 検索付きスクリーンショット
node web-scraper.js <URL> "検索ワード"

# フルページスクリーンショット
node web-scraper.js <URL> --fullpage

# ブラウザ画面を表示
node web-scraper.js <URL> --show
```

#### エイリアス使用例

```bash
# YouTube検索
scrape https://www.youtube.com "ゲーム実況"

# Amazon商品検索
scrape https://www.amazon.co.jp "キーボード"

# フルページスクリーンショット
scrape-full https://www.google.com
```

## スクリーンショット保存先

すべてのスクリーンショットは `claude/healthcheck/` ディレクトリに保存されます：

```
claude/healthcheck/
├── site-check-2025-06-01T13-52-15-614Z.png         # メインページ
├── console-2025-06-01T13-52-15-614Z.png            # コンソールログ
├── screenshot-2025-06-01T12-17-33-047Z.png         # 汎用スクレイピング
└── error-advanced-1733123456789.png                # エラー時
```

## 実用的な使用例

### 開発ワークフローでの活用

```bash
# 1. 基本的な動作確認
check-site 3000

# 2. 認証が必要なページの確認
check-site 3000 admin/dashboard --login --user=admin@local.dev --pass=dev123

# 3. 長いページのスクロール確認
check-site 3000 device --scroll

# 4. JavaScriptエラーの詳細確認
check-site 3000 complex-page --console

# 5. 完全なヘルスチェック
check-site 3000 user/profile --scroll --console --login --user=test@example.com --pass=test123
```

### CI/CDでの自動テスト

```bash
#!/bin/bash
# health-check.sh

echo "Starting automated health checks..."

# 各主要ページをチェック
pages=("" "device" "admin" "user/dashboard")

for page in "${pages[@]}"; do
    echo "Checking /$page"
    if ! node site-checker.js 3000 "$page" --scroll; then
        echo "❌ Health check failed for /$page"
        exit 1
    fi
done

echo "✅ All health checks passed!"
```

## よくある質問と回答

### Q1: ログインしないと見られないページはどうするの？

**A1: 3つの方法があります**

1. **自動ログイン機能**:
   ```bash
   check-site 3000 admin --login --user=admin@example.com --pass=password123
   ```

2. **セッションCookie注入**:
   ```bash
   # ブラウザからCookieを取得して使用
   check-site 3000 dashboard --session="session_id=abc123xyz"
   ```

3. **開発環境での認証バイパス**:
   ```bash
   # 開発環境でテスト用認証を設定
   check-site 3000 protected-page --session="dev_bypass=true"
   ```

### Q2: 下までスクロールしながらページ全体をスクリーンショット撮れないの？

**A2: `--scroll`オプションで完全対応！**

```bash
# スクロールキャプチャ機能
check-site 3000 long-page --scroll
```

**機能詳細**:
- ページ高さを自動検出
- ビューポート単位でスクロール
- 遅延読み込みコンテンツを待機
- 最終的にフルページスクリーンショット

### Q3: コンソールログのスクリーンショットは撮れないの？

**A3: `--console`オプションで対応！**

```bash
# コンソールログも撮影
check-site 3000 debug-page --console
```

**取得される情報**:
- DevToolsコンソールのスクリーンショット
- コンソールメッセージのテキストログ
- エラー/警告/通常ログの分類
- 最新10件のメッセージ詳細

## トラブルシューティング

### WSL2環境での設定

WSL2環境では以下の設定が必要です：

```bash
# Chromiumの実行パス
executablePath: '/usr/bin/chromium-browser'

# 必要な起動オプション
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu'
]
```

### 日本語フォントの文字化け対策

スクリプトには日本語フォント設定が含まれています：

- Noto Sans JPフォントの自動読み込み
- 日本語ロケール設定（ja-JP）
- フォントレンダリング最適化

### よくあるエラー

#### 1. ブラウザ起動エラー

```bash
# Chromiumがインストールされていない場合
sudo apt install chromium-browser
```

#### 2. 権限エラー

```bash
# ファイルに実行権限を付与
chmod +x advanced-site-checker.js web-scraper.js
```

#### 3. ログインエラー

```bash
# ログインフィールドが見つからない場合
# カスタムセレクタを追加（スクリプト内で設定）
```

#### 4. タイムアウトエラー

```javascript
// タイムアウト時間を調整
await page.goto(url, { 
  waitUntil: 'networkidle2', 
  timeout: 60000  // 60秒に延長
});
```

## スクリプトのカスタマイズ

### site-checker.jsの設定

```javascript
// ビューポートサイズの変更
await page.setViewport({ width: 1920, height: 1080 });

// ログインセレクタの追加
const loginSelectors = [
  'input[type="email"]',
  'input[name="email"]',
  '.your-custom-login-field'  // カスタムセレクタ
];

// 認証状態検出の追加
isLoggedIn: !!(document.querySelector('[data-testid="user-menu"]') || 
               document.querySelector('.your-logged-in-indicator'))
```

### web-scraper.jsの設定

```javascript
// 検索セレクタの追加
const searchSelectors = [
  'input[name="search_query"]', // YouTube
  'input[name="q"]',            // Google
  '#twotabsearchtextbox',       // Amazon
  '.your-custom-search-input'   // カスタム
];
```

## MCP統合について

現在、WSL2環境ではPuppeteer MCPサーバーの統合に技術的な制約があります。そのため、直接スクリプト実行による自動化を推奨しています。

### MCP代替手法

1. **コマンドライン実行**: `node site-checker.js`
2. **bashエイリアス**: `check-site 3000 device --scroll --console`
3. **CI/CD統合**: GitHub Actionsでの自動実行
4. **npm scripts**: package.jsonでのスクリプト化

```json
{
  "scripts": {
    "health-check": "node site-checker.js 3000",
    "health-check-full": "node site-checker.js 3000 device --scroll --console",
    "health-check-admin": "node site-checker.js 3000 admin --login --user=$ADMIN_USER --pass=$ADMIN_PASS"
  }
}
```

## パフォーマンス最適化

### 大きなページでの最適化

```bash
# 軽量チェック（スクロールなし）
check-site 3000 heavy-page

# 必要な場合のみスクロール
check-site 3000 heavy-page --scroll

# コンソールキャプチャは重いので必要時のみ
check-site 3000 debug-page --console
```

### バッチ処理での最適化

```bash
# 複数ページを効率的にチェック
for page in device admin user; do
    check-site 3000 "$page" &
done
wait  # 並列実行で高速化
```

## 参考資料

- [Puppeteer公式ドキュメント](https://pptr.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Next.js開発サーバーのデバッグ](https://nextjs.org/docs/advanced-features/debugging)
- [Puppeteer認証ガイド](https://pptr.dev/guides/authentication)

## 更新履歴

- **2025-06-01**: 初版作成、日本語フォント対応
- **2025-06-01**: スクリーンショット保存先をclaude/healthcheckに変更
- **2025-06-01**: 高機能版site-checker.js追加
  - ログイン機能追加
  - スクロールキャプチャ追加
  - コンソールログスクリーンショット追加
  - 認証状態検出追加