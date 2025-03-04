FROM node:22-alpine

WORKDIR /app

# 初めに全コードをコピー
COPY . .

# 依存関係をインストール
# package.jsonがない場合はここで作成
RUN if [ ! -f package.json ]; then \
    echo '{"name":"blog-nextjs-app","version":"1.0.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start"}}' > package.json && \
    npm install next react react-dom && \
    npm install -D typescript @types/node @types/react @types/react-dom eslint && \
    npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-src-dir --skip-git; \
    else \
    npm ci; \
    fi

# アプリをビルド (package.jsonとnext.config.jsが存在する場合のみ)
RUN if [ -f package.json ] && [ -f next.config.js ]; then npm run build; fi

# アプリの起動
CMD ["npm", "run", "dev"]