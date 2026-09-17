import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

/**
 * Shared Auth.js v5 config factory.
 * Each project calls createAuthConfig(prisma, { verifyCredentials })
 * and passes its own prisma client + password-check function, since
 * those are the only truly project-specific pieces.
 */
export function createAuthConfig(prisma, { verifyCredentials }) {
  return NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      Credentials({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        authorize: verifyCredentials,
      }),
    ],
    session: { strategy: "jwt" },
    pages: {
      signIn: "/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) token.role = user.role;
        return token;
      },
      async session({ session, token }) {
        if (session.user) session.user.role = token.role;
        return session;
      },
    },
  });
}
