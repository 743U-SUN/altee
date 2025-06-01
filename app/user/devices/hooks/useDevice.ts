/**
 * 個別デバイス操作用のカスタムフック
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
      const body = data.type === 'official'
        ? { productId: data.productId, note: data.note }
        : { 
            amazonUrl: data.amazonUrl,
            category: data.category,
            note: data.note,
            userAssociateId: data.userAssociateId,
          };

      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add device');
      }

      toast.success('デバイスを追加しました');
      router.refresh();
      return await response.json();
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
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update device');
      }

      toast.success('デバイスを更新しました');
      router.refresh();
      return await response.json();
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
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete device');
      }

      toast.success('デバイスを削除しました');
      router.refresh();
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
