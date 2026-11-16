// منطق خالص محاسبه‌ی پیشرفت کاربر — بدون وابستگی به React یا دیتابیس.

const DAY_MS = 86_400_000;

export interface ProgressLesson {
  id: string;
  slug: string;
  level: number;
  title: string;
}

export interface ProgressInput {
  lessons: ProgressLesson[];
  progress: Record<string, string>;
  quizAttempts: { lessonId: string; score: number; total: number; passed: boolean }[];
  exercises: { id: string; lessonId: string | null }[];
  exerciseAttempts: { exerciseId: string; passed: boolean }[];
  activityMs: number[];
  now: Date;
}

export interface LevelProgress {
  level: number;
  completed: number;
  total: number;
  percent: number;
}

export interface MasteryRow {
  lessonId: string;
  slug: string;
  title: string;
  level: number;
  percent: number;
  quizScore: number | null;
}

export interface WeakPoint {
  slug: string;
  title: string;
  reason: string;
}

export interface ProgressResult {
  levelProgress: LevelProgress[];
  mastery: MasteryRow[];
  weakPoints: WeakPoint[];
  weeklyActivity: { dateMs: number; count: number }[];
  streak: number;
  stats: {
    totalLessons: number;
    completedLessons: number;
    totalExercises: number;
    solvedExercises: number;
  };
}

/** رکورد روزانه: تعداد روزهای متوالی با فعالیت، تا امروز یا دیروز. */
export function computeCurrentStreak(activityMs: number[], now: Date): number {
  if (activityMs.length === 0) return 0;
  const dayKey = (ms: number) => Math.floor(ms / DAY_MS);
  const days = new Set(activityMs.map(dayKey));
  const todayKey = dayKey(now.getTime());
  let cursor = days.has(todayKey) ? todayKey : todayKey - 1;
  if (!days.has(cursor)) return 0;
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

/** فعالیت ۷ روز اخیر. */
export function computeWeeklyActivity(
  activityMs: number[],
  now: Date,
  days = 7,
): { dateMs: number; count: number }[] {
  const todayKey = Math.floor(now.getTime() / DAY_MS);
  const buckets: { dateMs: number; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    buckets.push({ dateMs: (todayKey - i) * DAY_MS, count: 0 });
  }
  const idx = new Map(buckets.map((b, i) => [Math.floor(b.dateMs / DAY_MS), i]));
  for (const ms of activityMs) {
    const k = Math.floor(ms / DAY_MS);
    const i = idx.get(k);
    if (i !== undefined) buckets[i].count++;
  }
  return buckets;
}

function bestQuizScorePerLesson(
  attempts: ProgressInput["quizAttempts"],
): Map<string, { percent: number; score: number; total: number }> {
  const m = new Map<string, { percent: number; score: number; total: number }>();
  for (const a of attempts) {
    const pct = a.total > 0 ? (a.score / a.total) * 100 : 0;
    const prev = m.get(a.lessonId);
    if (!prev || pct > prev.percent) {
      m.set(a.lessonId, { percent: pct, score: a.score, total: a.total });
    }
  }
  return m;
}

export function computeProgress(input: ProgressInput): ProgressResult {
  const { lessons, progress, quizAttempts, exercises, exerciseAttempts, activityMs, now } = input;

  const solvedExerciseIds = new Set(
    exerciseAttempts.filter((a) => a.passed).map((a) => a.exerciseId),
  );

  const byLevel = new Map<number, ProgressLesson[]>();
  for (const l of lessons) {
    const arr = byLevel.get(l.level) ?? [];
    arr.push(l);
    byLevel.set(l.level, arr);
  }

  const levelProgress: LevelProgress[] = [];
  for (const [level, ls] of [...byLevel.entries()].sort((a, b) => a[0] - b[0])) {
    const completed = ls.filter((l) => progress[l.id] === "completed").length;
    const total = ls.length;
    levelProgress.push({
      level,
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  const bestQuiz = bestQuizScorePerLesson(quizAttempts);
  const exercisesByLesson = new Map<string, { total: number; solved: number }>();
  for (const ex of exercises) {
    if (!ex.lessonId) continue;
    const cur = exercisesByLesson.get(ex.lessonId) ?? { total: 0, solved: 0 };
    cur.total++;
    if (solvedExerciseIds.has(ex.id)) cur.solved++;
    exercisesByLesson.set(ex.lessonId, cur);
  }

  const mastery: MasteryRow[] = lessons.map((l) => {
    const quiz = bestQuiz.get(l.id);
    const quizPct = quiz ? quiz.percent : 0;
    const ex = exercisesByLesson.get(l.id);
    let percent: number;
    if (ex) {
      const exPct = ex.total > 0 ? (ex.solved / ex.total) * 100 : 0;
      percent = Math.round((quizPct + exPct) / 2);
    } else {
      percent = Math.round(quizPct);
    }
    return {
      lessonId: l.id,
      slug: l.slug,
      title: l.title,
      level: l.level,
      percent,
      quizScore: quiz ? quiz.percent : null,
    };
  });

  const weakPoints: WeakPoint[] = mastery
    .filter((m) => m.percent < 60)
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 4)
    .map((m) => {
      const isCompleted = progress[m.lessonId] === "completed";
      return {
        slug: m.slug,
        title: m.title,
        reason: isCompleted ? `تسلط ${m.percent}٪ — مرور کن` : "هنوز کامل نشده — شروع کن",
      };
    });

  const completedLessons = lessons.filter((l) => progress[l.id] === "completed").length;
  const totalExercises = exercises.length;
  const solvedExercises = exercises.filter((e) => solvedExerciseIds.has(e.id)).length;

  return {
    levelProgress,
    mastery,
    weakPoints,
    weeklyActivity: computeWeeklyActivity(activityMs, now),
    streak: computeCurrentStreak(activityMs, now),
    stats: {
      totalLessons: lessons.length,
      completedLessons,
      totalExercises,
      solvedExercises,
    },
  };
}
