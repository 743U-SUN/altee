今回は、app/article/という様々な記事を書いていくところを作っていこうと思う。

app/article/の中では、様々なジャンルを取り扱っていこうと思っているのだけれど、カテゴリー分けをしていこうと思っているのね

/article                         # メインブログページ
/article/[slug]                  # 個別記事
/article/category/[categorySlug] # カテゴリ別記事一覧
/article/tag/[tagSlug]           # タグ別記事一覧
/article/author/[authorSlug]     # 著者別記事一覧
/article/archive                 # アーカイブインデックス
/article/archive/[year]          # 年別アーカイブ
/article/archive/[year]/[month]  # 月別アーカイブ

こんな感じで分けようと思っているのだけれど、どうだろうか？

まずはprismaスキーマを追加していきたいので、現在のPrismaスキーマを確認して欲しい。また、AuthorはUserと関連付けたいのでそのあたりも考慮して欲しい。

1. 現在どのような構造になっているのかを調べる。
2. Prismaスキーマに加えるものを考える。
3. いったん私に説明する。実際のファイルを作ったり編集するのはまだ禁止。

この手順でお願いします。