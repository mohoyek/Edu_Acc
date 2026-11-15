import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/** GET /api/lessons → فهرست درس‌ها با پیشرفت کاربر
 *  GET /api/lessons?slug=x → جزئیات یک درس + کوییز + پیشرفت + درس بعدی */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const lesson = await db.lesson.findUnique({
      where: { slug },
    });
    if (!lesson) {
      return NextResponse.json({ error: "درس یافت نشد" }, { status: 404 });
    }

    const user = await getCurrentUser();
    let status = "not_started";
    let quizScore: number | null = null;
    if (user) {
      const prog = await db.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      });
      if (prog) {
        status = prog.status;
        quizScore = prog.quizScore;
      }
    }

    // اصطلاحات مرتبط
    const termSlugs = (lesson.glossarySlugs as string[]) ?? [];
    const terms =
      termSlugs.length > 0
        ? await db.glossaryTerm.findMany({
            where: { slug: { in: termSlugs } },
            select: { slug: true, term: true, definition: true, example: true },
          })
        : [];

    // درس بعدی (بر اساس level و order)
    const next = await db.lesson.findFirst({
      where: {
        OR: [
          { level: lesson.level, order: { gt: lesson.order } },
          { level: { gt: lesson.level } },
        ],
      },
      orderBy: [{ level: "asc" }, { order: "asc" }],
      select: { slug: true, title: true, level: true },
    });

    return NextResponse.json({
      lesson: {
        slug: lesson.slug,
        level: lesson.level,
        order: lesson.order,
        title: lesson.title,
        summary: lesson.summary,
        contentSlug: lesson.contentSlug,
        questions: lesson.questionsJson,
        glossarySlugs: termSlugs,
        status,
        quizScore,
      },
      terms,
      nextLesson: next
        ? { slug: next.slug, title: next.title, level: next.level }
        : null,
    });
  }

  // فهرست
  const lessons = await db.lesson.findMany({
    orderBy: [{ level: "asc" }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      level: true,
      order: true,
      title: true,
      summary: true,
    },
  });

  const user = await getCurrentUser();
  let progressMap: Record<string, string> = {};
  if (user) {
    const progs = await db.lessonProgress.findMany({
      where: { userId: user.id },
      select: { lessonId: true, status: true },
    });
    const byId = new Map(progs.map((p) => [p.lessonId, p.status]));
    progressMap = Object.fromEntries(
      lessons.map((l) => [l.slug, byId.get(l.id) ?? "not_started"]),
    );
  }

  return NextResponse.json({
    lessons: lessons.map(({ id, ...rest }) => ({
      ...rest,
      status: progressMap[rest.slug] ?? "not_started",
    })),
  });
}
