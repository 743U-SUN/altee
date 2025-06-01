export default function ArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">記事 Dashboard</h1>
        <p className="text-muted-foreground">
          記事・ブログ・コンテンツ管理システムです。
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">ブログ</h3>
          <p className="text-sm text-muted-foreground">ブログ記事の閲覧</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">法律</h3>
          <p className="text-sm text-muted-foreground">法律関連記事</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-2xl font-semibold">料理</h3>
          <p className="text-sm text-muted-foreground">料理・レシピ記事</p>
        </div>
      </div>
    </div>
  );
}