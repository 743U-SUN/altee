'use client';

import { useSession } from "next-auth/react"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, Package, Palette } from 'lucide-react';
import Link from 'next/link';

export default function AttributesPage() {
  const { data: session, status } = useSession();

  // Loading state - セキュリティガイド準拠
  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Unauthenticated state - セキュリティガイド準拠
  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">属性管理</h1>
          <p className="text-gray-600 mt-2">ログインが必要です。</p>
        </div>
      </div>
    );
  }

  // Admin role check - 管理者権限チェック
  if (session.user.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">属性管理</h1>
          <p className="text-gray-600 mt-2">管理者権限が必要です。</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">属性管理</h1>
        <p className="text-gray-600 mt-2">
          商品のメーカーとシリーズを管理します
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>メーカー管理</CardTitle>
            </div>
            <CardDescription>
              商品メーカーの情報を管理します。ロゴ、説明、公式サイトなどを設定できます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/attributes/manufacturers">
              <Button className="w-full hover:cursor-pointer">
                メーカー管理を開く
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>シリーズ管理</CardTitle>
            </div>
            <CardDescription>
              メーカーごとの商品シリーズを管理します。G PROシリーズやMXシリーズなど。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/attributes/series">
              <Button className="w-full hover:cursor-pointer">
                シリーズ管理を開く
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>カラー管理</CardTitle>
            </div>
            <CardDescription>
              商品のカラーバリエーションを管理します。ブラック、ホワイト、ピンクなど。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/attributes/colors">
              <Button className="w-full hover:cursor-pointer">
                カラー管理を開く
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}