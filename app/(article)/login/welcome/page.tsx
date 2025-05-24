import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { HandleSetupForm } from "./components";
import { isTemporaryHandle } from "@/lib/validation/handleValidation";

export const metadata: Metadata = {
  title: "ようこそ | Altee",
  description: "Alteeへようこそ！ハンドルを設定してプロフィールを完成させましょう。",
};

export default async function WelcomePage() {
  // 認証確認
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  // 既にハンドルが設定済みの場合は /user にリダイレクト
  if (!isTemporaryHandle(session.user.handle)) {
    redirect("/user");
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ようこそ、Alteeへ！</h1>
          <p className="text-muted-foreground">
            プロフィールを完成させるために、あなた専用のハンドルを設定しましょう
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">ハンドルの設定</h2>
            <p className="text-sm text-muted-foreground">
              ハンドルはあなたの個人ページのURLの一部になります。<br />
              例: <code className="bg-muted px-1 py-0.5 rounded text-xs">altee.com/your_handle</code>
            </p>
          </div>

          <HandleSetupForm />

          <div className="mt-6 pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• ハンドルは一度だけ変更できます</p>
              <p>• 将来的にプレミアムプランで追加変更が可能になります</p>
              <p>• 慎重に選択してください</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
