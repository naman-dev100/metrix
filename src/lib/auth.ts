import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

console.log("[Auth] authOptions initialized");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("[Auth] authorize() called with:", JSON.stringify(credentials));
          if (!credentials?.email || !credentials?.password) {
            console.log("[Auth] Missing credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("[Auth] User not found in DB");
            return null;
          }

          console.log("[Auth] User found:", user.email);
          const isPasswordValid = await bcrypt.compare(
            credentials.password!,
            user.password!
          );

          if (!isPasswordValid) {
            console.log("[Auth] Password mismatch");
            return null;
          }

          console.log("[Auth] Auth successful for:", user.email);
          console.log("[Auth] Returning user:", JSON.stringify({ id: user.id, email: user.email, name: user.name }));
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };;
        } catch (error) {
          console.error("[Auth] Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Fetch user data including username
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, username: true, name: true, email: true },
        });
        if (dbUser) {
          token.username = dbUser.username;
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string | null;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For Google OAuth, allow sign-in; handle username setup via session
      if (account?.provider === 'google' && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { username: true },
        });
        // Username check will be handled client-side after redirect
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
