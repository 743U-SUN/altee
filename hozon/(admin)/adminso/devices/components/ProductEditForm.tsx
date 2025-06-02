"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Product, DeviceCategory, UserDevice, User, Manufacturer, Series, ProductColor, Color, MouseAttributes, KeyboardAttributes } from "@/lib/generated/prisma";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, Save, Users, ExternalLink, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { updateProduct, refreshProductFromAmazon } from "@/lib/actions/admin-product-actions";
import { DeviceIcon } from "@/components/devices/DeviceIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductColorManager } from "./ProductColorManager";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { convertToProxyUrl } from "@/lib/utils/image-proxy";

interface ProductEditFormProps {
  product: Product & {
    category: DeviceCategory;
    manufacturer?: Manufacturer | null;
    series?: Series | null;
    mouseAttributes?: MouseAttributes | null;
    keyboardAttributes?: KeyboardAttributes | null;
    productColors?: (ProductColor & {
      color: Color;
    })[];
    userDevices: (UserDevice & {
      user: {
        id: string;
        handle: string | null;
        name: string | null;
        iconUrl: string | null;
      };
    })[];
  };
  categories: DeviceCategory[];
}

const formSchema = z.object({
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  name: z.string().min(1, "商品名を入力してください"),
  description: z.string().optional(),
  imageUrl: z.string().url("有効な画像URLを入力してください"),
  amazonUrl: z.string().url("有効なAmazon URLを入力してください"),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: product.categoryId.toString(),
      name: product.name,
      description: product.description || "",
      imageUrl: product.imageUrl,
      amazonUrl: product.amazonUrl,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await updateProduct(product.id.toString(), {
        ...values,
        categoryId: parseInt(values.categoryId), // 文字列を数値に変換
      });
      toast.success("商品情報を更新しました");
      router.refresh();
    } catch (error) {
      toast.error("商品情報の更新に失敗しました");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedProduct = await refreshProductFromAmazon(product.id.toString());
      // フォームを更新されたデータで再設定
      form.setValue("name", updatedProduct.name);
      form.setValue("description", updatedProduct.description || "");
      form.setValue("imageUrl", updatedProduct.imageUrl);
      toast.success("PA-APIから最新情報を取得しました");
      router.refresh();
    } catch (error) {
      toast.error("商品情報の取得に失敗しました");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Tabs defaultValue="basic" className="space-y-6">
      <TabsList>
        <TabsTrigger value="basic">基本情報</TabsTrigger>
        <TabsTrigger value="colors">カラー設定</TabsTrigger>
        <TabsTrigger value="usage">利用状況</TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <div className="grid gap-6 md:grid-cols-3">
          {/* メインフォーム */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
                <CardDescription>
                  商品の基本情報を編集します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* カテゴリ選択 */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>カテゴリ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              <div className="flex items-center gap-2">
                                <DeviceIcon category={category.slug} className="h-4 w-4" />
                                {category.name}
                              </div>
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
                  name="name"
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
                      <FormLabel>商品説明</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormDescription>
                        商品の特徴や詳細を記載してください
                      </FormDescription>
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

                {/* Amazon URL */}
                <FormField
                  control={form.control}
                  name="amazonUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amazon URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        更新中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        PA-APIから更新
                      </>
                    )}
                  </Button>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* 属性情報 */}
        {((product.mouseAttributes && Object.keys(product.mouseAttributes).length > 0) || 
          (product.keyboardAttributes && Object.keys(product.keyboardAttributes).length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle>属性情報</CardTitle>
              <CardDescription>
                カテゴリ固有の属性情報
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* マウス属性 */}
                {product.mouseAttributes && Object.entries(product.mouseAttributes).map(([key, value]) => {
                  if (key === 'productId' || value === null || value === undefined) return null;
                  return (
                    <div key={key} className="flex justify-between py-2 border-b last:border-0">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
                
                {/* キーボード属性 */}
                {product.keyboardAttributes && Object.entries(product.keyboardAttributes).map(([key, value]) => {
                  if (key === 'productId' || value === null || value === undefined) return null;
                  return (
                    <div key={key} className="flex justify-between py-2 border-b last:border-0">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {String(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* サイドバー */}
      <div className="space-y-6">
        {/* 商品情報 */}
        <Card>
          <CardHeader>
            <CardTitle>商品情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <OptimizedImage
                src={convertToProxyUrl(product.imageUrl)}
                alt={product.name || '商品画像'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ASIN</span>
                <Badge variant="outline">{product.asin}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">利用者数</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{product.userDevices.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">作成日</span>
                <span className="text-sm">
                  {format(new Date(product.createdAt), "yyyy/MM/dd", { locale: ja })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">更新日</span>
                <span className="text-sm">
                  {format(new Date(product.updatedAt), "yyyy/MM/dd HH:mm", { locale: ja })}
                </span>
              </div>
            </div>

            <Button variant="outline" asChild className="w-full">
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Amazonで確認
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* 利用者一覧 */}
        {product.userDevices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>この商品を使用しているユーザー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {product.userDevices.map((device) => (
                  <div key={device.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={convertToProxyUrl(device.user.iconUrl || '/user.svg')} alt={device.user.name || device.user.handle || 'User'} />
                      <AvatarFallback>
                        {device.user.name?.[0] || device.user.handle?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {device.user.name || device.user.handle}
                      </p>
                      {device.user.handle && (
                        <p className="text-xs text-muted-foreground">
                          @{device.user.handle}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {format(new Date(device.createdAt), "yyyy/MM/dd", { locale: ja })}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
      </TabsContent>

      <TabsContent value="colors">
        <ProductColorManager
          productId={product.id}
          productColors={product.productColors || []}
          onUpdate={() => router.refresh()}
        />
      </TabsContent>

      <TabsContent value="usage">
        <Card>
          <CardHeader>
            <CardTitle>利用ユーザー</CardTitle>
            <CardDescription>
              この商品を使用しているユーザー一覧
            </CardDescription>
          </CardHeader>
          <CardContent>
            {product.userDevices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                まだ誰もこの商品を使用していません
              </p>
            ) : (
              <div className="space-y-3">
                {product.userDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={convertToProxyUrl(device.user.iconUrl || '/user.svg')} alt={device.user.name || device.user.handle || 'User'} />
                        <AvatarFallback>
                          {device.user.name?.[0] || device.user.handle?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {device.user.name || device.user.handle}
                        </p>
                        {device.user.handle && (
                          <p className="text-xs text-muted-foreground">
                            @{device.user.handle}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {format(new Date(device.createdAt), "yyyy/MM/dd", { locale: ja })}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
