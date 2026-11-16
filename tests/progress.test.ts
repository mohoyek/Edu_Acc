import { describe, it, expect } from "vitest";
import {
  computeProgress,
  computeCurrentStreak,
  computeWeeklyActivity,
  type ProgressInput,
} from "@/lib/progress";

const NOW = new Date("2024-03-24T12:00:00Z");

const LESSONS = [
  { id: "l1", slug: "asset", level: 1, title: "دارایی و بدهی" },
  { id: "l2", slug: "equity", level: 1, title: "سرمایه" },
  { id: "l3", slug: "debit", level: 2, title: "بدهکار و بستانکار" },
];

const BASE: ProgressInput = {
  lessons: LESSONS,
  progress: { l1: "completed", l2: "in_progress" },
  quizAttempts: [
    { lessonId: "l1", score: 4, total: 4, passed: true },
    { lessonId: "l1", score: 2, total: 4, passed: false },
  ],
  exercises: [
    { id: "e1", lessonId: "l1" },
    { id: "e2", lessonId: "l1" },
    { id: "e3", lessonId: null },
  ],
  exerciseAttempts: [
    { exerciseId: "e1", passed: true },
    { exerciseId: "e2", passed: false },
  ],
  activityMs: [],
  now: NOW,
};

describe("computeProgress — سطح", () => {
  it("درصد تکمیل هر سطح", () => {
    const r = computeProgress(BASE);
    const l1 = r.levelProgress.find((x) => x.level === 1)!;
    expect(l1.completed).toBe(1);
    expect(l1.total).toBe(2);
    expect(l1.percent).toBe(50);
    const l2 = r.levelProgress.find((x) => x.level === 2)!;
    expect(l2.completed).toBe(0);
    expect(l2.percent).toBe(0);
  });
});

describe("computeProgress — تسلط", () => {
  it("تسلط = میانگین کوییز و تمرین", () => {
    const r = computeProgress(BASE);
    const m1 = r.mastery.find((m) => m.lessonId === "l1")!;
    expect(m1.percent).toBe(75);
    expect(m1.quizScore).toBe(100);
  });

  it("تسلط درس بدون تمرین = فقط کوییز", () => {
    const r = computeProgress({ ...BASE, exercises: [], exerciseAttempts: [] });
    const m2 = r.mastery.find((m) => m.lessonId === "l2")!;
    expect(m2.percent).toBe(0);
  });
});

describe("computeProgress — نقاط ضعف", () => {
  it("درس‌های با تسلط < ۶۰ شناسایی می‌شوند", () => {
    const r = computeProgress(BASE);
    const slugs = r.weakPoints.map((w) => w.slug);
    expect(slugs).toContain("equity");
    expect(slugs).toContain("debit");
    expect(slugs).not.toContain("asset");
  });

  it("حداکثر ۴ نقطه‌ی ضعف", () => {
    const r = computeProgress(BASE);
    expect(r.weakPoints.length).toBeLessThanOrEqual(4);
  });
});

describe("computeProgress — آمار", () => {
  it("شمارش درس‌ها و تمرین‌ها", () => {
    const r = computeProgress(BASE);
    expect(r.stats.totalLessons).toBe(3);
    expect(r.stats.completedLessons).toBe(1);
    expect(r.stats.totalExercises).toBe(3);
    expect(r.stats.solvedExercises).toBe(1);
  });
});

describe("computeCurrentStreak", () => {
  const DAY = 86_400_000;
  it("صفر اگر فعالیتی نیست", () => {
    expect(computeCurrentStreak([], NOW)).toBe(0);
  });

  it("اگر امروز فعال بوده → شامل امروز", () => {
    const today = NOW.getTime();
    expect(computeCurrentStreak([today], NOW)).toBe(1);
    expect(computeCurrentStreak([today, today - DAY], NOW)).toBe(2);
    expect(computeCurrentStreak([today, today - DAY, today - 2 * DAY], NOW)).toBe(3);
  });

  it("اگر امروز فعال نبوده ولی دیروز بوده → streak زنده", () => {
    const yesterday = NOW.getTime() - DAY;
    expect(computeCurrentStreak([yesterday], NOW)).toBe(1);
    expect(computeCurrentStreak([yesterday, yesterday - DAY], NOW)).toBe(2);
  });

  it("اگر نه امروز نه دیروز → صفر", () => {
    const twoDaysAgo = NOW.getTime() - 2 * DAY;
    expect(computeCurrentStreak([twoDaysAgo], NOW)).toBe(0);
  });
});

describe("computeWeeklyActivity", () => {
  it("۷ سطل", () => {
    const w = computeWeeklyActivity([], NOW);
    expect(w).toHaveLength(7);
  });

  it("شمارش فعالیت در سطل درست", () => {
    const today = NOW.getTime();
    const yesterday = NOW.getTime() - 86_400_000;
    const w = computeWeeklyActivity([today, today, yesterday], NOW);
    expect(w[6].count).toBe(2);
    expect(w[5].count).toBe(1);
    expect(w[0].count).toBe(0);
  });
});
