import React from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { siteConfig, docsConfig } from "@/config/site";
import { cn } from "@/lib/utils";

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

          {/* ニュースレター登録 - コンポーネントをClient側に分離する */}
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
  );
}

/**
 * ニュースレター登録コンポーネント
 * Reactのstate操作を含むためuseClientを使用するコンポーネントとして実装
 */
import { useState } from "react";

"use client"
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここでニュースレター登録APIを呼び出す
    console.log("ニュースレター登録:", email);
    // 登録成功メッセージ表示などの処理
    setEmail("");
  };
  
  return (
    <div className="md:col-span-1">
      <h3 className="text-sm font-semibold mb-3">ニュースレター</h3>
      <p className="text-sm text-muted-foreground mb-2">
        最新の記事やお知らせを受け取りましょう
      </p>
      <form className="mt-2 flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="メールアドレス"
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-md"
        >
          登録
        </button>
      </form>
    </div>
  );
}