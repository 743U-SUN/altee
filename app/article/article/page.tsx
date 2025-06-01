import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileTextIcon } from "lucide-react";

export default function ArticlePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <FileTextIcon className="h-8 w-8 text-amber-500" />
        <h1 className="text-3xl font-bold">記事ページ</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>記事セクション</CardTitle>
          <CardDescription>このページは記事用のレイアウトを使用しています</CardDescription>
        </CardHeader>
        <CardContent>
          <p>ここでは記事関連のコンテンツが表示されます。このページ表示時は:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>セカンドサイドバーの幅が <strong>480px</strong> に設定されています</li>
            <li>記事専用のサイドバーコンポーネントが使用されています</li>
            <li>琥珀色のテーマカラーが適用されています</li>
            <li>ファーストサイドバーのアイコンも記事用に切り替わっています</li>
            <li>ルートグループによる分離がされているため、条件分岐が少なくなっています</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}