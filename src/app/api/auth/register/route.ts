import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { validateProfile, displayName } from "@/lib/profile";

const registerSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse({
    email: body.email,
    password: body.password,
  });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "ورودی نامعتبر";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  // اعتبارسنجی نام/نام خانوادگی/تلفن با همان منطق پروفایل
  const validation = validateProfile({
    firstName: body.firstName ?? "",
    lastName: body.lastName ?? "",
    phone: body.phone ?? "",
  });
  if (!validation.ok || !validation.values) {
    const firstError =
      validation.errors.firstName ??
      validation.errors.lastName ??
      validation.errors.phone ??
      "اطلاعات نامعتبر است";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { firstName, lastName, phone } = validation.values;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "این ایمیل قبلاً ثبت شده است" },
      { status: 409 },
    );
  }

  // ایمیل‌های مدیر از متغیر محیطی ADMIN_EMAILS (جداشده با ویرگول)
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const role = adminEmails.includes(email) ? "ADMIN" : "USER";

  const user = await db.user.create({
    data: {
      email,
      firstName,
      lastName,
      phone,
      name: displayName(firstName, lastName),
      role,
      passwordHash: hashPassword(parsed.data.password),
    },
  });

  // هر کاربر یک شرکت مجازی دارد
  await db.company.create({
    data: { userId: user.id, name: "شرکت من" },
  });

  return NextResponse.json({ ok: true, userId: user.id });
}
