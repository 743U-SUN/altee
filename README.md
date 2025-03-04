# Next.js ブログシステム

技術スタックを活用した現代的なブログシステム。

## プロジェクト概要

- **目的**: 学習用 + ポートフォリオ + 実運用
- **優先機能**: 記事管理 > カテゴリ/タグ > 認証 > 検索 > コメント

## 技術スタック

- **フレームワーク**: Next.js(v22.14.0) + React + TypeScript
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **スタイリング**: Tailwind CSS
- **認証**: NextAuth.js
- **エディタ**: TipTap (リッチテキストエディタ)
- **デプロイ**: さくらVPS (Docker構成)
- **CI/CD**: GitHub Actions

## ディレクトリ構造

```
example.com（VPSサーバー）
├── docker-compose.yml
├── .env                        # 環境変数設定
├── shared/                     # 共通ライブラリ（初期は最小限）
│   ├── lib/
│   │   ├── validation/        # 入力検証
│   │   │   └── index.ts
│   │   └── auth/             # 認証関連（後々のユーザー管理用）
│   │       └── index.ts
│   └── types/                # 共通の型定義
│       └── index.ts
├── nginx/
│   ├── conf.d/
│   │   ├── default.conf       # 基本設定
│   │   └── locations/         # URL振り分け設定
│   └── ssl/                   # SSL証明書
├── services/
│   ├── main-site/            # メインサイト
│   │   ├── Dockerfile
│   │   ├── src/
│   │   ├── tests/            # テストコード
│   │   └── docs/
│   │       └── api/
│   │           └── openapi.yml
│   └── blog/                 # Next.jsブログ
│       ├── Dockerfile
│       ├── src/
│       │   ├── app/          # Next.jsのApp Router
│       │   ├── components/   # コンポーネント
│       │   └── lib/          # ユーティリティ関数
│       ├── public/          # 静的ファイル
│       ├── content/         # ブログコンテンツ（MDXなど）
│       │   └── posts/       # 記事ファイル
│       └── next.config.js   # Next.js設定
└── database/
    └── postgres/             # メインのDB（後々のユーザー管理用）
        ├── init-scripts/
        └── migrations/       # DBマイグレーション
```

## Dockerコンテナ構成

```
containers:
├── nginx-proxy              # リバースプロキシ
├── main-site-app           # メインサイト
├── blog-nextjs-app         # Next.jsブログ
└── postgres-db             # メインDB
```

## Docker Volume構成

```
volumes:
├── nginx_conf              # Nginx設定
├── postgres_data          # PostgreSQLデータ
├── blog_content          # ブログの記事コンテンツ(MDXなど)
├── blog_uploads          # ユーザーアップロード画像等
├── logs_volume           # アプリケーション/DB/Nginxログ
└── backup_volume         # データベースバックアップ
```

## 開発フェーズ

### フェーズ1: 環境構築
- Next.js + TypeScript + Tailwind CSSセットアップ
- Docker開発環境構築
- GitHubリポジトリ作成

### フェーズ2: 基盤開発
- 基本UIコンポーネント作成
- データベースモデル設計
- 公開ページ基本実装

### フェーズ3: 認証と管理機能
- 認証システム実装
- 管理画面実装
- エディタ実装

### フェーズ4: APIと詳細機能
- 記事管理API実装
- 公開機能拡張
- 検索機能実装

### フェーズ5: キャッシュと最適化
- キャッシュ戦略実装
- SEO対策
- 分析ツール導入

### フェーズ6: デプロイとメンテナンス
- 本番環境設定
- デプロイパイプライン構築
- バックアップ計画実装

### フェーズ7: テストと継続的改善
- 基本テスト実装
- パフォーマンス最適化