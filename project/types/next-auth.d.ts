import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      userName?: string;
      role?: "user" | "talent" | "admin";
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    _id?: string;
    isVerified?: boolean;
    userName?: string;

  }

  interface JWT {
    _id?: string;
    isVerified?: boolean;
    userName?: string;
    accessToken?: string;
  }
}