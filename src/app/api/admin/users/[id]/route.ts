// PATCH  /api/admin/users/[id] — تغییر نقش/وضعیت: ارتقا، تنزل، فعال‌سازی، غیرفعال‌سازی
// DELETE /api/admin/users/[id] — حذف کامل کاربر به‌همراه همه‌ی داده‌هایش (حذف آبشاری)
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminUser, forbiddenResponse } from "@/lib/admin-server";
import { resolveAdminAction, canDeleteUser, type AdminAction } from "@/lib/admin-actions";

const actionSchema = z.object({
  action: z.enum(["promote", "demote", "activate", "deactivate"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return forbiddenResponse();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
  }
  const action: AdminAction = parsed.data.action;

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  // گارد قواعد مدیر (خودت را نمی‌توانی تنزل/غیرفعال کنی و …)
  const result = resolveAdminAction({ action, adminId: admin.id, target });
  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id },
    data: result.data,
    select: { id: true, role: true, isActive: true },
  });

  const labels: Record<AdminAction, string> = {
    promote: "کاربر به مدیر ارتقا یافت",
    demote: "مدیریت کاربر سلب شد",
    activate: "حساب کاربر فعال شد",
    deactivate: "حساب کاربر غیرفعال شد",
  };

  return NextResponse.json({ ok: true, message: labels[action], user: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return forbiddenResponse();

  const { id } = await params;

  const guard = canDeleteUser(admin.id, id);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: 400 });
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
  if (!target) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  // حذف آبشاری: شرکت، سندها، پیشرفت درس‌ها، تلاش‌های کوییز/تمرین، نشان‌ها و
  // درخواست‌های فراموشی رمز همه با onDelete: Cascade حذف می‌شوند.
  await db.user.delete({ where: { id } });

  return NextResponse.json({ ok: true, message: "کاربر و همه‌ی داده‌هایش حذف شد" });
}
