// POST /api/auth/register — ثبت‌نام با شماره تماس یا نام کاربری + رمز عبور
// ایمیل از چرخه‌ی ثبت‌نام حذف شده (در اسکیما اختیاری مانده برای سازگاری با حساب‌های قدیمی).
// مشخصات کامل پروفایل (نام، نام خانوادگی، شماره تماس) بعد از ورود تکمیل می‌شود.
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { parseIdentifier } from "@/lib/identifier";

const registerSchema = z.object({
  identifier: z
    .string()
    .max(120, "شناسه خیلی طولانی است")
    .min(1, "شماره تماس یا نام کاربری را وارد کنید"),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse({
    identifier: body.identifier ?? "",
    password: body.password,
  });
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "ورودی نامعتبر";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  // تشخیص نوع شناسه: شماره تماس یا نام کاربری (با نرمال‌سازی ارقام فارسی و +98)
  const id = parseIdentifier(parsed.data.identifier);
  if (!id.ok || !id.value) {
    return NextResponse.json(
      { error: id.error ?? "شناسه معتبر نیست" },
      { status: 400 },
    );
  }

  // بررسی یکتایی شناسه
  const existing = await db.user.findFirst({
    where:
      id.kind === "phone"
        ? { phone: id.value }
        : { username: { equals: id.value, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error:
          id.kind === "phone"
            ? "این شماره تماس قبلاً ثبت شده است"
            : "این نام کاربری قبلاً ثبت شده است",
      },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      ...(id.kind === "phone" ? { phone: id.value } : { username: id.value }),
      passwordHash: hashPassword(parsed.data.password),
    },
  });

  // هر کاربر یک شرکت مجازی دارد
  await db.company.create({
    data: { userId: user.id, name: "شرکت من" },
  });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    identifierKind: id.kind,
  });
}
