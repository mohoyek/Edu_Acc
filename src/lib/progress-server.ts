// کمک‌تابع سرور برای همگام‌سازی رکورد روزانه (streak) از روی تلاش‌های کاربر.
import { db } from "@/lib/db";
import { computeCurrentStreak } from "@/lib/progress";

export async function syncUserStreak(userId: string): Promise<number> {
  const quizAttempts = await db.quizAttempt.findMany({
    where: { userId },
    select: { createdAt: true },
  });
  const exerciseAttempts = await db.exerciseAttempt.findMany({
    where: { userId },
    select: { createdAt: true },
  });
  const activityMs = [
    ...quizAttempts.map((a) => a.createdAt.getTime()),
    ...exerciseAttempts.map((a) => a.createdAt.getTime()),
  ];
  const streak = computeCurrentStreak(activityMs, new Date());
  await db.user.update({
    where: { id: userId },
    data: { streak, lastActivityAt: new Date() },
  });
  return streak;
}
