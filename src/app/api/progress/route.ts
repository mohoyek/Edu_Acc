import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { computeProgress, type ProgressInput } from "@/lib/progress";
import { BADGE_DEFINITIONS, evaluateBadges, type BadgeContext } from "@/lib/badges";

/** GET /api/progress — داشبورد پیشرفت کامل + اهدای نشان‌های جدید */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  }

  const lessons = await db.lesson.findMany({
    orderBy: [{ level: "asc" }, { order: "asc" }],
    select: { id: true, slug: true, level: true, order: true, title: true },
  });

  const progressRecords = await db.lessonProgress.findMany({
    where: { userId: user.id },
    select: { lessonId: true, status: true },
  });
  const progress: Record<string, string> = {};
  for (const p of progressRecords) progress[p.lessonId] = p.status;

  const quizAttempts = await db.quizAttempt.findMany({
    where: { userId: user.id },
    select: { lessonId: true, score: true, total: true, passed: true, createdAt: true },
  });

  const exercises = await db.exercise.findMany({
    select: { id: true, lessonId: true },
  });

  const exerciseAttempts = await db.exerciseAttempt.findMany({
    where: { userId: user.id },
    select: { exerciseId: true, passed: true, createdAt: true },
  });

  const activityMs = [
    ...quizAttempts.map((a) => a.createdAt.getTime()),
    ...exerciseAttempts.map((a) => a.createdAt.getTime()),
  ];

  const input: ProgressInput = {
    lessons: lessons.map((l) => ({ id: l.id, slug: l.slug, level: l.level, title: l.title })),
    progress,
    quizAttempts: quizAttempts.map((a) => ({
      lessonId: a.lessonId,
      score: a.score,
      total: a.total,
      passed: a.passed,
    })),
    exercises: exercises.map((e) => ({ id: e.id, lessonId: e.lessonId })),
    exerciseAttempts: exerciseAttempts.map((a) => ({
      exerciseId: a.exerciseId,
      passed: a.passed,
    })),
    activityMs,
    now: new Date(),
  };

  const result = computeProgress(input);

  const level1 = result.levelProgress.find((l) => l.level === 1);
  const level1Done = !!level1 && level1.completed === level1.total && level1.total > 0;

  const badgeCtx: BadgeContext = {
    completedLessons: result.stats.completedLessons,
    solvedExercises: result.stats.solvedExercises,
    streak: result.streak,
    points: user.points,
    level1Done,
  };
  const earnedSlugs = evaluateBadges(badgeCtx);

  const existingBadges = await db.userBadge.findMany({
    where: { userId: user.id },
    select: { badge: { select: { slug: true } } },
  });
  const alreadySlugs = new Set(existingBadges.map((b) => b.badge.slug));

  for (const slug of earnedSlugs) {
    if (!alreadySlugs.has(slug)) {
      const badge = await db.badge.findUnique({ where: { slug } });
      if (badge) {
        await db.userBadge.create({ data: { userId: user.id, badgeId: badge.id } });
      }
    }
  }

  const badges = BADGE_DEFINITIONS.map((b) => ({
    slug: b.slug,
    title: b.title,
    description: b.description,
    icon: b.icon,
    earned: earnedSlugs.includes(b.slug),
  }));

  return NextResponse.json({
    points: user.points,
    level: user.level,
    streak: result.streak,
    levelProgress: result.levelProgress,
    mastery: result.mastery,
    weakPoints: result.weakPoints,
    weeklyActivity: result.weeklyActivity,
    stats: result.stats,
    badges,
  });
}
