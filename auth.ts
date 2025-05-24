import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";

// PrismaAdapterをカスタマイズ
const customPrismaAdapter: Adapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: Omit<AdapterUser, "id">): Promise<AdapterUser> => {
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
    const createdUser = await prisma.user.create({
      data: userData,
    });
    
    // AdapterUser型に適合するように変換（null → undefined）
    return {
      id: createdUser.id,
      email: createdUser.email,
      emailVerified: createdUser.emailVerified,
      name: createdUser.name ?? undefined,
      image: createdUser.iconUrl ?? undefined,
    };
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
        
        try {
          // データベースから最新のユーザー情報を取得
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { 
              handle: true, 
              role: true, 
              iconUrl: true, 
              bannerUrl: true,
              characterName: true,
              handleChangeTokens: true,
              handleChangeCount: true
            }
          });
          
          if (dbUser) {
            token.handle = dbUser.handle ?? undefined;
            token.role = dbUser.role ?? undefined;
            token.iconUrl = dbUser.iconUrl ?? undefined;
            token.bannerUrl = dbUser.bannerUrl ?? undefined;
            token.characterName = dbUser.characterName ?? undefined;
            token.handleChangeTokens = dbUser.handleChangeTokens;
            token.handleChangeCount = dbUser.handleChangeCount;
          }
        } catch (error) {
          console.error('Database error in jwt callback:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // トークンからセッションにユーザー情報を設定
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        
        try {
          // 毎回データベースから最新のユーザー情報を取得
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { 
              handle: true, 
              role: true, 
              iconUrl: true, 
              bannerUrl: true,
              characterName: true,
              handleChangeTokens: true,
              handleChangeCount: true
            }
          });
          
          if (dbUser) {
            session.user.handle = dbUser.handle ?? undefined;
            session.user.role = dbUser.role ?? undefined;
            session.user.iconUrl = dbUser.iconUrl ?? undefined;
            session.user.bannerUrl = dbUser.bannerUrl ?? undefined;
            session.user.characterName = dbUser.characterName ?? undefined;
            session.user.handleChangeTokens = dbUser.handleChangeTokens;
            session.user.handleChangeCount = dbUser.handleChangeCount;
          } else {
            // ユーザーが見つからない場合のフォールバック
            console.warn('User not found in database:', token.id);
            // トークンの情報を使用（古い情報でもセッションを維持）
            if (token.handle !== undefined) session.user.handle = token.handle as string;
            if (token.role !== undefined) session.user.role = token.role as string;
            if (token.iconUrl !== undefined) session.user.iconUrl = token.iconUrl as string;
            if (token.bannerUrl !== undefined) session.user.bannerUrl = token.bannerUrl as string;
            if (token.characterName !== undefined) session.user.characterName = token.characterName as string;
          }
        } catch (error) {
          // データベースエラーの場合はトークンの情報を使用
          console.error('Database error in session callback:', error);
          if (token.handle !== undefined) session.user.handle = token.handle as string;
          if (token.role !== undefined) session.user.role = token.role as string;
          if (token.iconUrl !== undefined) session.user.iconUrl = token.iconUrl as string;
          if (token.bannerUrl !== undefined) session.user.bannerUrl = token.bannerUrl as string;
          if (token.characterName !== undefined) session.user.characterName = token.characterName as string;
        }
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