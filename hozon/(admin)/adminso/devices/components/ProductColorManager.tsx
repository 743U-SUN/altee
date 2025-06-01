'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { ColorImageManager } from './ColorImageManager';

interface Color {
  id: number;
  name: string;
  nameEn: string;
  hexCode: string | null;
  isActive: boolean;
}

interface ProductColor {
  id: number;
  productId: number;
  colorId: number;
  imageUrl: string | null;
  isDefault: boolean;
  color: Color;
}

interface ProductColorManagerProps {
  productId: number;
  productColors: ProductColor[];
  onUpdate: () => void;
}

export function ProductColorManager({ productId, productColors, onUpdate }: ProductColorManagerProps) {
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  const [selectedColors, setSelectedColors] = useState<Map<number, ProductColor | null>>(new Map());
  const [defaultColorId, setDefaultColorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchColors();
    initializeSelectedColors();
  }, [productColors]);

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/admin/colors');
      if (!response.ok) throw new Error('Failed to fetch colors');
      const data = await response.json();
      setAvailableColors(data.filter((color: Color) => color.isActive));
    } catch (error) {
      console.error('Error fetching colors:', error);
      toast.error('カラー情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSelectedColors = () => {
    const colorMap = new Map<number, ProductColor | null>();
    productColors.forEach((pc) => {
      colorMap.set(pc.colorId, pc);
      if (pc.isDefault) {
        setDefaultColorId(pc.colorId);
      }
    });
    setSelectedColors(colorMap);
  };

  const handleColorToggle = (colorId: number, checked: boolean) => {
    const newMap = new Map(selectedColors);
    if (checked) {
      newMap.set(colorId, null); // 新規選択
    } else {
      newMap.delete(colorId);
      if (defaultColorId === colorId) {
        setDefaultColorId(null);
      }
    }
    setSelectedColors(newMap);
  };

  const handleDefaultChange = (colorId: number) => {
    setDefaultColorId(colorId);
    // 選択されていない場合は自動的に選択
    if (!selectedColors.has(colorId)) {
      const newMap = new Map(selectedColors);
      newMap.set(colorId, null);
      setSelectedColors(newMap);
    }
  };

  const handleImageUpdate = (colorId: number, imageUrl: string) => {
    // 画像URLを更新
    const newMap = new Map(selectedColors);
    const existing = selectedColors.get(colorId);
    if (existing) {
      newMap.set(colorId, { ...existing, imageUrl });
    } else {
      newMap.set(colorId, {
        id: 0, // 一時ID
        productId,
        colorId,
        imageUrl,
        isDefault: false,
        color: availableColors.find(c => c.id === colorId)!,
      });
    }
    setSelectedColors(newMap);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const colorData = Array.from(selectedColors.entries()).map(([colorId, productColor]) => ({
        colorId,
        imageUrl: productColor?.imageUrl || null,
        isDefault: colorId === defaultColorId,
      }));

      const response = await fetch(`/api/admin/products/${productId}/colors`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors: colorData }),
      });

      if (!response.ok) throw new Error('Failed to save colors');

      toast.success('カラー設定を保存しました');
      onUpdate();
    } catch (error) {
      console.error('Error saving colors:', error);
      toast.error('カラー設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>カラーバリエーション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>カラーバリエーション</CardTitle>
        <CardDescription>
          商品のカラーバリエーションを選択し、カラー別の画像を設定してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* カラー選択とデフォルト設定 */}
        <div className="space-y-4">
          {availableColors.map((color) => {
            const isSelected = selectedColors.has(color.id);
            const productColor = selectedColors.get(color.id);
            
            return (
              <div key={color.id} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`color-${color.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleColorToggle(color.id, checked as boolean)}
                    />
                    <Label htmlFor={`color-${color.id}`} className="flex items-center gap-2 cursor-pointer">
                      {color.hexCode && (
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: color.hexCode }}
                        />
                      )}
                      <span className="font-medium">{color.name}</span>
                      <span className="text-sm text-gray-500">({color.nameEn})</span>
                    </Label>
                  </div>
                  
                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant={defaultColorId === color.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDefaultChange(color.id)}
                        className="flex items-center gap-2"
                      >
                        {defaultColorId === color.id && (
                          <Star className="h-3 w-3 fill-current" />
                        )}
                        デフォルト
                      </Button>
                    </div>
                  )}
                </div>

                {/* カラー別画像アップロード */}
                {isSelected && (
                  <div className="ml-9">
                    <ColorImageManager
                      colorId={color.id}
                      colorName={color.name}
                      imageUrl={productColor?.imageUrl || null}
                      onImageUpdate={handleImageUpdate}
                      productId={productId}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : 'カラー設定を保存'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}