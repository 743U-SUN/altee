import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookIcon } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <BookIcon className="h-8 w-8 text-amber-500" />
        <h1 className="text-3xl font-bold">ブログページ</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>ブログセクション</CardTitle>
          <CardDescription>このページは記事用のレイアウト内のブログページです</CardDescription>
        </CardHeader>
        <CardContent>
          <p>このページは記事レイアウトの配下にあるブログページです。ネストされたルーティングでも記事レイアウトが保持されます：</p>
          <ul className="list-disc pl-6 mt-2">
            <li>サイドバー幅：<strong>480px</strong>（記事用レイアウト）</li>
            <li>ファーストサイドバー：記事用のナビゲーションアイテム</li>
            <li>セカンドサイドバー：琥珀色のテーマカラー</li>
            <li>パンくずリスト：「記事 &gt ブログ」と表示される</li>
          </ul>
          <p className="mt-4">ルートグループのおかげで、条件分岐によるコードが不要になり、ファイル構造だけでレイアウトを制御できます。</p>
        </CardContent>
      </Card>
    </div>
  );
}