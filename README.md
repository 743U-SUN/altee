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
- **プロジェクト初期化 (済)**
  - Next.js + TypeScript + Tailwind CSSセットアップ
  - ESLint, Prettier設定
  - ディレクトリ構造整理
  - Prisma ORM設定
- **Docker開発環境構築 (済)**
  - アプリ用Dockerfile作成
  - PostgreSQL用コンテナ設定
  - docker-compose.yml作成
  - 開発/本番環境分離設定
- **GitHubリポジトリ作成（済）**
  - GitHub Actions基本CI/CD設定
    - テスト実行
    - ビルド検証
    - 本番環境デプロイ自動化

### フェーズ2: 基盤開発
- **基本UIコンポーネント作成**
  - ヘッダー、フッター、レイアウト
  - カード、ボタン等の再利用コンポーネント
  - ページテンプレート
  - レスポンシブデザイン対応
- **データベースモデル設計**
  - 記事（公開状態：下書き/非公開/公開）
  - カテゴリ、タグテーブル設計
  - マイグレーションファイル作成
  - TypeScriptの型定義
  - 効率的なクエリ設計とインデックス最適化
- **公開ページ基本実装**
  - トップページ
  - 記事一覧表示（ページネーション機能付き）
  - 記事詳細ページ（基本レイアウト）

### フェーズ3: 認証と管理機能
- **認証システム実装**
  - NextAuth.js設定
  - ログインページ作成
  - 認証ミドルウェア実装
  - セキュリティ対策（CSRF, XSS対策）
- **管理画面実装**
  - ダッシュボード
  - 記事一覧・管理画面
  - カテゴリ/タグ管理
- **エディタ実装**
  - TipTapエディタ設定
  - 画像アップロード機能
  - 下書き保存機能
  - メディア（動画、音声、埋め込みコンテンツ）サポート
  - 公開状態管理（下書き/非公開/公開）

### フェーズ4: APIと詳細機能
- **記事管理API実装**
  - CRUD操作のAPI Routes
  - バリデーション（zod等）
  - APIセキュリティ（レート制限等）
  - キャッシュ制御
- **公開機能拡張**
  - カテゴリ/タグページ
  - Twitter/X共有機能
  - コメント機能（独自実装）
  - RSS配信
- **検索機能実装**
  - 検索API
  - 検索UI
  - フィルタリング機能
- **さくらVPSサーバー契約**

### フェーズ5: キャッシュと最適化
- **キャッシュ戦略実装**
  - ISR（Incremental Static Regeneration）設定
  - SWR/React Queryによる動的データ取得
  - パフォーマンス最適化
- **SEO対策**
  - メタタグ管理（Next.js組み込み機能使用）
  - サイトマップ生成
  - JSON-LD構造化データ
- **分析ツール導入**
  - Google Analytics設定
  - パフォーマンスモニタリング

### フェーズ6: デプロイとメンテナンス
- **本番環境設定**
  - 環境変数設定
  - SSL対応
  - セキュリティ対策
- **デプロイパイプライン構築**
  - CI/CD完成（GitHub Actions）
  - 自動テスト統合
- **バックアップ計画実装**
  - 日次バックアップ（7日分保持）
  - 週次バックアップ（4週分保持）
  - 月次バックアップ（12ヶ月分保持）
  - 復元テスト計画

### フェーズ7: テストと継続的改善
- **基本テスト実装**
  - API、認証テスト
  - UI/インテグレーションテスト
- **パフォーマンス最適化**
  - 画像最適化（Next.js機能活用）
  - ページロード高速化
  - Lighthouseスコア改善