// POST /api/profile/password — تغییر رمز عبور با دانستن رمز فعلی
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";

const schema = z.object({
  currentPassword: z.string().min(1, "رمز فعلی را وارد کن"),
  newPassword: z.string().min(6, "رمز جدید حداقل ۶ کاراکتر"),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "ورودی نامعتبر";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const full = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!full) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  if (!verifyPassword(parsed.data.currentPassword, full.passwordHash)) {
    return NextResponse.json({ error: "رمز فعلی اشتباه است" }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });

  return NextResponse.json({ ok: true });
}
