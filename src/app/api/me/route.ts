import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isProfileComplete } from "@/lib/profile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  // پروفایل کامل = نام + نام خانوادگی + شماره تماس؛ پیش‌نیاز حل تمرین برای کاربران عادی
  return NextResponse.json({
    user,
    profileComplete: isProfileComplete(user),
    mustCompleteProfile: user.role !== "ADMIN" && !isProfileComplete(user),
  });
}
