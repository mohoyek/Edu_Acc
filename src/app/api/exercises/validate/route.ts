import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { isProfileComplete } from "@/lib/profile";
import { validateEntry } from "@/lib/accounting/validate-entry";
import type { JournalLineInput } from "@/lib/accounting/types";
import { syncUserStreak } from "@/lib/progress-server";

const POINTS_PER_EXERCISE = 15;

const lineSchema = z.object({
  accountCode: z.string(),
  debit: z.number().int(),
  credit: z.number().int(),
});

const validateSchema = z.object({
  slug: z.string(),
  lines: z.array(lineSchema).min(1),
});

/** POST /api/exercises/validate — اعتبارسنجی سند، ثبت تلاش، و در صورت درست بودن:
 *  ثبت سند در دفتر شرکت مجازی + اعطای امتیاز (فقط اولین حل موفق). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  }

  // گیت پروفایل: کاربر عادی تا پروفایلش (نام، نام خانوادگی، شماره تماس) کامل نشود، نمی‌تواند تمرین حل کند
  if (user.role !== "ADMIN" && !isProfileComplete(user)) {
    return NextResponse.json(
      {
        error: "برای حل تمرین ابتدا پروفایل خود را تکمیل کنید (نام، نام خانوادگی و شماره تماس)",
        code: "PROFILE_INCOMPLETE",
      },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = validateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const { slug, lines } = parsed.data;

  const exercise = await db.exercise.findUnique({ where: { slug } });
  if (!exercise) {
    return NextResponse.json({ error: "تمرین یافت نشد" }, { status: 404 });
  }

  const accounts = await db.account.findMany({
    where: { isDefault: true },
    select: { code: true, name: true, type: true, normalBalance: true },
  });

  const allowedAnswers = exercise.allowedAnswers as unknown as JournalLineInput[][];
  const result = validateEntry(lines, allowedAnswers, accounts);

  const company = await db.company.findUnique({ where: { userId: user.id } });
  if (!company) {
    return NextResponse.json({ error: "شرکت مجازی یافت نشد" }, { status: 500 });
  }

  const existingEntry = await db.journalEntry.findFirst({
    where: { companyId: company.id, exerciseId: exercise.id },
  });
  const wasSolved = !!existingEntry;

  await db.exerciseAttempt.create({
    data: {
      userId: user.id,
      exerciseId: exercise.id,
      passed: result.valid,
      feedback: result.feedback.join("\n"),
      linesJson: lines as object,
    },
  });

  let pointsAwarded = 0;
  let posted = false;

  if (result.valid && !wasSolved) {
    const entry = await db.journalEntry.create({
      data: {
        companyId: company.id,
        exerciseId: exercise.id,
        date: new Date(),
        description: exercise.title,
        source: "exercise",
      },
    });
    await db.journalLine.createMany({
      data: lines
        .filter((l) => l.accountCode && (l.debit > 0 || l.credit > 0))
        .map((l) => ({
          entryId: entry.id,
          accountCode: l.accountCode,
          debit: l.debit,
          credit: l.credit,
        })),
    });
    posted = true;

    pointsAwarded = POINTS_PER_EXERCISE;
    await db.user.update({
      where: { id: user.id },
      data: { points: { increment: POINTS_PER_EXERCISE } },
    });
    await syncUserStreak(user.id);
  }

  return NextResponse.json({
    result,
    pointsAwarded,
    posted,
    alreadySolved: wasSolved,
  });
}
