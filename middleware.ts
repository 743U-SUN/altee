import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// ミドルウェア関数を修正：トークンの取得方法を修正
export default auth((req) => {
  // デバッグ用にコンソールに情報を出力
  console.log("Auth middleware running");
  console.log("Auth state:", !!req.auth);
  console.log("Path:", req.nextUrl.pathname);
  
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  
  // 認証必須のルート
  const protectedRoutes = ["/profile", "/settings", "/dashboard"];
  const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));
  
  // 認証ページ（既にログイン済みならリダイレクト）
  const authRoutes = ["/login"];
  const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route));

  // 認証が必要なページに未認証でアクセスした場合、ログインページへ
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 既にログイン済みでログインページにアクセスした場合、記事ページへ
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/article", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/profile/:path*", 
    "/settings/:path*", 
    "/dashboard/:path*",
    "/article"
  ],
};
