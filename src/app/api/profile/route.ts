// GET  /api/profile  — اطلاعات پروفایل کاربر واردشده
// PATCH /api/profile — ویرایش نام، نام خانوادگی و شماره تماس
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { validateProfile, displayName } from "@/lib/profile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    firstName?: string;
    lastName?: string;
    phone?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const validation = validateProfile({
    firstName: body.firstName ?? "",
    lastName: body.lastName ?? "",
    phone: body.phone ?? "",
  });
  if (!validation.ok || !validation.values) {
    return NextResponse.json(
      { error: "اطلاعات پروفایل نامعتبر است", errors: validation.errors },
      { status: 400 },
    );
  }

  const { firstName, lastName, phone } = validation.values;

  // شماره تماس شناسه‌ی ورود است و یکتا — اگر عوض شده، نباید به حساب دیگری بخورد
  if (phone && phone !== user.phone) {
    const taken = await db.user.findFirst({
      where: { phone, id: { not: user.id } },
      select: { id: true },
    });
    if (taken) {
      return NextResponse.json(
        {
          error: "این شماره تماس به حساب دیگری تعلق دارد",
          errors: { phone: "این شماره تماس قبلاً در سایت ثبت شده است" },
        },
        { status: 400 },
      );
    }
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { firstName, lastName, phone, name: displayName(firstName, lastName) },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      points: true,
      level: true,
      streak: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
