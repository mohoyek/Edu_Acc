import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const registerSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر"),
  name: z.string().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "ورودی نامعتبر";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password, name } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "این ایمیل قبلاً ثبت شده است" },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash: hashPassword(password),
    },
  });

  // هر کاربر یک شرکت مجازی دارد
  await db.company.create({
    data: { userId: user.id, name: "شرکت من" },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
