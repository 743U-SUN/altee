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
      characterName?: string; // キャラクター名を追加
      handleChangeTokens?: number; // ハンドル変更可能回数
      handleChangeCount?: number;  // ハンドル変更回数
    } & DefaultSession["user"];
  }
  
  interface User extends DefaultUser {
    handle?: string;
    role?: string;
    iconUrl?: string; // アイコンURLを追加
    bannerUrl?: string; // バナーURLを追加
    characterName?: string; // キャラクター名を追加
    handleChangeTokens?: number; // ハンドル変更可能回数
    handleChangeCount?: number;  // ハンドル変更回数
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    handle?: string;
    role?: string;
    iconUrl?: string; // アイコンURLを追加
    bannerUrl?: string; // バナーURLを追加
    characterName?: string; // キャラクター名を追加
    handleChangeTokens?: number; // ハンドル変更可能回数
    handleChangeCount?: number;  // ハンドル変更回数
  }
}
