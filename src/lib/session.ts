import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/** جلسه‌ی کاربر فعلی را همراه با رکورد کاربر از دیتابیس برمی‌گرداند.
 * کاربر غیرفعال (isActive=false) مثل واردنشده رفتار می‌شود تا همه‌ی APIها برایش بسته باشند. */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      points: true,
      level: true,
      streak: true,
      createdAt: true,
    },
  });
  if (!user || !user.isActive) return null;
  return user;
}
