# 公開版デバイスカタログ ナビゲーション設定ガイド

## 概要
Phase 7で実装した公開版デバイスカタログ（`/device`）へのナビゲーションリンクを追加する方法。

## 推奨リンク配置場所

### 1. メインナビゲーション
既存のヘッダーやサイドバーに以下のリンクを追加：

```tsx
<Link href="/device">
  <Package className="h-4 w-4 mr-2" />
  デバイスカタログ
</Link>
```

### 2. ランディングページ
トップページに特集セクションとして追加：

```tsx
<section>
  <h2>人気のデバイス</h2>
  <PopularProducts products={popularProducts} />
  <Link href="/device">すべて見る</Link>
</section>
```

### 3. ユーザーダッシュボード
ユーザーのデバイス管理ページから公開カタログへのリンク：

```tsx
<Button asChild variant="outline">
  <Link href="/device">
    公開デバイスカタログを見る
  </Link>
</Button>
```

### 4. フッター
フッターメニューに追加：

```tsx
<div>
  <h3>デバイス情報</h3>
  <ul>
    <li><Link href="/device">デバイスカタログ</Link></li>
    <li><Link href="/device?category=mouse">マウス一覧</Link></li>
    <li><Link href="/device?category=keyboard">キーボード一覧</Link></li>
  </ul>
</div>
```

## メタデータの設定

### SEO対策
`app/(device)/device/page.tsx`にメタデータを追加：

```tsx
export const metadata: Metadata = {
  title: "デバイスカタログ - 配信者・VTuber向けデバイス情報",
  description: "プロの配信者やVTuberが使用している高品質なデバイスを厳選。マウス、キーボードなど、配信環境を向上させるデバイス情報をご紹介。",
  openGraph: {
    title: "デバイスカタログ",
    description: "配信者・VTuber向けデバイス情報",
    type: "website",
  },
};
```

## アクセス制御

公開ページのため、特別なアクセス制御は不要ですが、以下の点に注意：

1. **アフィリエイトリンク**: 管理者のアフィリエイトIDを使用
2. **キャッシュ**: 5分〜1時間のキャッシュを設定済み
3. **レート制限**: 必要に応じて実装を検討

## 今後の拡張案

1. **OGP画像の動的生成**: カテゴリごとのOGP画像
2. **RSS/Atom フィード**: 新商品の配信
3. **検索エンジン最適化**: サイトマップの生成
4. **PWA対応**: オフライン閲覧機能
