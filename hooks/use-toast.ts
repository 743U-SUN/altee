/**
 * Toast通知用のカスタムフック
 * Sonnerライブラリを使用したshadcn/ui互換実装
 */

import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = (props: ToastProps | string) => {
    if (typeof props === 'string') {
      sonnerToast(props);
      return;
    }

    const { title, description, variant } = props;
    const message = title || description || '';
    const fullMessage = title && description ? `${title}: ${description}` : message;

    if (variant === 'destructive') {
      sonnerToast.error(fullMessage);
    } else {
      sonnerToast.success(fullMessage);
    }
  };

  return {
    toast,
  };
}
