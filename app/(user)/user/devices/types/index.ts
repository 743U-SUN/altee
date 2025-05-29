/**
 * デバイス管理ページ専用の型定義
 */

import type { Product, DeviceCategory, UserDevice } from '@/lib/generated/prisma';

// APIレスポンスの型
export interface DeviceWithProduct extends UserDevice {
  product?: Product & {
    category: DeviceCategory;
  };
}

export interface DevicesResponse {
  devices: DeviceWithProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeviceResponse {
  device: DeviceWithProduct;
}

// フォームの型
export interface AddDeviceFormData {
  type: 'official' | 'custom';
  productId?: number;
  amazonUrl?: string;
  category?: 'mouse' | 'keyboard';
  note?: string;
  userAssociateId?: string;
}

// UI状態の型
export interface DeviceListState {
  filter: {
    category: 'all' | 'mouse' | 'keyboard';
    deviceType: 'all' | 'OFFICIAL' | 'CUSTOM';
  };
  isLoading: boolean;
  error: string | null;
}

export interface DeviceCardProps {
  device: DeviceWithProduct;
  onEdit: (device: DeviceWithProduct) => void;
  onDelete: (device: DeviceWithProduct) => void;
}

export interface EditDeviceModalProps {
  device: DeviceWithProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceId: number, data: { note?: string }) => Promise<void>;
}

export interface DeleteDeviceDialogProps {
  device: DeviceWithProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deviceId: number) => Promise<void>;
}
