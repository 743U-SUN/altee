"use client";

import { useState } from "react";
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
import type { DeviceCategory } from "@prisma/client";
import {
  createProduct,
  fetchProductFromAmazon,
} from "@/lib/actions/admin-product-actions";
import Image from "next/image";

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
});

type FormValues = z.infer<typeof formSchema>;

export function AddProductDialog({
  open,
  onOpenChange,
  categories,
}: AddProductDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<Partial<FormValues> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amazonUrl: "",
      categoryId: "",
      title: "",
      description: "",
      imageUrl: "",
      asin: "",
    },
  });

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
      
      // フォームに取得したデータをセット
      form.setValue("title", data.title);
      form.setValue("description", data.description || "");
      form.setValue("imageUrl", data.imageUrl);
      form.setValue("asin", data.asin);
      
      setFetchedData({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        asin: data.asin,
      });
      
      toast.success("商品情報を取得しました");
    } catch (error) {
      toast.error("商品情報の取得に失敗しました");
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await createProduct({
        ...values,
        attributes: {}, // 初期値は空のオブジェクト
      });
      
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
    onOpenChange(false);
  };

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
                <div className="relative aspect-square w-32 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={fetchedData.imageUrl}
                    alt={fetchedData.title || "商品画像"}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

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
                          <SelectItem key={category.id} value={category.id}>
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
            </div>

            {!fetchedData && (
              <Alert>
                <AlertDescription>
                  Amazon URLを入力して「取得」ボタンをクリックすると、PA-APIから商品情報を自動で取得します。
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
