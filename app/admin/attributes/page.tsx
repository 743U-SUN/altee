'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Package, Palette } from 'lucide-react';
import Link from 'next/link';

export default function AttributesPage() {
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
              <Button className="w-full">
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
              <Button className="w-full">
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
              <Button className="w-full">
                カラー管理を開く
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}