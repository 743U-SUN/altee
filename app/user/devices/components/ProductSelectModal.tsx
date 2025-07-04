'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Package, CheckCircle } from 'lucide-react';
import { getOfficialProducts } from '@/lib/actions/device-actions';
import { getAttributesByCategory } from '@/lib/actions/admin-product-actions';
import { cn } from '@/lib/utils';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';

interface ProductColor {
  id: number;
  colorId: number;
  imageUrl: string | null;
  isDefault: boolean;
  color: {
    id: number;
    name: string;
    nameEn: string;
    hexCode: string | null;
  };
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string;
  price: string | null;
  attributes: any;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  manufacturer?: {
    id: number;
    name: string;
    logoUrl: string | null;
  };
  productColors?: ProductColor[];
}

interface ProductSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  onSelect: (productId: number, colorId?: number) => void;
}

export function ProductSelectModal({
  open,
  onOpenChange,
  selectedCategory,
  onSelect,
}: ProductSelectModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);

  // 商品と属性を取得
  useEffect(() => {
    if (open && selectedCategory && selectedCategory !== 'all') {
      setLoading(true);
      Promise.all([
        getOfficialProducts(selectedCategory),
        getAttributesByCategory(selectedCategory)
      ]).then(([productsData, attributesData]) => {
        setProducts(productsData);
        setAttributes(attributesData || []);
        setLoading(false);
      });
    }
  }, [open, selectedCategory]);

  // フィルター処理された商品
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // 検索クエリでフィルタリング
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 属性フィルターでフィルタリング
    Object.entries(selectedFilters).forEach(([filterType, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(product => {
          const productAttributes = product.attributes || {};
          
          // メーカーフィルター
          if (filterType === 'manufacturer') {
            return product.manufacturer && values.includes(product.manufacturer.id.toString());
          }
          
          // その他の属性フィルター
          const productValue = productAttributes[filterType];
          if (Array.isArray(productValue)) {
            return values.some(v => productValue.includes(v));
          }
          return values.includes(productValue);
        });
      }
    });

    return filtered;
  }, [products, searchQuery, selectedFilters]);

  // フィルター選択の処理
  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[filterType] || [];
      if (current.includes(value)) {
        // 既に選択されている場合は削除
        return {
          ...prev,
          [filterType]: current.filter(v => v !== value)
        };
      } else {
        // 選択されていない場合は追加
        return {
          ...prev,
          [filterType]: [...current, value]
        };
      }
    });
  };

  // 商品選択の処理
  const handleProductClick = (product: Product) => {
    setSelectedProductId(product.id);
    
    // カラーバリエーションがある場合は、デフォルトカラーを選択
    if (product.productColors && product.productColors.length > 0) {
      const defaultColor = product.productColors.find(pc => pc.isDefault);
      setSelectedColorId(defaultColor?.colorId || product.productColors[0].colorId);
    } else {
      setSelectedColorId(null);
    }
  };

  // カラー選択の処理
  const handleColorSelect = (colorId: number) => {
    setSelectedColorId(colorId);
  };

  // 最終的な選択確定
  const handleConfirmSelection = () => {
    if (selectedProductId) {
      onSelect(selectedProductId, selectedColorId || undefined);
      onOpenChange(false);
    }
  };

  // 選択された商品を取得
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // メーカー属性を取得
  const manufacturerAttributes = attributes.filter(attr => attr.type === 'MANUFACTURER');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>商品を選択</DialogTitle>
          <DialogDescription>
            {selectedCategory === 'mouse' ? 'マウス' : selectedCategory === 'keyboard' ? 'キーボード' : selectedCategory}
            カテゴリの商品から選択してください
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* 検索バー */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="商品名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* フィルター */}
            {manufacturerAttributes.length > 0 && (
              <div className="space-y-2">
                <Label>メーカーで絞り込み</Label>
                <div className="flex flex-wrap gap-2">
                  {manufacturerAttributes.map((attr) => (
                    <Badge
                      key={attr.id}
                      variant={selectedFilters.manufacturer?.includes(attr.id.toString()) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterChange('manufacturer', attr.id.toString())}
                    >
                      {attr.logoUrl && (
                        <OptimizedImage
                          src={convertToProxyUrl(attr.logoUrl)}
                          alt={attr.name}
                          width={16}
                          height={16}
                          className="w-4 h-4 mr-1 object-contain"
                        />
                      )}
                      {attr.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 商品リスト */}
            <ScrollArea className="flex-1">
              <div className="grid gap-3 pr-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 mb-2" />
                    <p>条件に一致する商品が見つかりません</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id}>
                      <div
                        className={cn(
                          "flex items-center gap-4 p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors",
                          selectedProductId === product.id && "border-primary bg-accent"
                        )}
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                          <OptimizedImage
                            src={convertToProxyUrl(product.imageUrl || '/images/no-image.svg')}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium line-clamp-1">{product.name}</h4>
                          {product.manufacturer && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              {product.manufacturer.logoUrl && (
                                <OptimizedImage
                                  src={convertToProxyUrl(product.manufacturer.logoUrl)}
                                  alt={product.manufacturer.name}
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 object-contain"
                                />
                              )}
                              {product.manufacturer.name}
                            </p>
                          )}
                          {product.price && (
                            <p className="text-sm font-medium">¥{parseInt(product.price).toLocaleString()}</p>
                          )}
                        </div>
                        {selectedProductId === product.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      {/* カラー選択 */}
                      {selectedProductId === product.id && product.productColors && product.productColors.length > 0 && (
                        <div className="mt-3 ml-4 p-3 bg-muted rounded-lg">
                          <Label className="text-sm font-medium mb-2 block">カラーを選択</Label>
                          <div className="flex flex-wrap gap-2">
                            {product.productColors.map((pc) => (
                              <button
                                key={pc.id}
                                onClick={() => handleColorSelect(pc.color.id)}
                                className={cn(
                                  "relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all",
                                  selectedColorId === pc.color.id
                                    ? "border-primary ring-2 ring-primary ring-offset-2"
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                              >
                                {pc.imageUrl ? (
                                  <OptimizedImage
                                    src={convertToProxyUrl(pc.imageUrl)}
                                    alt={pc.color.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                ) : pc.color.hexCode ? (
                                  <div
                                    className="w-full h-full"
                                    style={{ backgroundColor: pc.color.hexCode }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">{pc.color.name[0]}</span>
                                  </div>
                                )}
                                {pc.isDefault && (
                                  <div className="absolute top-0 right-0 bg-primary text-white text-xs px-1 rounded-bl">
                                    デフォルト
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            選択中: {product.productColors.find(pc => pc.color.id === selectedColorId)?.color.name}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* 選択ボタン */}
            {selectedProductId && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProductId(null);
                    setSelectedColorId(null);
                  }}
                >
                  選択を解除
                </Button>
                <Button onClick={handleConfirmSelection}>
                  この商品を選択
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}