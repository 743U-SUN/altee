import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

/**
 * アバターのルートコンポーネント
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * アバター画像コンポーネント
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * アバターのフォールバックコンポーネント（画像が読み込めない場合に表示）
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * 名前からイニシャルを生成する関数
 */
function getInitials(name: string): string {
  if (!name) return "";
  
  // 名前を単語に分割し、各単語の最初の文字を大文字で取得
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2) // 最大2文字まで
    .join("");
}

/**
 * ユーザーアバターコンポーネント
 * 画像URL、名前、サイズを受け取り、適切なアバターを表示
 */
interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ src, name, size = "md", className, ...props }, ref) => {
    // サイズに基づいてクラスを決定
    const sizeClasses = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };
    
    // 名前からイニシャルを生成
    const initials = name ? getInitials(name) : "";
    
    return (
      <Avatar
        ref={ref}
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        {src ? (
          <AvatarImage src={src} alt={name || "ユーザーアバター"} />
        ) : null}
        <AvatarFallback delayMs={600}>
          {initials || "?"} 
        </AvatarFallback>
      </Avatar>
    );
  }
);
UserAvatar.displayName = "UserAvatar";

export { Avatar, AvatarImage, AvatarFallback, UserAvatar };