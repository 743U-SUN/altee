'use client';

import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'カラー名を入力してください'),
  nameEn: z.string().min(1, '英語名を入力してください').regex(/^[a-zA-Z\s]+$/, '英語のみ入力できます'),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '正しい形式で入力してください（例: #000000）').optional().or(z.literal('')),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface ColorCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ColorCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: ColorCreateDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nameEn: '',
      hexCode: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'カラーの作成に失敗しました');
      }

      toast({
        title: '成功',
        description: 'カラーを作成しました',
      });

      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : 'カラーの作成に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新しいカラーを作成</DialogTitle>
          <DialogDescription>
            商品のカラーバリエーションを登録します
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カラー名（日本語）</FormLabel>
                  <FormControl>
                    <Input placeholder="ブラック" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カラー名（英語）</FormLabel>
                  <FormControl>
                    <Input placeholder="Black" {...field} />
                  </FormControl>
                  <FormDescription>
                    商品フィルターなどで使用されます
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hexCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カラーコード（任意）</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input placeholder="#000000" {...field} className="flex-1" />
                      {field.value && (
                        <div
                          className="w-10 h-10 rounded border border-gray-300"
                          style={{ backgroundColor: field.value }}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    16進数カラーコード（例: #FF0000）
                  </FormDescription>
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
                      このカラーを商品登録時に選択可能にする
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
                作成
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}