"use client"

import { useSession } from "next-auth/react"
import { InfoCategoryManager } from "./components/InfoCategoryManager"

export default function InfoPage() {
  const { data: session } = useSession();

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">インフォ設定</h1>
        <p className="text-gray-600">ログインが必要です。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-0 md:px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">インフォ設定</h1>
      <InfoCategoryManager userId={session.user.id} />
    </div>
  );
}
