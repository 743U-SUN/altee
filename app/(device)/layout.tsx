import { ReactNode } from "react";

export default function DeviceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* シンプルなヘッダー */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">デバイスカタログ</h1>
              <p className="text-sm text-muted-foreground">
                配信者・VTuber向けデバイス情報
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* フッター */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 デバイスカタログ. 
            商品情報は定期的に更新されています。
          </p>
        </div>
      </footer>
    </div>
  );
}
