import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { normalizePhone } from "@/lib/phone";

export const authOptions: NextAuthOptions = {
  // در تولید حتماً باید NEXTAUTH_SECRET تنظیم شده باشد
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    // در SPA تک‌مسیری، ورود/ثبت‌نام از طریق hash route انجام می‌شود
    signIn: "/#/login",
  },
  providers: [
    CredentialsProvider({
      name: "ایمیل/نام کاربری و رمز",
      credentials: {
        email: { label: "ایمیل یا نام کاربری", type: "text" },
        password: { label: "رمز", type: "password" },
      },
      async authorize(credentials) {
        // شناسه‌ی ورود می‌تواند شماره تماس، نام کاربری یا ایمیل باشد.
        const identifier = credentials?.email?.trim();
        const password = credentials?.password ?? "";
        if (!identifier || !password) return null;

        // اگر ورودی شبیه شماره تماس بود، نرمال می‌کنیم (+98 / ارقام فارسی و …)
        const phoneRes = normalizePhone(identifier);

        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: { equals: identifier.toLowerCase(), mode: "insensitive" } },
              { username: { equals: identifier, mode: "insensitive" } },
              ...(phoneRes.value ? [{ phone: phoneRes.value }] : []),
            ],
          },
        });
        if (!user) return null;
        // حساب غیرفعال اصلاً وارد نمی‌شود (پیام عمومی، بدون افشای دلیل)
        if (!user.isActive) return null;
        if (!verifyPassword(password, user.passwordHash)) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
