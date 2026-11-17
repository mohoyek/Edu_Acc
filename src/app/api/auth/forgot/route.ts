// POST /api/auth/forgot — ثبت درخواست فراموشی رمز عبور برای رسیدگی مدیر
// نکته امنیتی: پاسخ همیشه یکسان است؛ وجود یا نبودن ایمیل لو نمی‌رود.
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "ورودی نامعتبر";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });

  if (user) {
    // اگر درخواست در انتظارِ همین کاربر وجود دارد، درخواست جدید نساز
    const pending = await db.passwordResetRequest.findFirst({
      where: { userId: user.id, status: "PENDING" },
      select: { id: true },
    });
    if (!pending) {
      await db.passwordResetRequest.create({ data: { userId: user.id } });
    }
  }

  // پاسخ عمومی — بدون افشای وجود حساب
  return NextResponse.json({
    ok: true,
    message: "اگر این ایمیل در سایت ثبت شده باشد، درخواست شما برای مدیر ارسال شد. پس از رسیدگی، رمز موقت از طریق شماره تماس شما به شما اعلام می‌شود.",
  });
}
