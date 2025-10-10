// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import connectDB from "@/lib/connectDB";
// import UserModel from "@/models/user.model";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Email and password are required");
//         }

//         await connectDB();
//         const user = await UserModel.findOne({ email: credentials.email });

//         if (!user) {
//           throw new Error("User not found");
//         }

//         // Allow talents to sign in even if not verified
//         if (!user.isVerified) {
//           // Return user data but indicate verification pending
//           const isPasswordValid = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );
//           if (!isPasswordValid) {
//             throw new Error("Invalid password");
//           }
//           return {
//             id: user._id.toString(),
//             email: user.email,
//             userName: user.userName,
//             isVerified: user.isVerified,
//           };
//         }

//         // For non-talent users, require verification
//         if (!user.isVerified) {
//           throw new Error("Please verify your account before signing in.");
//         }

//         const isPasswordValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );
//         if (!isPasswordValid) {
//           throw new Error("Invalid password");
//         }

//         return {
//           id: user._id.toString(),
//           email: user.email,
//           userName: user.userName,
//           isVerified: user.isVerified,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token._id = user.id;
//         token.userName = user.userName;
//         token.isVerified = user.isVerified;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (token) {
//         session.user._id = token._id;
//         session.user.userName = token.userName;
//         session.user.isVerified = token.isVerified;
//       }
//       return session;
//     },
//   },

//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   pages: {
//     signIn: "/sign-in",
//     error: "/auth/error",
//   },
// };

// app/api/auth/[...nextauth]/options.ts (or wherever you keep authOptions)
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
          throw new Error("Email and password are required");
        }

        await connectDB();
        const email = credentials.email.trim().toLowerCase();
        const user = await UserModel.findOne({ email });

        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Invalid password");

        // Allow talents to sign in even if not verified
        if (!user.isVerified && user.role !== "talent") {
          throw new Error("Please verify your account before signing in.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          userName: user.userName,
          isVerified: user.isVerified,
          role: user.role, // include role
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
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any)._id = token._id;
        (session.user as any).userName = token.userName as string;
        (session.user as any).isVerified = token.isVerified as boolean;
        (session.user as any).role = token.role as "user" | "talent" | "admin";
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/sign-in", error: "/auth/error" },
};
