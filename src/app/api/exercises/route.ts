import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** GET /api/exercises → فهرست تمرین‌ها با وضعیت حل‌شده
 *  GET /api/exercises?slug=x → جزئیات یک تمرین (بدون allowedAnswers) + بعدی */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const exercise = await db.exercise.findUnique({ where: { slug } });
    if (!exercise) {
      return NextResponse.json({ error: "تمرین یافت نشد" }, { status: 404 });
    }
    const user = await getCurrentUser();
    let solved = false;
    if (user) {
      const company = await db.company.findUnique({ where: { userId: user.id } });
      if (company) {
        const entry = await db.journalEntry.findFirst({
          where: { companyId: company.id, exerciseId: exercise.id },
        });
        solved = !!entry;
      }
    }
    const next = await db.exercise.findFirst({
      where: { createdAt: { gt: exercise.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true },
    });
    let lessonSlug: string | null = null;
    if (exercise.lessonId) {
      const lesson = await db.lesson.findUnique({ where: { id: exercise.lessonId } });
      lessonSlug = lesson?.slug ?? null;
    }
    return NextResponse.json({
      exercise: {
        slug: exercise.slug,
        title: exercise.title,
        storyText: exercise.storyText,
        hint: exercise.hint,
        solution: exercise.solution,
        lessonSlug,
      },
      solved,
      nextExercise: next,
    });
  }

  const exercises = await db.exercise.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, title: true, storyText: true },
  });

  const user = await getCurrentUser();
  let solvedSlugs = new Set<string>();
  if (user) {
    const company = await db.company.findUnique({ where: { userId: user.id } });
    if (company) {
      const entries = await db.journalEntry.findMany({
        where: { companyId: company.id, exerciseId: { not: null } },
        select: { exerciseId: true },
      });
      const idToSlug = new Map(exercises.map((e) => [e.id, e.slug]));
      solvedSlugs = new Set(
        entries.map((e) => idToSlug.get(e.exerciseId!)).filter(Boolean) as string[],
      );
    }
  }

  return NextResponse.json({
    exercises: exercises.map(({ id, storyText, ...rest }) => ({
      ...rest,
      storyPreview: storyText.slice(0, 90),
      solved: solvedSlugs.has(rest.slug),
    })),
  });
}
