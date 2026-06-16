import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

console.log("[Auth] authOptions initialized");

export const authOptions = {
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
          const email = String(credentials.email);
          const password = String(credentials.password);

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log("[Auth] User not found in DB");
            return null;
          }

          console.log("[Auth] User found:", user.email);
          const isPasswordValid = await bcrypt.compare(
            password,
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
          token.email = dbUser.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username as string | null;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For Google OAuth, allow sign-in; handle username setup via session
      if (account?.provider === 'google' && user.email) {
        await prisma.user.findUnique({
          where: { email: user.email },
          select: { username: true },
        });
        // Username check will be handled client-side after redirect
      }
      return true;
    },
    authorized({ auth, request }) {
      // Allow API routes to handle their own auth and return JSON 401
      // instead of being redirected to the login page (which returns HTML)
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return true;
      }
      // Allow auth-related pages (login, register)
      if (
        request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register")
      ) {
        return true;
      }
      return !!auth?.user;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
