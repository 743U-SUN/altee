/**
 * デバイス追加フォームコンポーネント（重複チェック機能付き）
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Link, Package, AlertCircle, CheckCircle, Users, Crown } from 'lucide-react';
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
import Image from 'next/image';
import { DeviceIcon } from '@/components/devices/DeviceIcon';

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

  // 公式商品を取得
  useEffect(() => {
    getOfficialProducts().then(setOfficialProducts);
  }, []);

  // 公式商品フォーム
  const productForm = useForm<z.infer<typeof addDeviceFromProductFormSchema>>({
    resolver: zodResolver(addDeviceFromProductFormSchema),
    defaultValues: {
      productId: '',
      note: '',
    },
  });

  // URLフォーム
  const urlForm = useForm<z.infer<typeof addDeviceFromUrlFormSchema>>({
    resolver: zodResolver(addDeviceFromUrlFormSchema),
    defaultValues: {
      amazonUrl: '',
      category: undefined,
      note: '',
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
        if (result.detectedCategory && !urlForm.getValues('category')) {
          console.log('Auto-setting category:', result.detectedCategory);
          urlForm.setValue('category', result.detectedCategory);
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
  const onSubmitProduct = async (values: z.infer<typeof addDeviceFromProductFormSchema>) => {
    setIsLoading(true);
    try {
      const result = await addDeviceFromProduct({
        productId: parseInt(values.productId),
        note: values.note,
      });

      if (result.success) {
        toast({
          title: '成功',
          description: 'デバイスを追加しました',
        });
        productForm.reset();
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
  const onSubmitUrl = async (values: z.infer<typeof addDeviceFromUrlFormSchema>) => {
    setIsLoading(true);
    try {
      const result = await addDeviceFromUrl({
        amazonUrl: values.amazonUrl,
        category: values.category,
        note: values.note,
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
              control={productForm.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>商品を選択</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="商品を選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.title} ({product.category.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={productForm.control}
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
              control={urlForm.control}
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
                            <Image
                              src={previewData.productInfo.imageUrl || '/images/no-image.svg'}
                              alt={previewData.productInfo.title}
                              fill
                              className="object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/images/no-image.svg';
                              }}
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
              control={urlForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリ（任意）</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="自動検出されます" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
              control={urlForm.control}
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
