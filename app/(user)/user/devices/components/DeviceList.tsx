/**
 * デバイス一覧表示コンポーネント（統一表示UI対応）
 */

'use client';

import { useState } from 'react';
import { formatDevicesForDisplay } from '@/lib/utils/device/format';
import { UnifiedDeviceCard } from '@/components/devices/UnifiedDeviceCard';
import { DeviceComparison } from '@/components/devices/DeviceComparison';
import { EditDeviceModal } from './EditDeviceModal';
import { DeleteDeviceDialog } from './DeleteDeviceDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Scale, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DisplayDevice } from '@/types/device';

interface DeviceListProps {
  initialDevices: any[];
}

export function DeviceList({ initialDevices }: DeviceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const [editingDevice, setEditingDevice] = useState<{ id: number; note?: string } | null>(null);
  const [deletingDeviceId, setDeletingDeviceId] = useState<number | null>(null);

  // デバイスを表示用に変換
  const displayDevices: DisplayDevice[] = formatDevicesForDisplay(initialDevices);

  // フィルタリング
  const filteredDevices = displayDevices.filter(device => {
    const matchesSearch = device.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || device.category === categoryFilter;
    const matchesType = typeFilter === 'all' || device.sourceType === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // 選択の切り替え
  const toggleSelection = (deviceId: string) => {
    const newSelection = new Set(selectedDevices);
    if (newSelection.has(deviceId)) {
      newSelection.delete(deviceId);
    } else {
      newSelection.add(deviceId);
    }
    setSelectedDevices(newSelection);
  };

  // 選択をクリア
  const clearSelection = () => {
    setSelectedDevices(new Set());
  };

  // 比較対象のデバイスを取得
  const devicesToCompare = displayDevices.filter(device => 
    selectedDevices.has(device.id)
  );

  // デバイスIDを取得（編集・削除用）
  const getDeviceId = (displayId: string): number => {
    const id = parseInt(displayId.split('-')[1]);
    console.log('[DeviceList] getDeviceId:', { displayId, parsedId: id, isNaN: isNaN(id) });
    return id;
  };

  return (
    <div className="space-y-6">
      {/* フィルタとアクション */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search">検索</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="デバイス名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">カテゴリ</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="mouse">マウス</SelectItem>
                <SelectItem value="keyboard">キーボード</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">タイプ</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type">
                <SelectValue placeholder="タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="official">公式商品</SelectItem>
                <SelectItem value="custom">カスタム商品</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 比較機能 */}
        {selectedDevices.size > 0 && (
          <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedDevices.size}個選択中</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                <X className="h-4 w-4 mr-1" />
                選択解除
              </Button>
            </div>
            <Button
              onClick={() => setShowComparison(true)}
              disabled={selectedDevices.size < 2}
            >
              <Scale className="h-4 w-4 mr-2" />
              比較する（{Math.min(selectedDevices.size, 5)}個）
            </Button>
          </div>
        )}
      </div>

      {/* デバイス一覧 */}
      {filteredDevices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          デバイスが見つかりません
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDevices.map((device) => {
            const deviceId = getDeviceId(device.id);
            const originalDevice = initialDevices.find(d => d.id === deviceId);

            console.log('[DeviceList] Mapping device:', {
              displayId: device.id,
              deviceId,
              originalDeviceId: originalDevice?.id,
              hasOriginalDevice: !!originalDevice
            });

            return (
              <UnifiedDeviceCard
                key={device.id}
                device={device}
                showNote={true}
                showActions={true}
                selectable={true}
                selected={selectedDevices.has(device.id)}
                onSelectionChange={(selected) => toggleSelection(device.id)}
                onEdit={() => {
                  console.log('[DeviceList] Edit clicked, deviceId:', deviceId);
                  setEditingDevice({ 
                    id: deviceId, 
                    note: originalDevice?.note 
                  });
                }}
                onDelete={() => {
                  console.log('[DeviceList] Delete clicked, deviceId:', deviceId);
                  setDeletingDeviceId(deviceId);
                }}
              />
            );
          })}
        </div>
      )}

      {/* 比較ダイアログ */}
      <DeviceComparison
        devices={devicesToCompare.slice(0, 5)} // 最大5個まで
        open={showComparison}
        onOpenChange={setShowComparison}
      />

      {/* 編集モーダル */}
      {editingDevice && (
        <EditDeviceModal
          deviceId={editingDevice.id}
          currentNote={editingDevice.note || ''}
          open={true}
          onClose={() => setEditingDevice(null)}
        />
      )}

      {/* 削除ダイアログ */}
      {deletingDeviceId && (() => {
        const device = filteredDevices.find(d => getDeviceId(d.id) === deletingDeviceId);
        return (
          <DeleteDeviceDialog
            deviceId={deletingDeviceId}
            deviceName={device?.title || 'デバイス'}
            open={true}
            onClose={() => setDeletingDeviceId(null)}
          />
        );
      })()}
    </div>
  );
}
