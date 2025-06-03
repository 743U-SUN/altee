# Markdown Preview ガイド

## 概要

このマークダウンプレビュー機能は、リアルタイムでマークダウンテキストをHTMLに変換してプレビューできるツールです。GitHub風のスタイルと絵文字サポートを提供し、データベースへの切り替えも簡単に行えるように設計されています。

## 機能

- **リアルタイムプレビュー**: タブ切り替え式でエディタとプレビューを表示
- **GitHub風記法**: テーブル、チェックボックス、取り消し線などをサポート
- **絵文字サポート**: `:smile:` → 😄 などの変換
- **シンタックスハイライト**: コードブロックの美しい表示
- **自動保存**: 1秒間の入力停止後に自動でLocalStorageに保存
- **インポート/エクスポート**: .mdファイルの読み込みと書き出し
- **データベース対応準備済み**: 簡単にDBに切り替え可能

## 使い方

### 基本操作

1. **エディタモード**: マークダウンテキストを入力
2. **プレビューモード**: タブを切り替えてHTML表示を確認
3. **保存**: 自動保存またはSaveボタンで手動保存
4. **インポート**: Import ボタンで.mdファイルを読み込み
5. **エクスポート**: Export ボタンで.mdファイルをダウンロード
6. **クリア**: Clear ボタンで全内容を削除

### サポートするマークダウン記法

#### 基本記法
```markdown
# 見出し1
## 見出し2
### 見出し3

**太字** *斜体* ~~取り消し線~~

- リスト項目1
- リスト項目2

1. 番号付きリスト
2. 項目2

[リンク](https://example.com)

![画像](https://example.com/image.png)
```

#### GitHub風拡張記法
```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| データ1 | データ2 | データ3 |

- [x] 完了したタスク
- [ ] 未完了のタスク

```javascript
function hello() {
  console.log("Hello, World!");
}
```

:smile: :heart: :thumbsup: (絵文字)
```

## アーキテクチャ

### ディレクトリ構造
```
app/mdpreview/
├── page.tsx              # メインページ
├── components/           # UI コンポーネント
│   ├── MarkdownWorkspace.tsx
│   ├── MarkdownEditor.tsx
│   ├── MarkdownPreview.tsx
│   └── TabNavigation.tsx
├── hooks/               # カスタムフック
│   ├── useMarkdownStorage.ts
│   └── useTabState.ts
├── lib/                 # ユーティリティ
│   ├── markdown-processor.ts
│   ├── storage-adapter.ts
│   └── server-actions.ts
├── types/               # 型定義
│   └── index.ts
└── mdpreview-guide.md   # このガイド
```

### 主要コンポーネント

- **MarkdownWorkspace**: メインコンテナ
- **TabNavigation**: エディタ/プレビュー切り替え
- **MarkdownEditor**: テキスト入力エリア
- **MarkdownPreview**: HTML変換結果表示

### カスタムフック

- **useMarkdownStorage**: データ永続化（自動保存、手動保存、読み込み）
- **useTabState**: URL状態管理（nuqs使用）

## データベースへの切り替え方法

現在はLocalStorageを使用していますが、以下の手順でデータベースに切り替えできます：

### 1. データベースモデルの設定

Prisma使用例：
```prisma
model MarkdownDocument {
  id          String   @id @default(cuid())
  title       String?
  content     String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2. Server Actionsの実装

`lib/server-actions.ts` を以下のように実装：

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { DatabaseDocument } from '../types'

export async function createDocument(
  content: string, 
  title?: string
): Promise<DatabaseDocument> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const document = await prisma.markdownDocument.create({
    data: {
      content,
      title: title || 'Untitled',
      userId: session.user.id
    }
  })

  return {
    id: document.id,
    title: document.title,
    content: document.content,
    userId: document.userId,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    lastModified: document.updatedAt
  }
}

// updateDocument, getDocument, deleteDocument, listDocuments も同様に実装
```

### 3. DatabaseAdapterの実装

`lib/storage-adapter.ts` の DatabaseAdapter を実装：

```typescript
import { createDocument, updateDocument, getDocument } from './server-actions'

export class DatabaseAdapter implements StorageAdapter {
  constructor(private documentId?: string) {}

  async save(content: string): Promise<void> {
    if (this.documentId) {
      await updateDocument(this.documentId, content)
    } else {
      const doc = await createDocument(content)
      this.documentId = doc.id
    }
  }

  async load(): Promise<string> {
    if (!this.documentId) return ''
    const doc = await getDocument(this.documentId)
    return doc?.content || ''
  }

  async clear(): Promise<void> {
    if (this.documentId) {
      await deleteDocument(this.documentId)
      this.documentId = undefined
    }
  }
}
```

### 4. アダプター切り替え

`lib/storage-adapter.ts` の `createStorageAdapter` 関数を修正：

```typescript
export function createStorageAdapter(documentId?: string): StorageAdapter {
  // 環境変数や設定で切り替え
  const useDatabase = process.env.NEXT_PUBLIC_USE_DATABASE === 'true'
  
  if (useDatabase) {
    return new DatabaseAdapter(documentId)
  }
  return new LocalStorageAdapter()
}
```

## 開発・カスタマイズ

### スタイルのカスタマイズ

プレビューのスタイルは `MarkdownPreview.tsx` の `prose` クラスで制御されています：

```tsx
<div className="prose prose-sm max-w-none dark:prose-invert">
  {/* マークダウンコンテンツ */}
</div>
```

### シンタックスハイライトテーマの変更

`MarkdownPreview.tsx` でテーマを変更：

```tsx
import { github, githubDark, vs, vsDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// テーマの切り替え
const theme = isDarkMode ? githubDark : github
```

### プラグインの追加

新しいremark/rehypeプラグインを追加する場合：

1. パッケージをインストール
2. `MarkdownPreview.tsx` でインポート・設定
3. `lib/markdown-processor.ts` で設定を管理

## トラブルシューティング

### よくある問題

1. **保存されない**: ブラウザのLocalStorageが無効になっている可能性
2. **プレビューが表示されない**: react-markdownの依存関係を確認
3. **シンタックスハイライトが効かない**: 言語名とハイライターのサポート言語を確認

### デバッグ

開発者ツールのConsoleでLocalStorageの内容を確認：
```javascript
localStorage.getItem('mdpreview-content')
```

## 他プロジェクトでの使用

このモジュールは他のNext.jsプロジェクトでも簡単に使用できます：

1. `app/mdpreview/` ディレクトリをコピー
2. 必要なパッケージをインストール：
   ```bash
   npm install react-markdown remark-gfm remark-emoji react-syntax-highlighter rehype-sanitize nuqs
   ```
3. shadcn/uiコンポーネントが利用可能であることを確認
4. プロジェクトの要件に応じてアダプターを設定

## ライセンス

このコードはMITライセンスの下で自由に使用・改変できます。