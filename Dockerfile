# ベースイメージとして軽量なNode.jsイメージを使用
FROM node:22.15.0-slim AS base

# 作業ディレクトリの設定
WORKDIR /app

# PostgreSQLクライアントをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 開発ステージ
FROM base AS development

# 必要なツールをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# npmの設定をグローバルに更新
RUN npm config set update-notifier false && \
    npm config set fund false

# 依存関係ファイルをコピー
COPY package.json package-lock.json* ./

# パッケージをインストール - legacy-peer-depsフラグを追加
RUN npm ci --legacy-peer-deps

# TypeScript、Prisma CLIをグローバルにインストール
RUN npm install -g typescript prisma

# アプリケーションのソースをコピー
COPY . .

# Prismaのセットアップ
RUN npx prisma generate

# 開発サーバー用のポートを公開
EXPOSE 3000

# 開発モードでサーバーを起動
CMD ["npm", "run", "dev"]

# ビルドステージ
FROM base AS builder

# 依存関係ファイルをコピー
COPY package.json package-lock.json* ./

# プロダクション用の依存関係のみをインストール - legacy-peer-depsフラグを追加
RUN npm ci --production --legacy-peer-deps

# アプリケーションのソースをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# プロダクションステージ
FROM base AS production

# 環境変数の設定
ENV NODE_ENV=production

# ビルドステージから必要なファイルをコピー
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# セキュリティのために非rootユーザーに切り替え
USER node

# プロダクションサーバーのポートを公開
EXPOSE 3000

# プロダクションモードでサーバーを起動
CMD ["npm", "start"]