// دسترسی مدیر: فقط کاربر با role === "ADMIN" از این فیلتر رد می‌شود.
import { getCurrentUser } from "@/lib/session";

export async function getAdminUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.role !== "ADMIN") return null;
  return user;
}

/** پاسخ ۴۰۳ استاندارد برای رد شدن از فیلتر مدیر. */
export function forbiddenResponse(): Response {
  return Response.json({ error: "دسترسی فقط برای مدیر" }, { status: 403 });
}
