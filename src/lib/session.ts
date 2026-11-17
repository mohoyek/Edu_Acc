import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/** جلسه‌ی کاربر فعلی را همراه با رکورد کاربر از دیتابیس برمی‌گرداند. */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
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
  return user;
}
