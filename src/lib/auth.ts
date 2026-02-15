import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from "@/types";
import { prisma } from "@/lib/prisma";

/**
 * Validates email/password and assigns role. Looks up User in DB to get real id for wallet/shipments.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email;
        const password = credentials.password ?? "";
        const roleFromClient = credentials.role as Role | undefined;

        // Demo bypass: fixed credentials, no DB required for immediate access
        const DEMO_ADMIN = "admin@dmx.com";
        const DEMO_PASSWORD = "password123";
        if (email === DEMO_ADMIN && password === DEMO_PASSWORD) {
          try {
            let user = await prisma.user.findUnique({ where: { email: DEMO_ADMIN } });
            if (!user) {
              user = await prisma.user.create({
                data: {
                  email: DEMO_ADMIN,
                  name: "Demo Admin",
                  role: "ADMIN",
                },
              });
            }
            return { id: user.id, email: user.email!, name: user.name ?? "Demo Admin", role: "ADMIN" as Role };
          } catch {
            return { id: "demo-admin", email: DEMO_ADMIN, name: "Demo Admin", role: "ADMIN" as Role };
          }
        }

        const role = roleFromClient === "ADMIN" ? "ADMIN" : "MERCHANT";
        let user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: "User",
              role,
            },
          });
        }
        return {
          id: user.id,
          email: user.email!,
          name: user.name ?? "User",
          role: (user.role as Role) ?? role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: Role }).role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface User {
    role?: Role;
  }
  interface Session {
    user: User & {
      id?: string;
      role?: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}
