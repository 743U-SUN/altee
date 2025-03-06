"use client"

import { useState } from "react";

/**
 * ニュースレター登録コンポーネント
 * Reactのstate操作を含むためuseClientを使用するコンポーネントとして実装
 */
export function NewsletterSignup() {
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