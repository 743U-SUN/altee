import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutTemplateIcon } from "lucide-react";

export default function SamplePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <LayoutTemplateIcon className="h-8 w-8 text-cyan-500" />
        <h1 className="text-3xl font-bold">サンプルページ</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>サンプルセクション</CardTitle>
          <CardDescription>このページはサンプル用のレイアウトを使用しています</CardDescription>
        </CardHeader>
        <CardContent>
          <p>ここではサンプル関連のコンテンツが表示されます。このページ表示時は:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>セカンドサイドバーの幅は <strong>360px</strong> のままです</li>
            <li>サンプル専用のサイドバーコンポーネントが使用されています</li>
            <li>シアン色のテーマカラーが適用されています</li>
            <li>ファーストサイドバーのアイコンもサンプル用に切り替わっています</li>
            <li>ルートグループによる分離がされているため、条件分岐が少なくなっています</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}