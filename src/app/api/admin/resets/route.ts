// GET  /api/admin/resets — درخواست‌های فراموشی رمز (در انتظار + تاریخچه)
// POST /api/admin/resets — رسیدگی: ساخت رمز موقت یا رد درخواست
// توجه: رمز موقت فقط یک‌بار در پاسخ برگردانده می‌شود و ذخیره نمی‌شود (فقط هش روی کاربر).
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminUser, forbiddenResponse } from "@/lib/admin-server";
import { generateTempPassword } from "@/lib/password-reset";
import { hashPassword } from "@/lib/password";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return forbiddenResponse();

  const pending = await db.passwordResetRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
      },
    },
  });

  const history = await db.passwordResetRequest.findMany({
    where: { status: { not: "PENDING" } },
    orderBy: { resolvedAt: "desc" },
    take: 20,
    include: {
      user: { select: { id: true, name: true, username: true, email: true } },
      resolver: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ pending, history });
}

const actionSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["reset", "reject"]),
});

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return forbiddenResponse();

  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const request = await db.passwordResetRequest.findUnique({
    where: { id: parsed.data.requestId },
    include: {
      user: { select: { id: true, name: true, username: true, email: true } },
    },
  });
  if (!request) {
    return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
  }
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "این درخواست قبلاً رسیدگی شده است" }, { status: 409 });
  }

  if (parsed.data.action === "reject") {
    await db.passwordResetRequest.update({
      where: { id: request.id },
      data: { status: "REJECTED", resolvedAt: new Date(), resolvedBy: admin.id },
    });
    return NextResponse.json({ ok: true, action: "reject" });
  }

  // action === "reset": ساخت رمز موقت، ست روی کاربر، بستن درخواست
  const tempPassword = generateTempPassword(8);
  await db.user.update({
    where: { id: request.userId },
    data: { passwordHash: hashPassword(tempPassword) },
  });
  await db.passwordResetRequest.update({
    where: { id: request.id },
    data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: admin.id },
  });

  return NextResponse.json({
    ok: true,
    action: "reset",
    tempPassword, // فقط همین یک‌بار نمایش داده می‌شود
    user: {
      name: request.user.name,
      username: request.user.username,
      email: request.user.email,
    },
  });
}
