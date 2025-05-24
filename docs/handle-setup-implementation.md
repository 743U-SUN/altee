# Handle Setup Implementation

## 実装内容

### 1. データベース変更
- `User`モデルに以下のフィールドを追加：
  - `handleChangeCount`: ハンドル変更回数（履歴）
  - `handleChangeTokens`: ハンドル変更可能回数（トークン制）
  - `isPremiumUser`: プレミアムユーザーフラグ

### 2. ページ構造
```
app/(article)/login/welcome/
├── components/
│   ├── HandleSetupForm.tsx    # ハンドル設定フォーム
│   └── index.ts               # エクスポート管理
├── types/
│   └── index.ts               # 型定義
├── utils/
│   └── handleValidation.ts    # バリデーション関数
└── page.tsx                   # メインページ
```

### 3. API Routes
```
app/api/user/handle/
├── check/
│   └── route.ts               # ハンドル重複チェック
└── update/
    └── route.ts               # ハンドル更新
```

### 4. 実装された機能

#### ハンドルバリデーション
- 長さチェック（3-20文字）
- 使用可能文字チェック（英数字、_, -のみ）
- 予約語チェック
- 重複チェック（リアルタイム）

#### 認証フロー
1. 初回ログイン時：`temp_xxx`ハンドルが自動生成
2. `temp_`ハンドルユーザーは自動的に`/login/welcome`にリダイレクト
3. ハンドル設定完了後は`/user`ページにリダイレクト
4. 既存ユーザーが`/login/welcome`にアクセスすると`/user`にリダイレクト

#### ハンドル変更制御
- 初期：1回の変更可能トークンを所持
- 変更時：トークンを消費（-1）
- 課金時：トークンを追加（+1）
- 管理者：トークン数を直接操作可能

### 5. 技術的特徴
- **リアルタイムバリデーション**: デバウンス処理付き
- **セキュリティ**: 認証確認、入力サニタイゼーション
- **UX**: ローディング状態、成功/エラーメッセージ
- **型安全性**: TypeScript完全対応

### 6. 使用技術
- Next.js 15 + React 19
- NextAuth.js v5
- Prisma ORM
- React Hook Form + Zod
- shadcn/ui

## 実行手順

### データベース更新
```bash
npx prisma db push
```

### 開発サーバー起動
```bash
npm run dev
```

## 動作確認
1. 新規ユーザーでログイン
2. 自動的に`/login/welcome`ページにリダイレクト
3. ハンドルを入力してリアルタイムバリデーション確認
4. 「ハンドルを設定する」ボタンで設定完了
5. `/user`ページにリダイレクト
