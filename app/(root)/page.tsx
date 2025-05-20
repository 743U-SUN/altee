import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LayoutTemplate } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Alteeアプリケーション</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="overflow-hidden">
          <CardHeader className="bg-amber-50">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-600" />
              <CardTitle>記事セクション</CardTitle>
            </div>
            <CardDescription>記事関連のコンテンツを管理するセクション</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>記事セクションでは、ブログ記事、法律文書、料理レシピなどの様々なコンテンツを管理できます。記事特有のナビゲーションとサイドバーが表示されます。</p>
            <ul className="list-disc pl-6 mt-2">
              <li>セカンドサイドバーの幅: <strong>480px</strong></li>
              <li>琥珀色のテーマカラー</li>
              <li>記事特有のナビゲーションメニュー</li>
            </ul>
          </CardContent>
          <CardFooter className="bg-amber-50/50 flex justify-end">
            <Link href="/article" className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition">
              記事セクションへ移動
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-cyan-50">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="h-6 w-6 text-cyan-600" />
              <CardTitle>サンプルセクション</CardTitle>
            </div>
            <CardDescription>サンプル関連のコンテンツを管理するセクション</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>サンプルセクションでは、実験データ、目標設定、統計情報などのサンプルコンテンツを管理できます。サンプル特有のナビゲーションとサイドバーが表示されます。</p>
            <ul className="list-disc pl-6 mt-2">
              <li>セカンドサイドバーの幅: <strong>360px</strong></li>
              <li>シアン色のテーマカラー</li>
              <li>サンプル特有のナビゲーションメニュー</li>
            </ul>
          </CardContent>
          <CardFooter className="bg-cyan-50/50 flex justify-end">
            <Link href="/sample" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition">
              サンプルセクションへ移動
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">実装の特徴</h2>
        <p className="mb-4">このアプリケーションは、Next.jsのルートグループ機能を使用して、異なるセクションごとに独立したレイアウトを実現しています：</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>セクションごとに<code>(article)</code>や<code>(sample)</code>というルートグループを作成</li>
          <li>各グループ内に専用のレイアウトファイル<code>layout.tsx</code>を配置</li>
          <li>レイアウトファイルでサイドバーの幅やデザインを設定</li>
          <li>各セクション専用のコンポーネントを配置</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">この実装により、条件分岐のコードが少なくなり、ファイル構造だけでレイアウトが分離されるため、コードの可読性と保守性が向上します。</p>
      </div>
    </div>
  );
}
