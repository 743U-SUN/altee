/**
 * デバイス編集モーダルコンポーネント
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateDevice } from '@/lib/actions/device-actions';
import { editDeviceFormSchema } from '@/lib/validation/device-validation';

interface EditDeviceModalProps {
  open: boolean;
  onClose: () => void;
  deviceId: number;
  currentNote?: string;
}

export function EditDeviceModal({
  open,
  onClose,
  deviceId,
  currentNote,
}: EditDeviceModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof editDeviceFormSchema>>({
    resolver: zodResolver(editDeviceFormSchema),
    defaultValues: {
      note: currentNote || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof editDeviceFormSchema>) => {
    setIsLoading(true);
    try {
      const result = await updateDevice(deviceId, {
        note: values.note,
      });

      if (result.success) {
        toast({
          title: '成功',
          description: 'デバイス情報を更新しました',
        });
        onClose();
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
        description: 'デバイスの更新に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>デバイス情報を編集</DialogTitle>
          <DialogDescription>
            デバイスのメモを編集できます
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="このデバイスについてのメモを入力..."
                      className="resize-none min-h-[100px]"
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
