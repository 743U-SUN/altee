/**
 * デバイス削除確認ダイアログコンポーネント
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteDevice } from '@/lib/actions/device-actions';

// デバッグ用: インポートされた関数を確認
if (typeof window !== 'undefined') {
  console.log('[DeleteDeviceDialog] deleteDevice function:', deleteDevice);
  console.log('[DeleteDeviceDialog] typeof deleteDevice:', typeof deleteDevice);
}

interface DeleteDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  deviceId: number;
  deviceName: string;
}

export function DeleteDeviceDialog({
  open,
  onClose,
  deviceId,
  deviceName,
}: DeleteDeviceDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  console.log('[DeleteDeviceDialog] Props:', { open, deviceId, deviceName, deviceIdType: typeof deviceId });

  const handleDelete = async () => {
    console.log('[DeleteDeviceDialog] handleDelete called, deviceId:', deviceId, 'type:', typeof deviceId);
    
    if (!deviceId || isNaN(deviceId)) {
      console.error('[DeleteDeviceDialog] Invalid deviceId:', deviceId);
      toast({
        title: 'エラー',
        description: '無効なデバイスIDです',
        variant: 'destructive',
      });
      return;
    }
    
    setIsDeleting(true);
    try {
      console.log('[DeleteDeviceDialog] Calling deleteDevice with:', deviceId);
      const result = await deleteDevice(deviceId);
      console.log('[DeleteDeviceDialog] deleteDevice returned:', { result, type: typeof result });

      // resultがundefinedまたはnullの場合の処理
      if (!result) {
        console.error('[DeleteDeviceDialog] No result returned from deleteDevice');
        toast({
          title: 'エラー',
          description: 'サーバーからの応答がありません',
          variant: 'destructive',
        });
        return;
      }

      if (result.success) {
        toast({
          title: '成功',
          description: 'デバイスを削除しました',
        });
        onClose();
        router.refresh();
      } else {
        console.error('[DeleteDeviceDialog] Delete failed:', result.error);
        toast({
          title: 'エラー',
          description: result.error || 'デバイスの削除に失敗しました',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[DeleteDeviceDialog] Caught error:', error);
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'デバイスの削除に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>デバイスを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{deviceName}」を削除します。この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? '削除中...' : '削除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
