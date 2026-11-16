import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const POINTS_PER_LESSON = 10;

const submitSchema = z.object({
  lessonSlug: z.string(),
  score: z.number().int().min(0),
  total: z.number().int().min(0),
  passed: z.boolean(),
  answers: z.record(z.string(), z.number().nullable()),
});

/** POST /api/quiz/submit — ثبت تلاش کوییز، به‌روزرسانی پیشرفت و اعطای امتیاز */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const { lessonSlug, score, total, passed, answers } = parsed.data;

  const lesson = await db.lesson.findUnique({ where: { slug: lessonSlug } });
  if (!lesson) {
    return NextResponse.json({ error: "درس یافت نشد" }, { status: 404 });
  }

  // پیشرفت فعلی
  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
  });
  const wasCompleted = existing?.status === "completed";

  // ثبت تلاش کوییز
  await db.quizAttempt.create({
    data: {
      userId: user.id,
      lessonId: lesson.id,
      score,
      total,
      passed,
      answersJson: answers as object,
    },
  });

  let pointsAwarded = 0;

  if (passed) {
    // به‌روزرسانی پیشرفت: اگر قبلاً کامل نشده، کامل کن و امتیاز بده
    const bestScore =
      existing?.quizScore !== null && existing?.quizScore !== undefined
        ? Math.max(existing.quizScore, score)
        : score;

    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      update: {
        status: "completed",
        quizScore: bestScore,
        completedAt: existing?.completedAt ?? new Date(),
      },
      create: {
        userId: user.id,
        lessonId: lesson.id,
        status: "completed",
        quizScore: score,
        completedAt: new Date(),
      },
    });

    if (!wasCompleted) {
      pointsAwarded = POINTS_PER_LESSON;
      await db.user.update({
        where: { id: user.id },
        data: { points: { increment: POINTS_PER_LESSON } },
      });
    }
    // همگام‌سازی رکورد روزانه (streak) پس از هر کوییز
    const { syncUserStreak } = await import("@/lib/progress-server");
    await syncUserStreak(user.id);
  } else if (!existing) {
    // حداقل به‌عنوان in_progress علامت بزن
    await db.lessonProgress.create({
      data: { userId: user.id, lessonId: lesson.id, status: "in_progress" },
    });
  }

  return NextResponse.json({ ok: true, passed, pointsAwarded });
}
