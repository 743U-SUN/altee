"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function LoginStatus() {
  const { data: session, status } = useSession();
  
  // デバッグ用：セッション状態をコンソールに出力
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="p-4 mb-6 rounded-md bg-muted">
        <p className="text-center">ログイン状態を確認中...</p>
      </div>
    );
  }

  if (session) {
    return (
      <div className="p-4 mb-6 rounded-md bg-green-50 dark:bg-green-900/20">
        <div className="flex flex-col gap-4 items-center">
          <div className="text-center">
            <p className="font-medium">ログインしています</p>
            <p className="text-sm text-muted-foreground mt-1">
              {session.user?.name || session.user?.email}
            </p>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            ログアウト
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mb-6 rounded-md bg-muted">
      <p className="text-center">ログインしていません</p>
    </div>
  );
}
