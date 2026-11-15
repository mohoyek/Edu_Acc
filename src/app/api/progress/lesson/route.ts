import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  slug: z.string(),
  status: z.enum(["in_progress", "completed"]),
});

/** POST /api/progress/lesson — علامت‌گذاری وضعیت یک درس (مثلاً در شروع خواندن) */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const { slug, status } = parsed.data;
  const lesson = await db.lesson.findUnique({ where: { slug } });
  if (!lesson) {
    return NextResponse.json({ error: "درس یافت نشد" }, { status: 404 });
  }

  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
  });

  // اگر کامل‌شده است، به in_progress برگردانیم نکن
  if (existing?.status === "completed" && status === "in_progress") {
    return NextResponse.json({ ok: true, status: existing.status });
  }

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    update: { status },
    create: { userId: user.id, lessonId: lesson.id, status },
  });

  return NextResponse.json({ ok: true, status });
}
