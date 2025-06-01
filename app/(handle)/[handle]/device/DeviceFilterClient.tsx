"use client";

import { useState } from 'react';
import { UnifiedDeviceCard } from '@/components/devices/UnifiedDeviceCard';
import { DeviceIcon } from '@/components/devices/DeviceIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DeviceFilterClientProps {
  devices: any[];
}

export function DeviceFilterClient({ devices }: DeviceFilterClientProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // カテゴリごとにグループ化
  const devicesByCategory = devices.reduce((acc, device) => {
    const category = device.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(device);
    return acc;
  }, {} as Record<string, typeof devices>);

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
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredDevices = selectedCategories.length === 0 
    ? devices 
    : devices.filter(device => selectedCategories.includes(device.category));

  return (
    <div className="space-y-6">
      {/* カテゴリフィルターボタン */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategories.includes(category) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleCategory(category)}
            className="flex items-center gap-2"
          >
            <DeviceIcon category={category} className="h-4 w-4" />
            <span>{getCategoryName(category)}</span>
            <Badge variant={selectedCategories.includes(category) ? "secondary" : "outline"} className="ml-1 h-5 px-1">
              {devicesByCategory[category].length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* デバイス一覧 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDevices.map((device) => (
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