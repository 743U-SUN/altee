/**
 * ユーザープロフィールページ - デバイス表示（統一表示UI対応）
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getUserDevices } from '@/lib/actions/device-actions';
import { formatDevicesForDisplay } from '@/lib/utils/device/format';
import { UnifiedDeviceCard } from '@/components/devices/UnifiedDeviceCard';
import { DeviceIcon } from '@/components/devices/DeviceIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DevicePageProps {
  params: Promise<{ handle: string }>;
}

function DeviceListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <Skeleton className="h-[200px] w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function DeviceList({ userId }: { userId: string }) {
  const devices = await getUserDevices(userId);
  const displayDevices = formatDevicesForDisplay(devices);

  if (displayDevices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">まだデバイスが登録されていません</p>
      </div>
    );
  }

  // カテゴリごとにグループ化
  const devicesByCategory = displayDevices.reduce((acc, device) => {
    const category = device.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(device);
    return acc;
  }, {} as Record<string, typeof displayDevices>);

  // カテゴリ名の日本語化
  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      mouse: 'マウス',
      keyboard: 'キーボード',
      headset: 'ヘッドセット',
      microphone: 'マイク',
      monitor: 'モニター',
      capture_board: 'キャプチャーボード',
      stream_deck: 'Stream Deck',
      chair: 'チェア',
      desk: 'デスク',
    };
    return categoryNames[category] || category;
  };

  const categories = Object.keys(devicesByCategory);
  const hasMultipleCategories = categories.length > 1;

  // 単一カテゴリの場合はそのまま表示
  if (!hasMultipleCategories) {
    const category = categories[0];
    const categoryDevices = devicesByCategory[category];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DeviceIcon category={category} className="h-6 w-6" />
          <h2 className="text-xl font-semibold">{getCategoryName(category)}</h2>
          <Badge variant="outline" className="ml-2">
            {categoryDevices.length}件
          </Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryDevices.map((device) => (
            <UnifiedDeviceCard
              key={device.id}
              device={device}
              showNote={true}
              compact={false}
            />
          ))}
        </div>
      </div>
    );
  }

  // 複数カテゴリの場合はタブで表示
  return (
    <Tabs defaultValue={categories[0]} className="w-full">
      <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
        {categories.map((category) => (
          <TabsTrigger key={category} value={category} className="flex items-center gap-2">
            <DeviceIcon category={category} className="h-4 w-4" />
            <span>{getCategoryName(category)}</span>
            <Badge variant="outline" className="ml-1 h-5 px-1">
              {devicesByCategory[category].length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((category) => (
        <TabsContent key={category} value={category} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {devicesByCategory[category].map((device) => (
              <UnifiedDeviceCard
                key={device.id}
                device={device}
                showNote={true}
                compact={false}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default async function DevicePage({ params }: DevicePageProps) {
  const { handle } = await params;

  // ユーザー情報を取得
  const user = await prisma.user.findUnique({
    where: { handle },
    select: {
      id: true,
      name: true,
      characterName: true,
      handle: true,
      displaySettings: {
        select: {
          displayDevice: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // デバイス表示が無効の場合
  if (user.displaySettings && !user.displaySettings.displayDevice) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              デバイス情報は非公開に設定されています
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = user.characterName || user.name || user.handle;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{displayName}の使用デバイス</h1>
        <p className="text-muted-foreground">
          配信や作業で使用しているデバイスを紹介します
        </p>
      </div>

      <Suspense fallback={<DeviceListSkeleton />}>
        <DeviceList userId={user.id} />
      </Suspense>
    </div>
  );
}
