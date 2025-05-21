import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import { generateUniqueHandle } from "./utils";

/**
 * Auth.js v5のコンフィグレーション
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: PrismaAdapter(prisma),
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
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.handle = user.handle;
        session.user.role = user.role;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      // 初回ログイン時にhandleを自動生成
      if (account?.provider && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          
          if (!existingUser) {
            // handleを自動生成して保存
            const handle = await generateUniqueHandle(user.name || user.email.split('@')[0]);
            await prisma.user.update({
              where: { id: user.id },
              data: { handle },
            });
          }
        } catch (error) {
          console.error("Error during sign in:", error);
          // エラーがあっても認証は続行
        }
      }
      
      return true;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
});
