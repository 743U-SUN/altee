import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";

// PrismaAdapterをカスタマイズ
const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data) => {
    // ユーザー作成時に暫定的なハンドルを設定
    // ランダムな文字列を生成（Edge Runtimeでも動作する方法）
    const randomString = Math.random().toString(36).substring(2, 10);
    const temporaryHandle = `temp_${randomString}`;
    
    // データをマップして、imageをiconUrlに変換
    const userData = {
      name: data.name,
      email: data.email,
      emailVerified: data.emailVerified,
      handle: temporaryHandle, // 暫定的なハンドル
      iconUrl: data.image // imageフィールドをiconUrlにマップ
    };
    
    // ユーザー作成
    return prisma.user.create({
      data: userData,
    });
  },
};

/**
 * Auth.js v5のコンフィグレーション
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: customPrismaAdapter,
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
    async jwt({ token, user, account, profile }) {
      // 初回サインイン時にユーザー情報をトークンに追加
      if (user) {
        token.id = user.id;
        token.email = user.email;
        
        // データベースから最新のユーザー情報を取得
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { handle: true, role: true, iconUrl: true }
        });
        
        if (dbUser) {
          token.handle = dbUser.handle;
          token.role = dbUser.role;
          token.iconUrl = dbUser.iconUrl;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // トークンからセッションにユーザー情報を設定
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        
        // handle、role、iconUrlがある場合のみ設定
        if (token.handle) session.user.handle = token.handle as string;
        if (token.role) session.user.role = token.role as string;
        if (token.iconUrl) session.user.iconUrl = token.iconUrl as string;
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
});