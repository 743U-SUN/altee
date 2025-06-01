"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function LoginStatus() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoadingDebug, setIsLoadingDebug] = useState(false);
  
  // デバッグ用：セッション状態をコンソールに出力
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("User handle:", session?.user?.handle);
    console.log("User role:", session?.user?.role);
    console.log("Handle change tokens:", session?.user?.handleChangeTokens);
  }, [session, status]);

  // デバッグ情報を取得
  const fetchDebugInfo = async () => {
    setIsLoadingDebug(true);
    try {
      const response = await fetch('/api/debug/session');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Debug info fetch error:', error);
    } finally {
      setIsLoadingDebug(false);
    }
  };

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
            <p className="text-xs text-muted-foreground mt-1">
              Handle: {session.user?.handle || '未設定'} | Role: {session.user?.role || '未設定'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchDebugInfo}
              disabled={isLoadingDebug}
            >
              {isLoadingDebug ? '読み込み中...' : 'デバッグ情報'}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              ログアウト
            </Button>
          </div>
          {debugInfo && (
            <div className="mt-4 p-3 bg-muted rounded text-xs w-full max-w-md">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
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
