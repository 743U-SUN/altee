import React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { siteConfig, docsConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

/**
 * サイトヘッダーコンポーネント
 */
export function Header({ sticky = true, className, ...props }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header
      className={cn(
        "w-full bg-background border-b border-border py-4",
        {
          "sticky top-0 z-40": sticky,
        },
        className
      )}
      {...props}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* サイトロゴ/タイトル */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold hover:text-primary transition duration-200"
            >
              {siteConfig.name}
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center gap-6">
            {docsConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium hover:text-primary transition-colors",
                  item.disabled && "opacity-60 pointer-events-none"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="block md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* モバイルナビゲーション */}
        {isMenuOpen && (
          <div className="mt-4 md:hidden border-t border-border pt-4 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {docsConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium hover:text-primary transition-colors px-2 py-1",
                    item.disabled && "opacity-60 pointer-events-none"
                  )}
                  onClick={toggleMenu}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}

/**
 * メニューアイコン（ハンバーガーアイコン）
 */
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );
}

/**
 * 閉じるアイコン（Xアイコン）
 */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}