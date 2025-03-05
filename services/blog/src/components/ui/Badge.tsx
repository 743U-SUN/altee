import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * バッジの様々なバリエーションを定義するための設定
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-green-500 text-white hover:bg-green-500/80",
        warning: 
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        info: 
          "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
        neutral:
          "border-transparent bg-gray-500 text-white hover:bg-gray-500/80",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
);

/**
 * バッジコンポーネントのプロパティ型定義
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  as?: React.ElementType;
  href?: string;
}

/**
 * バッジコンポーネント
 * カテゴリやステータスなどを表示するためのラベル要素
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, interactive, as: Component = "div", href, ...props }, ref) => {
    // hrefが指定されている場合はaタグとしてレンダリング
    const Comp = href ? "a" : Component;
    
    return (
      <Comp
        ref={ref}
        href={href}
        className={cn(badgeVariants({ variant, size, interactive, className }))}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };