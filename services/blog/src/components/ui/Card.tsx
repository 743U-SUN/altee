import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * カードのルートコンポーネント
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

/**
 * カードのヘッダーコンポーネント
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * カードのタイトルコンポーネント
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * カードの説明コンポーネント
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/**
 * カードのコンテンツコンポーネント
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * カードのフッターコンポーネント
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/**
 * カードの画像コンポーネント
 */
const CardImage = React.forwardRef<
  HTMLDivElement,
  React.ImgHTMLAttributes<HTMLImageElement> & { overlay?: boolean }
>(({ className, src, alt = "", overlay = false, ...props }, ref) => (
  <div className="relative w-full overflow-hidden rounded-t-lg">
    <img
      ref={ref as React.Ref<HTMLImageElement>}
      src={src}
      alt={alt}
      className={cn("w-full h-auto object-cover", className)}
      {...props}
    />
    {overlay && (
      <div className="absolute inset-0 bg-foreground/10 transition-opacity hover:opacity-0" />
    )}
  </div>
));
CardImage.displayName = "CardImage";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardImage,
};