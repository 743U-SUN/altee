# Next.jsプロジェクトディレクトリ構造ガイドライン

このプロジェクトでは、「ページ共存型」ディレクトリ構造を採用しています。
このドキュメントは、コードの配置ルールを定義し、一貫性のある開発を促進するためのものです。

## 基本原則

1. ページ中心の組織化: 各ページとそれに関連するコンポーネント・ロジックは同じディレクトリに配置します
2. 共有リソースの分離: 複数ページで使用されるコンポーネントは共有ディレクトリに配置します
3. 明確な命名規則: ファイル名はその役割と所属を明確に示すようにします

## ディレクトリ構造の例

app/
├── blog/                  # ブログページ関連
│   ├── components/        # ブログページ専用コンポーネント
│   │   ├── BlogCard.tsx   # ブログカードコンポーネント
│   │   ├── BlogList.tsx   # ブログリストコンポーネント
│   │   └── index.ts       # エクスポート定義
│   ├── hooks/             # ブログページ専用フック
│   │   ├── useBlog.ts     # ブログデータ取得フック
│   │   └── index.ts       # フックエクスポート定義
│   ├── types/             # ブログページ専用型定義
│   │   └── index.ts       # 型定義エクスポート
│   ├── [blogId]/          # 個別ブログページ
│   │   └── page.tsx       # 個別ブログページコンポーネント
│   └── page.tsx           # ブログ一覧ページコンポーネント
├── components/            # 共有コンポーネント
│   ├── ui/                # 基本UI要素
│   │   ├── button.tsx     # ボタンコンポーネント
│   │   ├── input.tsx      # 入力コンポーネント
│   │   ├── sidebar.tsx    # サイドバーコンポーネント
│   │   └── index.ts       # UI要素エクスポート定義
│   ├── layouts/           # レイアウト関連
│   │   ├── header.tsx     # ヘッダーコンポーネント
│   │   ├── footer.tsx     # フッターコンポーネント
│   │   └── index.ts       # レイアウト要素エクスポート定義
│   ├── app-sidebar.tsx    # アプリケーション用サイドバーコンポーネント
│   └── index.ts           # 共有コンポーネント全体のエクスポート
└── api/                   # APIルート
    └── blog/              # ブログ関連API
        └── route.ts       # ブログデータAPI
        
### ページごとのディレクトリ構造の例

blog/
├── components/       # UIコンポーネント
├── hooks/            # カスタムReactフック
├── types/            # TypeScript型定義
├── store/            # 状態管理ストア（Zustand）
├── utils/            # ユーティリティ関数
├── constants/        # 定数定義
├── services/         # APIサービス
├── contexts/         # React Context
├── schemas/          # バリデーションスキーマ
├── styles/           # スタイル関連
├── skeletons/        # ローディングスケルトン
├── loading.tsx       # ページローディングUI
├── [blogId]/         # 動的ルート
│   ├── loading.tsx   # 個別ブログページのローディングUI
│   └── page.tsx
└── page.tsx          # メインページ

## 配置ルール

### 1. コンポーネントの配置

以下の決定木に従ってコンポーネントを配置します：

```
コンポーネントは1つのページでのみ使用されますか？
├── はい → そのページディレクトリの components/ に配置
└── いいえ → 複数のページで使用されますか？
    ├── はい → アプリ全体で使用されますか？
    │   ├── はい → /components/ui/ または適切なサブディレクトリに配置
    │   └── いいえ → 特定の機能グループ内でのみ共有されますか？
    │       ├── はい → それらのページの親となる共有ディレクトリを作成して配置
    │       └── いいえ → /components/ の適切なサブディレクトリに配置
    └── いいえ → 将来的に再利用される可能性がありますか？
        ├── はい → /components/ の適切なサブディレクトリに配置
        └── いいえ → そのページディレクトリの components/ に配置
```

### 2. 状態管理の配置

状態管理コードは以下の決定木に従って配置します：

```
状態管理はどのタイプですか？
├── React Context → そのページディレクトリの contexts/ に配置
├── Zustand/Redux/Jotaiなどの外部ライブラリ → そのページディレクトリの store/ に配置
├── ページ固有のフック → そのページディレクトリの hooks/ に配置
└── アプリ全体で共有される状態 → 
    ├── React Context → /contexts/ ディレクトリに配置
    └── 外部ライブラリ → /store/ ディレクトリに配置
```

### 3. 命名規則

- **ページコンポーネント**: `page.tsx`（Next.jsの規約に従う）
- **ページ固有コンポーネント**: ページ名をプレフィックスとして使用（例：`BlogCard.tsx`）
- **共有コンポーネント**: 機能を表す名前（例：`Button.tsx`、`Dropdown.tsx`）
- **フック**: `use`プレフィックス（例：`useBlog.ts`、`useAuth.ts`）
- **ストア**: 機能名+`Store`サフィックス（例：`todoStore.ts`、`authStore.ts`）

### 4. インポート・エクスポートパターン

#### エクスポート方法

各ディレクトリのコンポーネントは `index.ts` ファイルで一元的にエクスポートします：

```tsx
// blog/components/index.ts
export { default as BlogCard } from './BlogCard';
export { default as BlogList } from './BlogList';
export { default as BlogImage } from './BlogImage';
```

#### インポートと使用方法

コンポーネントをインポートする際は、名前空間（ネームスペース）パターンを使用します：

**ページ固有コンポーネント**：相対パスを使用
  ```tsx
  // 名前空間インポート（推奨）
  import * as BlogCon from '../components';
  
  // 使用例
  <BlogCon.BlogCard />
  <BlogCon.BlogList />
  ```

**共有コンポーネント**：エイリアスパスを使用
  ```tsx
  // 名前空間インポート（推奨）
  import * as UICon from '@/components/ui';
  
  // 使用例
  <UICon.Button />
  <UICon.Input />
  ```

#### 名前空間の命名規則

モジュール名前空間には、以下の命名規則を使用します：

1. モジュール/機能名を先頭につける
2. `Con`（Components）、`H`（Hooks）、`S`（Store）などの識別子を付加する
3. キャメルケースを使用する

例：
- コンポーネント: `BlogCon`、`AuthCon`、`ShopCon`
- フック: `BlogH`、`AuthH`
- ストア: `TodoS`、`AuthS`
- ユーティリティ: `BlogUtil`、`CommonUtil`

## 新規ページ作成テンプレート

新しいページを作成する際は、以下の構造をテンプレートとして使用します：

```
新規ページ名/
├── components/        # ページ専用コンポーネント
│   └── index.ts       # エクスポート定義
├── hooks/             # ページ専用フック（必要な場合）
├── store/             # ページ専用状態管理（必要な場合）
├── types/             # ページ専用型定義（必要な場合）
└── page.tsx           # ページコンポーネント
```