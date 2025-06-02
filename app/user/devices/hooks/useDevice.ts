/**
 * 個別デバイス操作用のカスタムフック
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  createDeviceFromProduct, 
  createDeviceFromUrl, 
  updateUserDevice, 
  deleteUserDevice 
} from '@/lib/actions/device-actions';
import type { DeviceWithProduct } from '../types';

export function useDevice() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const addDevice = async (data: {
    type: 'official' | 'custom';
    productId?: number;
    amazonUrl?: string;
    category?: 'mouse' | 'keyboard';
    note?: string;
    userAssociateId?: string;
  }) => {
    setIsLoading(true);
    try {
      let result;
      
      if (data.type === 'official') {
        result = await createDeviceFromProduct({
          productId: data.productId!,
          note: data.note
        });
      } else {
        result = await createDeviceFromUrl({
          amazonUrl: data.amazonUrl!,
          category: data.category!,
          note: data.note,
          userAssociateId: data.userAssociateId
        });
      }

      if (result.success) {
        toast.success('デバイスを追加しました');
        router.refresh();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add device');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDevice = async (deviceId: number, data: { note?: string }) => {
    setIsLoading(true);
    try {
      const result = await updateUserDevice(deviceId, data);

      if (result.success) {
        toast.success('デバイスを更新しました');
        router.refresh();
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update device');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDevice = async (deviceId: number) => {
    setIsLoading(true);
    try {
      const result = await deleteUserDevice(deviceId);

      if (result.success) {
        toast.success('デバイスを削除しました');
        router.refresh();
      } else {
        throw new Error(result.error || 'Failed to delete device');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDevice,
    updateDevice,
    deleteDevice,
    isLoading,
  };
}
