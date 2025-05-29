import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/auth";

// NextAuth.js v5では、auth()をmiddleware関数として使用します
export default auth((req) => {
  // デバッグ用にコンソールに情報を出力
  console.log("Auth middleware running");
  console.log("Auth state:", !!req.auth);
  console.log("Path:", req.nextUrl.pathname);
  
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const user = req.auth?.user;
  
  // 認証必須のルート
  const protectedRoutes = ["/profile", "/settings", "/dashboard", "/user"];
  const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));
  
  // 管理者専用ルート（詳細なロールチェックは各ページで実行）
  const adminRoutes = ["/admin"];
  const isAdminRoute = adminRoutes.some(route => nextUrl.pathname.startsWith(route));
  
  // 認証ページ（既にログイン済みならリダイレクト）
  const authRoutes = ["/login"];
  const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route));
  
  // welcomeページかどうか
  const isWelcomePage = nextUrl.pathname.startsWith("/login/welcome");

  // 認証が必要なページに未認証でアクセスした場合、ログインページへ
  if ((isProtectedRoute || isAdminRoute) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  
  // 認証済みユーザーの処理
  if (isAuthenticated && user) {
    // 基本的な認証チェックのみ実行
    // 詳細なユーザー情報（handle、roleなど）の確認は各ページで実行
    
    // 認証済みでログインページにアクセスした場合は、適切なページにリダイレクト
    if (isAuthRoute && !isWelcomePage) {
      // 詳細なロールチェックは各ページで実行するため、とりあえずユーザーページにリダイレクト
      console.log("Redirecting authenticated user from login page");
      return NextResponse.redirect(new URL("/user", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/login/welcome",
    "/profile/:path*", 
    "/settings/:path*", 
    "/dashboard/:path*",
    "/user/:path*",
    "/article",
    "/admin/:path*"
  ],
};