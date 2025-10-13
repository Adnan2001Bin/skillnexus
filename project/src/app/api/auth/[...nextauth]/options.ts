// app/api/auth/[...nextauth]/options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/connectDB";
import UserModel from "@/models/user.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          // Returning null = 401 CredentialsSignin (keeps the client mapping simple)
          return null;
        }

        await connectDB();
        const email = credentials.email.trim().toLowerCase();

        // IMPORTANT: password is select:false in the schema, so select it explicitly.
        const user = await UserModel.findOne({ email })
          .select("+password +verificationCode +verificationCodeExpires");

        // Keep messages generic for security; NextAuth will return CredentialsSignin (401).
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        // Gate unverified accounts if you want (recommended).
        // If you want freelancers to sign in before verification, tweak this condition.
        if (!user.isVerified) {
          // Throwing an Error becomes CredentialsSignin on the client.
          // You already map this to "Invalid email or password." If you want a specific message,
          // you can handle it via a custom error page or query param.
          throw new Error("Please verify your account before signing in.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          userName: user.userName,
          isVerified: user.isVerified,
          role: user.role as "client" | "freelancer" | "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = (user as any).id;
        token.userName = (user as any).userName;
        token.isVerified = (user as any).isVerified;
        token.role = (user as any).role; // "client" | "freelancer" | "admin"
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any)._id = token._id;
        (session.user as any).userName = token.userName as string;
        (session.user as any).isVerified = token.isVerified as boolean;
        (session.user as any).role = token.role as "client" | "freelancer" | "admin";
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/sign-in", error: "/auth/error" },
};
