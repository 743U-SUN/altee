/**
 * デバイスバッジコンポーネント
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Package } from 'lucide-react';

interface DeviceBadgeProps {
  sourceType: 'official' | 'custom';
  showIcon?: boolean;
}

export function DeviceBadge({ sourceType, showIcon = true }: DeviceBadgeProps) {
  if (sourceType === 'official') {
    return (
      <Badge variant="default" className="gap-1">
        {showIcon && <CheckCircle2 className="h-3 w-3" />}
        公式商品
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      {showIcon && <Package className="h-3 w-3" />}
      カスタム商品
    </Badge>
  );
}
