import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle?: string;  // オプショナルに変更
      role?: string;    // オプショナルに変更
      iconUrl?: string; // アイコンURLを追加
      bannerUrl?: string; // バナーURLを追加
    } & DefaultSession["user"];
  }
  
  interface User extends DefaultUser {
    handle?: string;
    role?: string;
    iconUrl?: string; // アイコンURLを追加
    bannerUrl?: string; // バナーURLを追加
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    handle?: string;
    role?: string;
    iconUrl?: string; // アイコンURLを追加
    bannerUrl?: string; // バナーURLを追加
  }
}
