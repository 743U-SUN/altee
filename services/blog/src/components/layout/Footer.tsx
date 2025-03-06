import React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { siteConfig, docsConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { NewsletterSignup } from "./NewsletterSignup";

/**
 * サイトフッターコンポーネント
 * サーバーコンポーネントとして実装 (状態やイベントハンドラを持たないため)
 */
export function Footer({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "w-full bg-background border-t border-border py-8 mt-auto",
        className
      )}
      {...props}
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* サイト情報 */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-xl font-bold hover:text-primary transition duration-200"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {/* ナビゲーション */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">コンテンツ</h3>
              <ul className="space-y-2">
                {docsConfig.mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-sm text-muted-foreground hover:text-foreground transition-colors",
                        item.disabled && "opacity-60 pointer-events-none"
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">リンク</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href={siteConfig.links.twitter} 
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link 
                    href={siteConfig.links.github} 
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy-policy" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    利用規約
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* ニュースレター登録 - クライアントコンポーネント */}
          <NewsletterSignup />
        </div>

        {/* コピーライト */}
        <div className="mt-8 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-2 sm:mt-0">
              <Link 
                href="https://nextjs.org" 
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Next.js
              </Link>{" "}
              で構築
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );}