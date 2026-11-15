// منطق خالص وضعیت مسیر یادگیری و قفل سطح — بدون وابستگی به React یا دیتابیس.

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface LessonInfo {
  slug: string;
  level: 1 | 2;
  order: number;
}

export type ProgressMap = Record<string, LessonStatus>;

export interface LessonState {
  slug: string;
  level: 1 | 2;
  order: number;
  status: LessonStatus;
  locked: boolean;
}

export interface LevelState {
  level: 1 | 2;
  total: number;
  completedCount: number;
  unlocked: boolean;
  lessons: LessonState[];
}

export interface PathState {
  levels: LevelState[];
  lessons: Record<string, LessonState>;
  overallCompleted: number;
  overallTotal: number;
}

/**
 * وضعیت مسیر را از روی فهرست درس‌ها و پیشرفت کاربر محاسبه می‌کند.
 * قاعده‌ی قفل: سطح ۲ تا زمانی که همه‌ی درس‌های سطح ۱ کامل نشوند قفل است.
 */
export function computePathState(
  lessons: LessonInfo[],
  progress: ProgressMap,
): PathState {
  const sorted = [...lessons].sort((a, b) => a.level - b.level || a.order - b.order);
  const level1 = sorted.filter((l) => l.level === 1);
  const level1Completed = level1.filter(
    (l) => progress[l.slug] === "completed",
  ).length;
  const level1Done = level1.length > 0 && level1Completed === level1.length;

  const buildLevel = (lvl: 1 | 2): LevelState => {
    const items = sorted.filter((l) => l.level === lvl);
    const unlocked = lvl === 1 || level1Done;
    const ls: LessonState[] = items.map((l) => ({
      slug: l.slug,
      level: l.level,
      order: l.order,
      status: progress[l.slug] ?? "not_started",
      locked: !unlocked,
    }));
    return {
      level: lvl,
      total: items.length,
      completedCount: ls.filter((x) => x.status === "completed").length,
      unlocked,
      lessons: ls,
    };
  };

  const levels = [buildLevel(1), buildLevel(2)].filter(
    (l) => l.total > 0,
  );

  const lessonsMap: Record<string, LessonState> = {};
  for (const l of sorted) {
    const unlocked = l.level === 1 || level1Done;
    lessonsMap[l.slug] = {
      slug: l.slug,
      level: l.level,
      order: l.order,
      status: progress[l.slug] ?? "not_started",
      locked: !unlocked,
    };
  }

  const overallCompleted = sorted.filter(
    (l) => progress[l.slug] === "completed",
  ).length;

  return {
    levels,
    lessons: lessonsMap,
    overallCompleted,
    overallTotal: sorted.length,
  };
}
