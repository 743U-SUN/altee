"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import type { DeviceCategory } from "@/lib/generated/prisma";
import {
  createProduct,
  fetchProductFromAmazon,
} from "@/lib/actions/admin-product-actions";
import { MouseAttributesForm } from "./MouseAttributesForm";
import { KeyboardAttributesForm } from "./KeyboardAttributesForm";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { convertToProxyUrl } from "@/lib/utils/image-proxy";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: (DeviceCategory & {
    _count: {
      products: number;
    };
  })[];
}

const formSchema = z.object({
  amazonUrl: z.string().url("有効なURLを入力してください"),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  title: z.string().min(1, "商品名を入力してください"),
  description: z.string().optional(),
  imageUrl: z.string().url("有効な画像URLを入力してください"),
  asin: z.string().min(1, "ASINが必要です"),
  defaultColorId: z.string().optional(),
  attributes: z.object({
    manufacturerId: z.string().optional(),
    seriesId: z.string().optional(),
    mouse: z.object({
      dpi_min: z.number().optional(),
      dpi_max: z.number().optional(),
      weight: z.number().optional(),
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      buttons: z.number().optional(),
      connection_type: z.string().optional(),
      polling_rate: z.array(z.number()).optional(),
      battery_life: z.number().optional(),
      sensor: z.string().optional(),
      rgb: z.boolean().optional(),
      software: z.string().optional(),
    }).optional(),
    keyboard: z.object({
      layout: z.string().optional(),
      key_arrangement: z.string().optional(),
      switch_type: z.string().optional(),
      connection_type: z.string().optional(),
      width: z.number().optional(),
      depth: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional(),
      key_stroke: z.number().optional(),
      actuation_point: z.number().optional(),
      rapid_trigger: z.boolean().optional(),
      rapid_trigger_min: z.number().optional(),
      polling_rate: z.array(z.number()).optional(),
    }).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// 共通の型定義
interface DeviceAttributes {
  manufacturerId?: string;
  seriesId?: string;
  mouse?: {
    dpi_min?: number;
    dpi_max?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    buttons?: number;
    connection_type?: string;
    polling_rate?: number[];
    battery_life?: number;
    sensor?: string;
    rgb?: boolean;
    software?: string;
  };
  keyboard?: {
    layout?: string;
    key_arrangement?: string;
    switch_type?: string;
    connection_type?: string;
    width?: number;
    depth?: number;
    height?: number;
    weight?: number;
    key_stroke?: number;
    actuation_point?: number;
    rapid_trigger?: boolean;
    rapid_trigger_min?: number;
    polling_rate?: number[];
  };
}

interface Color {
  id: number;
  name: string;
  nameEn: string;
  hexCode: string | null;
  isActive: boolean;
}

export function AddProductDialog({
  open,
  onOpenChange,
  categories,
}: AddProductDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<Partial<FormValues> | null>(null);
  const [colors, setColors] = useState<Color[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amazonUrl: "",
      categoryId: "",
      title: "",
      description: "",
      imageUrl: "",
      asin: "",
      defaultColorId: "none",
      attributes: {},
    },
  });

  // カラー一覧を取得
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await fetch('/api/admin/colors');
        if (response.ok) {
          const data = await response.json();
          setColors(data.filter((color: Color) => color.isActive));
        }
      } catch (error) {
        console.error('Failed to fetch colors:', error);
      }
    };

    if (open) {
      fetchColors();
    }
  }, [open]);

  const handleFetchFromAmazon = async () => {
    const amazonUrl = form.getValues("amazonUrl");
    if (!amazonUrl) {
      form.setError("amazonUrl", {
        message: "Amazon URLを入力してください",
      });
      return;
    }

    setIsFetching(true);
    try {
      const data = await fetchProductFromAmazon(amazonUrl);
      
      // デバッグ用ログ
      console.log('Fetched data:', data);
      
      // データの存在チェック
      if (!data || typeof data !== 'object') {
        throw new Error('商品データが取得できませんでした');
      }
      
      // フォームに取得したデータをセット
      form.setValue("title", data.title || '商品名が取得できませんでした');
      form.setValue("description", data.description || "");
      form.setValue("imageUrl", data.imageUrl || '/images/no-image.svg');
      form.setValue("asin", data.asin || '');
      
      setFetchedData({
        title: data.title || '商品名が取得できませんでした',
        description: data.description || '',
        imageUrl: data.imageUrl || '/images/no-image.svg',
        asin: data.asin || '',
      });
      
      // データソースに応じたメッセージを表示
      if (data?.source === 'PA-API') {
        toast.success("商品情報をPA-APIから取得しました");
      } else if (data?.source === 'OG-metadata') {
        toast.success("商品情報を取得しました（PA-APIが利用できないためOGメタデータを使用）", {
          duration: 5000, // 少し長めに表示
        });
      } else {
        toast.success("商品情報を取得しました");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '商品情報の取得に失敗しました';
      
      if (errorMessage.includes('PA-APIエラー') && errorMessage.includes('OGメタデータエラー')) {
        toast.error('商品情報を取得できませんでした。AmazonのURLを確認してください。');
      } else if (errorMessage.includes('Invalid Amazon URL')) {
        toast.error('有効なAmazon URLを入力してください。短縮URL（amzn.to）も対応しています。');
      } else {
        toast.error(errorMessage);
      }
      
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // 属性データを適切な形式に変換
      const attributes = values.attributes || {};
      const submitData: {
        categoryId: string;
        title: string;
        description?: string;
        imageUrl: string;
        amazonUrl: string;
        asin: string;
        defaultColorId?: number;
        manufacturerId?: number;
        seriesId?: number;
        mouseAttributes?: Record<string, any>;
        keyboardAttributes?: Record<string, any>;
      } = {
        categoryId: values.categoryId,
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl,
        amazonUrl: values.amazonUrl,
        asin: values.asin,
        defaultColorId: values.defaultColorId && values.defaultColorId !== 'none' ? parseInt(values.defaultColorId) : undefined,
      };

      // メーカーとシリーズの設定
      if (attributes.manufacturerId) {
        submitData.manufacturerId = parseInt(attributes.manufacturerId);
      }
      if (attributes.seriesId) {
        submitData.seriesId = parseInt(attributes.seriesId);
      }

      // 選択されたカテゴリの情報を取得
      const selectedCategory = categories.find(cat => cat.id.toString() === values.categoryId);
      const categorySlug = selectedCategory?.slug;

      // カテゴリ別の属性設定
      if (categorySlug === 'mouse' && attributes.mouse) {
        // マウス属性をPrismaスキーマに合わせて変換
        const mouseAttrs = attributes.mouse as DeviceAttributes['mouse'];
        
        // 接続タイプを enum に変換
        const mapConnectionTypeToEnum = (connectionType: string) => {
          switch (connectionType) {
            case 'wired': return 'WIRED';
            case 'wireless': return 'WIRELESS';
            case 'both': return 'BOTH';
            default: return null;
          }
        };

        submitData.mouseAttributes = {
          dpiMin: mouseAttrs?.dpi_min || null,
          dpiMax: mouseAttrs?.dpi_max || null,
          weight: mouseAttrs?.weight || null,
          length: mouseAttrs?.length || null,
          width: mouseAttrs?.width || null,
          height: mouseAttrs?.height || null,
          buttons: mouseAttrs?.buttons || null,
          connectionType: mouseAttrs?.connection_type ? mapConnectionTypeToEnum(mouseAttrs.connection_type) : null,
          pollingRate: mouseAttrs?.polling_rate && Array.isArray(mouseAttrs.polling_rate) ? mouseAttrs.polling_rate[mouseAttrs.polling_rate.length - 1] : null, // 最大値を使用
          batteryLife: mouseAttrs?.battery_life || null,
          sensor: mouseAttrs?.sensor || null,
          rgb: mouseAttrs?.rgb || false,
          software: mouseAttrs?.software || null,
        };
      } else if (categorySlug === 'keyboard' && attributes.keyboard) {
        // キーボード属性をPrismaスキーマに合わせて変換
        const keyboardAttrs = attributes.keyboard as DeviceAttributes['keyboard'];
        
        // レイアウト値を enum に変換
        const mapLayoutToEnum = (layout: string) => {
          switch (layout) {
            case 'full': return 'FULL';
            case 'tkl': return 'TKL';
            case '60': return 'SIXTY';
            case '65': return 'SIXTYFIVE';
            case '75': return 'SEVENTYFIVE';
            default: return null;
          }
        };

        // スイッチタイプを enum に変換
        const mapSwitchTypeToEnum = (switchType: string) => {
          switch (switchType) {
            case 'mechanical': return 'MECHANICAL';
            case 'optical': return 'OPTICAL';
            case 'magnetic': return 'MAGNETIC';
            case 'membrane': return 'MEMBRANE';
            default: return null;
          }
        };

        // 接続タイプを enum に変換
        const mapConnectionTypeToEnum = (connectionType: string) => {
          switch (connectionType) {
            case 'wired': return 'WIRED';
            case 'wireless': return 'WIRELESS';
            case 'both': return 'BOTH';
            default: return null;
          }
        };

        submitData.keyboardAttributes = {
          layout: keyboardAttrs?.layout ? mapLayoutToEnum(keyboardAttrs.layout) : null,
          switchType: keyboardAttrs?.switch_type ? mapSwitchTypeToEnum(keyboardAttrs.switch_type) : null,
          connectionType: keyboardAttrs?.connection_type ? mapConnectionTypeToEnum(keyboardAttrs.connection_type) : null,
          actuationPoint: keyboardAttrs?.actuation_point || null,
          rapidTrigger: keyboardAttrs?.rapid_trigger || false,
          rgb: false, // デフォルト値
          software: null,
          keycaps: null,
          hotSwap: false, // デフォルト値
        };
      }

      await createProduct(submitData);
      
      toast.success("商品を追加しました");
      form.reset();
      setFetchedData(null);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        toast.error("このASINの商品は既に登録されています");
      } else {
        toast.error("商品の追加に失敗しました");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setFetchedData(null);
    setColors([]);
    onOpenChange(false);
  };

  // 選択されたカテゴリの情報を取得
  const selectedCategoryId = form.watch("categoryId");
  const selectedCategory = categories.find(cat => cat.id.toString() === selectedCategoryId);
  const categorySlug = selectedCategory?.slug;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新しい商品を追加</DialogTitle>
          <DialogDescription>
            Amazon URLから商品情報を取得して、公式商品として追加します。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Amazon URL入力 */}
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="amazonUrl"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Amazon URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.amazon.co.jp/dp/..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Amazon商品ページのURLを入力してください
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchFromAmazon}
                  disabled={isFetching}
                  className="mt-8"
                >
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  取得
                </Button>
              </div>

              {/* 取得した画像のプレビュー */}
              {fetchedData?.imageUrl && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">商品画像プレビュー</div>
                  <div className="relative aspect-square w-32 overflow-hidden rounded-lg bg-muted border">
                    <OptimizedImage
                      src={convertToProxyUrl(fetchedData.imageUrl)}
                      alt={fetchedData.title || '商品画像'}
                      fill
                      sizes="128px"
                      className="object-contain"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground break-all">
                    URL: {fetchedData.imageUrl}
                  </div>
                </div>
              )}

              {/* カテゴリ選択 */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ''} // undefined の場合は空文字列を使用
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="カテゴリを選択" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 商品名 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>商品名</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 商品説明 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>商品説明（任意）</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 画像URL */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>画像URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ASIN */}
              <FormField
                control={form.control}
                name="asin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ASIN</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted" />
                    </FormControl>
                    <FormDescription>
                      Amazon Standard Identification Number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* デフォルトカラー選択 */}
              <FormField
                control={form.control}
                name="defaultColorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>デフォルトカラー（任意）</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="カラーを選択（スキップ可能）" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">カラーを設定しない</SelectItem>
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={color.id.toString()}>
                            <div className="flex items-center gap-2">
                              {color.hexCode && (
                                <div
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: color.hexCode }}
                                />
                              )}
                              <span>{color.name}</span>
                              <span className="text-sm text-gray-500">({color.nameEn})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      商品のデフォルトカラーを設定します。後からカラー設定で変更・追加できます。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* カテゴリ別の詳細属性フォーム */}
              {selectedCategoryId && categorySlug === "mouse" && (
                <MouseAttributesForm form={form} />
              )}
              
              {selectedCategoryId && categorySlug === "keyboard" && (
                <KeyboardAttributesForm form={form} />
              )}
            </div>

            {!fetchedData && (
              <Alert>
                <AlertDescription>
                  Amazon URLを入力して「取得」ボタンをクリックすると、商品情報を自動で取得します。
                  短縮URL（amzn.to）にも対応しています。
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading || !fetchedData}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                商品を追加
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
