import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      handle: string;
      role: string;
    } & DefaultSession["user"];
  }
  
  interface User {
    handle: string;
    role: string;
  }
}
