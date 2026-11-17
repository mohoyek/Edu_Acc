// GET /api/admin/users        — فهرست همه‌ی کاربران + خلاصه‌ی پیشرفت هرکدام
// GET /api/admin/users?id=... — جزئیات کامل یک کاربر (درس‌به‌درس + نشان‌ها + تلاش‌های اخیر)
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser, forbiddenResponse } from "@/lib/admin-server";
import { computeProgress, type ProgressInput } from "@/lib/progress";
import { summarizeProgress, type AdminUserSummary } from "@/lib/admin";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return forbiddenResponse();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) return userDetail(id);

  const lessons = await db.lesson.findMany({
    orderBy: [{ level: "asc" }, { order: "asc" }],
    select: { id: true, slug: true, level: true, order: true, title: true },
  });

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      points: true,
      level: true,
      streak: true,
      createdAt: true,
      lastActivityAt: true,
    },
  });

  const [allProgress, allQuiz, allExAttempts, exercises, badgeCounts] =
    await Promise.all([
      db.lessonProgress.findMany({
        select: { userId: true, lessonId: true, status: true },
      }),
      db.quizAttempt.findMany({
        select: { userId: true, lessonId: true, score: true, total: true, passed: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      db.exerciseAttempt.findMany({
        select: { userId: true, exerciseId: true, passed: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      db.exercise.findMany({ select: { id: true, lessonId: true } }),
      db.userBadge.groupBy({ by: ["userId"], _count: { _all: true } }),
    ]);

  // گروه‌بندی داده‌ها بر اساس کاربر
  const progressBy = new Map<string, Record<string, string>>();
  for (const p of allProgress) {
    const m = progressBy.get(p.userId) ?? {};
    m[p.lessonId] = p.status;
    progressBy.set(p.userId, m);
  }
  const quizBy = new Map<string, ProgressInput["quizAttempts"]>();
  for (const a of allQuiz) {
    const arr = quizBy.get(a.userId) ?? [];
    arr.push({ lessonId: a.lessonId, score: a.score, total: a.total, passed: a.passed });
    quizBy.set(a.userId, arr);
  }
  const exAttemptBy = new Map<string, ProgressInput["exerciseAttempts"]>();
  const activityBy = new Map<string, number[]>();
  for (const a of allExAttempts) {
    const arr = exAttemptBy.get(a.userId) ?? [];
    arr.push({ exerciseId: a.exerciseId, passed: a.passed });
    exAttemptBy.set(a.userId, arr);
    const act = activityBy.get(a.userId) ?? [];
    act.push(a.createdAt.getTime());
    activityBy.set(a.userId, act);
  }
  const quizDatesBy = new Map<string, number[]>();
  for (const a of allQuiz) {
    const arr = quizDatesBy.get(a.userId) ?? [];
    arr.push(a.createdAt.getTime());
    quizDatesBy.set(a.userId, arr);
  }

  const badgeCountBy = new Map<string, number>(
    badgeCounts.map((b) => [b.userId, b._count._all]),
  );

  const exerciseInput = exercises.map((e) => ({ id: e.id, lessonId: e.lessonId }));
  const lessonInput = lessons.map((l) => ({
    id: l.id,
    slug: l.slug,
    level: l.level,
    title: l.title,
  }));

  const now = new Date();
  const rows = users.map((u) => {
    const activityMs = [...(quizDatesBy.get(u.id) ?? []), ...(activityBy.get(u.id) ?? [])];
    const input: ProgressInput = {
      lessons: lessonInput,
      progress: progressBy.get(u.id) ?? {},
      quizAttempts: quizBy.get(u.id) ?? [],
      exercises: exerciseInput,
      exerciseAttempts: exAttemptBy.get(u.id) ?? [],
      activityMs,
      now,
    };
    const summary: AdminUserSummary = summarizeProgress(computeProgress(input));
    return {
      ...u,
      summary,
      badgesCount: badgeCountBy.get(u.id) ?? 0,
    };
  });

  const activeLastWeek = users.filter(
    (u) =>
      u.lastActivityAt !== null &&
      now.getTime() - u.lastActivityAt.getTime() <= 7 * 24 * 60 * 60 * 1000,
  ).length;

  const pendingResets = await db.passwordResetRequest.count({
    where: { status: "PENDING" },
  });

  return NextResponse.json({
    users: rows,
    overview: {
      totalUsers: users.length,
      activeLastWeek,
      pendingResets,
      totalLessons: lessons.length,
    },
  });
}

/** جزئیات یک کاربر برای نمای بازشده‌ی جدول مدیر. */
async function userDetail(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      points: true,
      level: true,
      streak: true,
      createdAt: true,
      lastActivityAt: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  const lessons = await db.lesson.findMany({
    orderBy: [{ level: "asc" }, { order: "asc" }],
    select: { id: true, slug: true, level: true, order: true, title: true },
  });

  const progressRecords = await db.lessonProgress.findMany({
    where: { userId: id },
    select: { lessonId: true, status: true },
  });
  const progress: Record<string, string> = {};
  for (const p of progressRecords) progress[p.lessonId] = p.status;

  const quizAttempts = await db.quizAttempt.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: { lesson: { select: { title: true } } },
    take: 10,
  });

  const exercises = await db.exercise.findMany({ select: { id: true, lessonId: true } });
  const exerciseAttempts = await db.exerciseAttempt.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: { exercise: { select: { title: true, slug: true } } },
    take: 10,
  });

  // برای computeProgress همه‌ی تلاش‌ها لازم است (نه فقط ۱۰ تای اخیر)
  const allQuiz = await db.quizAttempt.findMany({
    where: { userId: id },
    select: { lessonId: true, score: true, total: true, passed: true, createdAt: true },
  });
  const allExAttempts = await db.exerciseAttempt.findMany({
    where: { userId: id },
    select: { exerciseId: true, passed: true, createdAt: true },
  });

  const input: ProgressInput = {
    lessons: lessons.map((l) => ({ id: l.id, slug: l.slug, level: l.level, title: l.title })),
    progress,
    quizAttempts: allQuiz.map((a) => ({
      lessonId: a.lessonId,
      score: a.score,
      total: a.total,
      passed: a.passed,
    })),
    exercises: exercises.map((e) => ({ id: e.id, lessonId: e.lessonId })),
    exerciseAttempts: allExAttempts.map((a) => ({ exerciseId: a.exerciseId, passed: a.passed })),
    activityMs: [
      ...allQuiz.map((a) => a.createdAt.getTime()),
      ...allExAttempts.map((a) => a.createdAt.getTime()),
    ],
    now: new Date(),
  };
  const result = computeProgress(input);

  const badges = await db.userBadge.findMany({
    where: { userId: id },
    include: { badge: { select: { slug: true, title: true, icon: true } } },
    orderBy: { awardedAt: "desc" },
  });

  return NextResponse.json({
    user,
    mastery: result.mastery,
    stats: result.stats,
    badges: badges.map((b) => ({
      slug: b.badge.slug,
      title: b.badge.title,
      icon: b.badge.icon,
      awardedAt: b.awardedAt,
    })),
    recentQuizAttempts: quizAttempts.map((a) => ({
      id: a.id,
      lessonTitle: a.lesson.title,
      score: a.score,
      total: a.total,
      passed: a.passed,
      createdAt: a.createdAt,
    })),
    recentExerciseAttempts: exerciseAttempts.map((a) => ({
      id: a.id,
      exerciseTitle: a.exercise.title,
      exerciseSlug: a.exercise.slug,
      passed: a.passed,
      createdAt: a.createdAt,
    })),
  });
}
