/**
 * デバイス追加フォームコンポーネント（重複チェック機能付き）
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Link, Package, AlertCircle, Users, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  addDeviceFromProduct, 
  addDeviceFromUrl, 
  getOfficialProducts,
  previewProductFromUrl 
} from '@/lib/actions/device-actions';
import { 
  addDeviceFromProductFormSchema, 
  addDeviceFromUrlFormSchema 
} from '@/lib/validation/device-validation';
import { useEffect } from 'react';
import { ProductSelectModal } from './ProductSelectModal';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { convertToProxyUrl } from '@/lib/utils/image-proxy';

interface DuplicateInfo {
  officialProduct?: any;
  customProducts?: any[];
  userExistingDevice?: any;
  totalUsers?: number;
}

interface PreviewData {
  productInfo?: any;
  asin?: string;
  detectedCategory?: string;
  duplicateInfo?: DuplicateInfo | null;
  customTitle?: string;
}

export function AddDeviceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [officialProducts, setOfficialProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);

  // 公式商品を取得
  useEffect(() => {
    getOfficialProducts().then(setOfficialProducts);
  }, []);

  // 商品が選択された時の処理
  const handleProductSelect = (productId: number, colorId?: number) => {
    const product = officialProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setSelectedColorId(colorId || null);
      productForm.setValue('productId', productId.toString());
    }
  };

  // 公式商品フォーム
  const productForm = useForm({
    resolver: zodResolver(addDeviceFromProductFormSchema),
    defaultValues: {
      productId: '',
      note: '',
    },
  });

  // URLフォーム
  const urlForm = useForm({
    resolver: zodResolver(addDeviceFromUrlFormSchema),
    defaultValues: {
      amazonUrl: '',
      category: 'auto', // デフォルトを'auto'に設定
      note: '',
      customTitle: '',
    },
  });

  // URLプレビューと重複チェック
  const handleUrlPreview = useCallback(async (url: string) => {
    console.log('handleUrlPreview called with:', url);
    
    // Amazon URLの判定を短縮URLにも対応
    const isAmazonUrl = url && (
      url.includes('amazon.co.jp') ||
      url.includes('amazon.com') ||
      url.includes('amazon.jp') ||
      url.includes('amzn.to') ||
      url.includes('amzn.asia')
    );
    
    if (!isAmazonUrl) {
      console.log('Not an Amazon URL, clearing preview');
      setPreviewData(null);
      return;
    }

    setIsPreviewing(true);
    try {
      console.log('Starting preview request...');
      const result = await previewProductFromUrl(url);
      console.log('Preview result:', result);
      
      // resultがundefinedまたはnullの場合のチェックを追加
      if (!result) {
        console.error('Preview result is undefined');
        setPreviewData(null);
        toast({
          title: 'エラー',
          description: 'サーバーに接続できません。開発サーバーが起動しているか確認してください。',
          variant: 'destructive',
        });
        return;
      }
      
      if (result.success) {
        console.log('Preview successful, setting data');
        setPreviewData(result);
        
        // カテゴリーを自動設定
        if (result.detectedCategory && (!urlForm.getValues('category') || urlForm.getValues('category') === 'auto')) {
          console.log('Auto-setting category:', result.detectedCategory);
          urlForm.setValue('category', result.detectedCategory as any);
        }
        
        // カスタムタイトルフィールドに商品名を設定
        if (result.productInfo?.title && !urlForm.getValues('customTitle')) {
          urlForm.setValue('customTitle', result.productInfo.title);
        }

        // 重複警告の表示判定
        if (result.duplicateInfo?.userExistingDevice) {
          console.log('User already has this device');
          setShowDuplicateWarning(true);
        } else {
          setShowDuplicateWarning(false);
        }
      } else {
        console.log('Preview failed:', result.error);
        setPreviewData(null);
        if (result.error !== '有効なAmazon商品URLではありません') {
          toast({
            title: 'エラー',
            description: result.error || 'プレビューの取得に失敗しました',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewData(null);
      toast({
        title: 'エラー',
        description: 'サーバーに接続できません。開発サーバーが起動しているか確認してください。',
        variant: 'destructive',
      });
    } finally {
      setIsPreviewing(false);
    }
  }, [urlForm, toast]);

  // 公式商品から追加
  const onSubmitProduct = async (values: any) => {
    setIsLoading(true);
    try {
      const result = await addDeviceFromProduct({
        productId: values.productId,
        note: values.note,
        colorId: selectedColorId || undefined,
      });

      if (result.success) {
        toast({
          title: '成功',
          description: 'デバイスを追加しました',
        });
        productForm.reset();
        setSelectedProduct(null);
        setSelectedCategory('all');
        router.refresh();
      } else {
        toast({
          title: 'エラー',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'デバイスの追加に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // URLから追加
  const onSubmitUrl = async (values: any) => {
    setIsLoading(true);
    try {
      const result = await addDeviceFromUrl({
        amazonUrl: values.amazonUrl,
        category: values.category,
        note: values.note,
        customTitle: values.customTitle,
        forceAdd: false,
      });

      if (result.success) {
        let message = 'デバイスを追加しました';
        if (result.usedOfficialProduct) {
          message = '公式商品として追加しました';
        }
        
        toast({
          title: '成功',
          description: message,
        });
        urlForm.reset();
        setPreviewData(null);
        setShowDuplicateWarning(false);
        setSelectedCategory('all');
        router.refresh();
      } else {
        if (result.error === 'DUPLICATE_USER_DEVICE') {
          toast({
            title: 'エラー',
            description: 'この商品は既に追加されています',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'エラー',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'デバイスの追加に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // カテゴリでフィルタリング
  const filteredProducts = selectedCategory === 'all' 
    ? officialProducts 
    : officialProducts.filter(p => p.category.slug === selectedCategory);

  return (
    <Tabs defaultValue="official" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="official" className="gap-2">
          <Package className="h-4 w-4" />
          公式リストから選択
        </TabsTrigger>
        <TabsTrigger value="url" className="gap-2">
          <Link className="h-4 w-4" />
          Amazon URLから追加
        </TabsTrigger>
      </TabsList>

      <TabsContent value="official" className="space-y-4">
        <Alert>
          <AlertDescription>
            管理者が厳選した公式商品リストから選択できます。
            これらの商品は詳細な属性情報が登録されています。
          </AlertDescription>
        </Alert>

        <Form {...productForm}>
          <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
            <div className="space-y-2">
              <Label>カテゴリフィルタ</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedProduct(null);
                  productForm.setValue('productId', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="mouse">マウス</SelectItem>
                  <SelectItem value="keyboard">キーボード</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={productForm.control as any}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品を選択</FormLabel>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowProductModal(true)}
                      disabled={selectedCategory === 'all'}
                    >
                      {selectedProduct ? (
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded bg-muted">
                            <OptimizedImage
                              src={convertToProxyUrl(selectedProduct.imageUrl || '/images/no-image.svg')}
                              alt={selectedProduct.name}
                              fill
                              sizes="32px"
                              className="object-contain"
                            />
                          </div>
                          <span className="flex-1 text-left">{selectedProduct.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">商品を選択してください</span>
                      )}
                    </Button>
                    {selectedCategory === 'all' && (
                      <p className="text-sm text-muted-foreground">
                        先にカテゴリを選択してください
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={productForm.control as any}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="このデバイスについてのメモを入力..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    使用感や設定などを記録できます
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              デバイスを追加
            </Button>
          </form>
        </Form>
        
        {/* 商品選択モーダル */}
        <ProductSelectModal
          open={showProductModal}
          onOpenChange={setShowProductModal}
          selectedCategory={selectedCategory}
          onSelect={handleProductSelect}
        />
      </TabsContent>

      <TabsContent value="url" className="space-y-4">
        <Alert>
          <AlertDescription>
            Amazon商品URLを入力してデバイスを追加できます。
            商品情報は自動的に取得されます。
          </AlertDescription>
        </Alert>

        <Form {...urlForm}>
          <form onSubmit={urlForm.handleSubmit(onSubmitUrl)} className="space-y-4">
            <FormField
              control={urlForm.control as any}
              name="amazonUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amazon商品URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.amazon.co.jp/dp/... または https://amzn.to/..."
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleUrlPreview(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Amazon商品ページのURLを入力してください。短縮URL（amzn.to）にも対応しています。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* カスタムタイトル入力フィールド（プレビューが表示されている時のみ） */}
            {previewData && !isPreviewing && (
              <FormField
                control={urlForm.control as any}
                name="customTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>デバイス名（編集可能）</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="デバイス名を入力..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      長すぎる商品名は短く編集できます
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* プレビューと重複チェック結果 */}
            {isPreviewing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">商品情報を確認しています...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {previewData && !isPreviewing && (
              <>
                {/* 商品プレビュー */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">商品情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {previewData.productInfo && (
                      <>
                        <div className="flex gap-4">
                          <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted">
                            <OptimizedImage
                              src={convertToProxyUrl(previewData.productInfo.imageUrl || '/images/no-image.svg')}
                              alt={previewData.productInfo.title || '商品画像'}
                              fill
                              sizes="80px"
                              className="object-contain"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium line-clamp-2">
                              {previewData.productInfo.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ASIN: {previewData.asin}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 重複チェック結果 */}
                    {previewData.duplicateInfo && (
                      <>
                        {/* ユーザーが既に持っている場合 */}
                        {previewData.duplicateInfo.userExistingDevice && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>既に追加済み</AlertTitle>
                            <AlertDescription>
                              この商品は既にあなたのデバイスリストに追加されています。
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* 公式商品が存在する場合 */}
                        {previewData.duplicateInfo.officialProduct && 
                         !previewData.duplicateInfo.userExistingDevice && (
                          <Alert>
                            <Crown className="h-4 w-4 text-yellow-600" />
                            <AlertTitle>公式商品として登録されています</AlertTitle>
                            <AlertDescription>
                              この商品は公式リストに登録されているため、
                              より詳細な情報が利用できます。
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* 他のユーザーが使用している場合 */}
                        {previewData.duplicateInfo.customProducts && 
                         previewData.duplicateInfo.customProducts.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                              {previewData.duplicateInfo.totalUsers}人のユーザーが使用中
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            <FormField
              control={urlForm.control as any}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリ（任意）</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''} // undefined の場合は空文字列を使用
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="自動検出されます" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto">自動検出</SelectItem>
                      <SelectItem value="mouse">マウス</SelectItem>
                      <SelectItem value="keyboard">キーボード</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    指定しない場合は商品名から自動的に判定されます
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={urlForm.control as any}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="このデバイスについてのメモを入力..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    使用感や設定などを記録できます
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isLoading || showDuplicateWarning} 
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {previewData?.duplicateInfo?.officialProduct && 
               !previewData?.duplicateInfo?.userExistingDevice
                ? '公式商品として追加'
                : 'デバイスを追加'}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
