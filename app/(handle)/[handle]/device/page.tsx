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
import { DeviceFilterClient } from './DeviceFilterClient';

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

  return <DeviceFilterClient devices={displayDevices} />;
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
