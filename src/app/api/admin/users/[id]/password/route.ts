// POST /api/admin/users/[id]/password — تغییر رمز کاربر توسط مدیر
// رمز جدید را مدیر خودش تعیین می‌کند (یا با دکمه «تولید رمز موقت» می‌سازد)
// و خارج از سایت (تلفن/پیام‌رسان) به کاربر اعلام می‌شود.
// درخواست‌های در انتظارِ فراموشی رمزِ همین کاربر هم با این تغییر بسته می‌شوند.
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminUser, forbiddenResponse } from "@/lib/admin-server";
import { validateAdminPassword } from "@/lib/admin-actions";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  password: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return forbiddenResponse();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const passwordError = validateAdminPassword(parsed.data.password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
  if (!target) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  await db.user.update({
    where: { id },
    data: { passwordHash: hashPassword(parsed.data.password) },
  });

  // اگر این کاربر درخواست فراموشی رمزِ باز داشته، رسیدگی‌شده در نظر گرفته می‌شود
  await db.passwordResetRequest.updateMany({
    where: { userId: id, status: "PENDING" },
    data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: admin.id },
  });

  return NextResponse.json({
    ok: true,
    message: `رمز «${target.name ?? target.email}» تغییر شد`,
  });
}
