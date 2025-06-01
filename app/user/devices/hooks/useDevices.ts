/**
 * デバイス一覧取得用のカスタムフック
 */

import useSWR from 'swr';
import type { DevicesResponse } from '../types';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch devices');
  }
  return response.json();
};

interface UseDevicesOptions {
  category?: 'all' | 'mouse' | 'keyboard';
  deviceType?: 'all' | 'OFFICIAL' | 'CUSTOM';
  page?: number;
  limit?: number;
}

export function useDevices(options: UseDevicesOptions = {}) {
  const {
    category = 'all',
    deviceType = 'all',
    page = 1,
    limit = 20,
  } = options;

  const params = new URLSearchParams({
    category,
    deviceType,
    page: page.toString(),
    limit: limit.toString(),
  });

  const { data, error, isLoading, mutate } = useSWR<DevicesResponse>(
    `/api/devices?${params}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    devices: data?.devices || [],
    pagination: data?.pagination || {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
    isLoading,
    error,
    refresh: mutate,
  };
}
