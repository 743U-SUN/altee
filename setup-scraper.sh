#!/bin/bash

# Puppeteer Web Scraperのセットアップスクリプト

echo "🔧 Setting up Puppeteer Web Scraper..."

# エイリアスを.bashrcに追加
if ! grep -q "alias scrape=" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Puppeteer Web Scraper aliases" >> ~/.bashrc
    echo "alias scrape='node $(pwd)/web-scraper.js'" >> ~/.bashrc
    echo "alias scrape-full='node $(pwd)/web-scraper.js --fullpage'" >> ~/.bashrc
    echo "alias scrape-show='node $(pwd)/web-scraper.js --show'" >> ~/.bashrc
    echo "✅ Aliases added to ~/.bashrc"
else
    echo "✅ Aliases already exist in ~/.bashrc"
fi

# 使用方法を表示
echo ""
echo "🎉 Setup completed! 使用方法:"
echo ""
echo "基本使用:"
echo "  scrape <URL>                        # 基本スクリーンショット"
echo "  scrape <URL> \"検索ワード\"           # 検索+スクリーンショット"
echo ""
echo "オプション:"
echo "  scrape-full <URL>                   # フルページスクリーンショット"
echo "  scrape-show <URL>                   # ブラウザ画面を表示"
echo ""
echo "使用例:"
echo "  scrape https://www.youtube.com \"ゲーム実況\""
echo "  scrape https://www.amazon.co.jp \"キーボード\""
echo "  scrape https://www.google.com \"Claude Code\""
echo ""
echo "⚠️  新しいターミナルを開くか、'source ~/.bashrc' を実行してエイリアスを有効にしてください"