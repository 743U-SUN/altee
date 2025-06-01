'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LogoUploader } from './LogoUploader';

const formSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  slug: z.string().min(1, 'スラッグを入力してください').regex(/^[a-z0-9-]+$/, '小文字英数字とハイフンのみ使用できます'),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  website: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface ManufacturerEditDialogProps {
  manufacturer: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
    website: string | null;
    isActive: boolean;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ManufacturerEditDialog({
  manufacturer,
  open,
  onOpenChange,
  onSuccess,
}: ManufacturerEditDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: manufacturer.name,
      slug: manufacturer.slug,
      description: manufacturer.description || '',
      logoUrl: manufacturer.logoUrl || '',
      website: manufacturer.website || '',
      isActive: manufacturer.isActive,
    },
  });

  // manufacturerが変更されたらフォームをリセット
  useEffect(() => {
    form.reset({
      name: manufacturer.name,
      slug: manufacturer.slug,
      description: manufacturer.description || '',
      logoUrl: manufacturer.logoUrl || '',
      website: manufacturer.website || '',
      isActive: manufacturer.isActive,
    });
  }, [manufacturer, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/manufacturers/${manufacturer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'メーカーの更新に失敗しました');
      }

      toast({
        title: '成功',
        description: 'メーカーを更新しました',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'メーカーの更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>メーカーを編集</DialogTitle>
          <DialogDescription>
            メーカー情報を更新します
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メーカー名</FormLabel>
                  <FormControl>
                    <Input placeholder="Logicool" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>スラッグ</FormLabel>
                  <FormControl>
                    <Input placeholder="logicool" {...field} />
                  </FormControl>
                  <FormDescription>
                    URLなどで使用される識別子（小文字英数字とハイフン）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明（任意）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="スイスに本社を置く、PC周辺機器メーカー"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ロゴ</FormLabel>
                  <FormControl>
                    <LogoUploader
                      value={field.value}
                      onChange={field.onChange}
                      manufacturerName={form.watch('name')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>公式サイト（任意）</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.logicool.co.jp"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">有効化</FormLabel>
                    <FormDescription>
                      このメーカーを商品登録時に選択可能にする
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                更新
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}