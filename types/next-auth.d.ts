import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle?: string;  // オプショナルに変更
      role?: string;    // オプショナルに変更
    } & DefaultSession["user"];
  }
  
  interface User extends DefaultUser {
    handle?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    handle?: string;
    role?: string;
  }
}
