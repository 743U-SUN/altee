import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
  size?: "default" | "sm" | "md" | "lg" | "xl" | "full";
}

/**
 * コンテンツを中央揃えにし、適切な最大幅を設定するコンテナコンポーネント
 */
export function Container({
  children,
  as: Component = "div",
  size = "default",
  className,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        {
          "max-w-screen-sm": size === "sm",
          "max-w-screen-md": size === "md", 
          "max-w-screen-lg": size === "lg",
          "max-w-screen-xl": size === "xl",
          "max-w-screen-2xl": size === "default",
          "max-w-none": size === "full",
        },
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * コンテンツセクションを表すコンポーネント
 * 上下のパディングを持つ
 */
export function Section({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "py-12 md:py-16",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * 段落テキストを表示するコンポーネント
 * レスポンシブなテキストサイズと行間を持つ
 */
export function Paragraph({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * ヒーローセクション用のコンテナ
 * 広々とした上下のパディングを持つ
 */
export function HeroContainer({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "py-16 md:py-24 lg:py-32",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * グリッドレイアウトを表示するコンテナ
 */
export function GridContainer({
  children,
  className,
  cols = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  cols?: 1 | 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:gap-8",
        {
          "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4": cols === 4,
          "sm:grid-cols-2 lg:grid-cols-3": cols === 3,
          "sm:grid-cols-2": cols === 2,
          "grid-cols-1": cols === 1,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}