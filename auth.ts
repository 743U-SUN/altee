import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import { db } from "@/lib/prisma";

/**
 * Auth.js v5のコンフィグレーション（エッジランタイム対応）
 * - JWTセッション戦略を使用
 * - Prismaアダプターを使わずに軽量な認証を実現
 * - 重いデータベース操作は認証後に個別実行
 */
const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 基本的なバリデーションのみ実行
      if (!user.email) {
        return false;
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      // 初回サインイン時
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        // データベース操作はJWTトークンに最小限の情報のみ保存
        // 詳細なユーザー情報は後でsession callbackやページで取得
        token.needsUserSync = true; // 新規ユーザーかの判定フラグ
      }
      
      // データベースからユーザー情報を取得してroleを追加
      if (token.email && !token.role) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.sub = dbUser.id; // DBのIDで上書き
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // トークンからセッションにユーザー情報を設定
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        session.user.role = (token.role as string) || 'user';
        
        // データベースからのユーザー詳細情報の取得は各ページで実行
        // エッジランタイムでは最小限の情報のみセッションに含める
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  debug: process.env.NODE_ENV === "development",
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth(authConfig);