/**
 * デバイス管理ページ
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ensureUserExists } from '@/lib/actions/user-actions';
import { getUserDevices } from '@/lib/actions/device-actions';
import { DeviceList } from './components/DeviceList';
import { AddDeviceForm } from './components/AddDeviceForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'デバイス管理',
  description: '使用しているデバイスを管理',
};

function DeviceListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

export default async function DevicesPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  try {
    // ユーザーの存在確認・作成
    const user = await ensureUserExists();
    
    // デバイス一覧を取得
    const devices = await getUserDevices(user.id);

    return (
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">デバイス管理</h1>
          <p className="text-muted-foreground mt-2">
            使用しているデバイスを登録・管理できます
          </p>
        </div>

        <Tabs defaultValue="devices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="devices">マイデバイス</TabsTrigger>
            <TabsTrigger value="add">デバイスを追加</TabsTrigger>
          </TabsList>

          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>登録済みデバイス</CardTitle>
                <CardDescription>
                  あなたが使用しているデバイスの一覧です
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<DeviceListSkeleton />}>
                  <DeviceList initialDevices={devices} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>デバイスを追加</CardTitle>
                <CardDescription>
                  公式リストから選択するか、Amazon URLを入力してデバイスを追加できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddDeviceForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('Error in DevicesPage:', error);
    
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 text-lg font-semibold mb-2">
            エラーが発生しました
          </h2>
          <p className="text-red-700">
            デバイス管理ページの読み込み中にエラーが発生しました。
            ページを再読み込みしてください。
          </p>
          <details className="mt-4">
            <summary className="text-red-600 cursor-pointer">詳細情報</summary>
            <pre className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded">
              {error instanceof Error ? error.message : '不明なエラー'}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}