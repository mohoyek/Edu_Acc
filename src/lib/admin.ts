// منطق خالص خلاصه‌ی پیشرفت کاربر برای پنل مدیر — بدون وابستگی به React یا دیتابیس.

import type { ProgressResult } from "@/lib/progress";

export interface AdminUserSummary {
  /** میانگین درصد تسلط روی همه‌ی درس‌ها (۰..۱۰۰). */
  masteryPercent: number;
  /** میانگین درصد بهترین نمره‌ی کوییز درس‌هایی که کوییز داده. */
  quizAvgPercent: number | null;
  completedLessons: number;
  totalLessons: number;
  solvedExercises: number;
  totalExercises: number;
}

/** از نتیجه‌ی کامل computeProgress، خلاصه‌ی فشرده برای جدول مدیر می‌سازد. */
export function summarizeProgress(result: ProgressResult): AdminUserSummary {
  const masteryRows = result.mastery;
  const masteryPercent =
    masteryRows.length > 0
      ? Math.round(
          masteryRows.reduce((sum, m) => sum + m.percent, 0) / masteryRows.length,
        )
      : 0;

  const quizPercents = masteryRows
    .map((m) => m.quizScore)
    .filter((q): q is number => q !== null);
  const quizAvgPercent =
    quizPercents.length > 0
      ? Math.round(
          quizPercents.reduce((sum, q) => sum + q, 0) / quizPercents.length,
        )
      : null;

  return {
    masteryPercent,
    quizAvgPercent,
    completedLessons: result.stats.completedLessons,
    totalLessons: result.stats.totalLessons,
    solvedExercises: result.stats.solvedExercises,
    totalExercises: result.stats.totalExercises,
  };
}
