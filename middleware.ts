import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { isTemporaryHandle } from "@/lib/validation/handleValidation";

// NextAuth.js v5では、auth()をmiddleware関数として使用します
export default auth((req) => {
  // デバッグ用にコンソールに情報を出力
  console.log("Auth middleware running");
  console.log("Auth state:", !!req.auth);
  console.log("Path:", req.nextUrl.pathname);
  console.log("User handle:", req.auth?.user?.handle);
  
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const user = req.auth?.user;
  
  // 認証必須のルート
  const protectedRoutes = ["/profile", "/settings", "/dashboard", "/user"];
  const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));
  
  // 認証ページ（既にログイン済みならリダイレクト）
  const authRoutes = ["/login"];
  const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route));
  
  // welcomeページかどうか
  const isWelcomePage = nextUrl.pathname.startsWith("/login/welcome");

  // 認証が必要なページに未認証でアクセスした場合、ログインページへ
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 認証済みユーザーの処理
  if (isAuthenticated && user) {
    const hasTemporaryHandle = isTemporaryHandle(user.handle);
    
    // 一時的なハンドルを持つユーザーの場合
    if (hasTemporaryHandle) {
      // welcomeページ以外にアクセスしようとした場合、welcomeページにリダイレクト
      if (!isWelcomePage) {
        console.log("Redirecting to welcome page - temporary handle:", user.handle);
        return NextResponse.redirect(new URL("/login/welcome", nextUrl));
      }
    } else {
      // 正規のハンドルを持つユーザーの場合
      // welcomeページまたはログインページにアクセスしようとした場合、userページにリダイレクト
      if (isWelcomePage || (isAuthRoute && !isWelcomePage)) {
        console.log("Redirecting to user page - valid handle:", user.handle);
        return NextResponse.redirect(new URL("/user", nextUrl));
      }
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
    "/article"
  ],
};