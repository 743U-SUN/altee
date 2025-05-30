/**
 * デバイスカードコンポーネント
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Edit2, 
  Trash2, 
  ExternalLink, 
  MoreVertical,
  Mouse,
  Keyboard 
} from 'lucide-react';
import { EditDeviceModal } from './EditDeviceModal';
import { DeleteDeviceDialog } from './DeleteDeviceDialog';
import type { DisplayDevice } from '@/types/device';

interface DeviceCardProps {
  device: DisplayDevice;
  deviceId: number;
}

export function DeviceCard({ device, deviceId }: DeviceCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // カテゴリアイコンを取得
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mouse':
        return <Mouse className="h-4 w-4" />;
      case 'keyboard':
        return <Keyboard className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // カテゴリ名を取得
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'mouse':
        return 'マウス';
      case 'keyboard':
        return 'キーボード';
      default:
        return category;
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative aspect-square bg-muted">
            <OptimizedImage
              src={convertToProxyUrl(device.imageUrl)}
              alt={device.title}
              fill
              className="object-contain p-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/no-image.png';
              }}
            />
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-2">{device.title}</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              {getCategoryIcon(device.category)}
              {getCategoryName(device.category)}
            </Badge>
            <Badge variant={device.sourceType === 'official' ? 'default' : 'secondary'}>
              {device.sourceType === 'official' ? '公式' : 'カスタム'}
            </Badge>
          </div>

          {device.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {device.description}
            </p>
          )}

          {device.note && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">メモ:</span> {device.note}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <a
              href={device.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              Amazonで見る
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      </Card>

      {/* 編集モーダル */}
      <EditDeviceModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        deviceId={deviceId}
        currentNote={device.note}
      />

      {/* 削除確認ダイアログ */}
      <DeleteDeviceDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        deviceId={deviceId}
        deviceName={device.title}
      />
    </>
  );
}
