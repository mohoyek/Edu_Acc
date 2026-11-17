import { describe, it, expect } from "vitest";
import { summarizeProgress } from "@/lib/admin";
import { computeProgress, type ProgressInput } from "@/lib/progress";

function makeInput(overrides: Partial<ProgressInput> = {}): ProgressInput {
  return {
    lessons: [
      { id: "l1", slug: "a", level: 1, title: "درس الف" },
      { id: "l2", slug: "b", level: 1, title: "درس ب" },
      { id: "l3", slug: "c", level: 2, title: "درس ج" },
    ],
    progress: {},
    quizAttempts: [],
    exercises: [],
    exerciseAttempts: [],
    activityMs: [],
    now: new Date("2026-01-01T10:00:00Z"),
    ...overrides,
  };
}

describe("summarizeProgress", () => {
  it("کاربر بدون فعالیتی → صفرها و quizAvg null", () => {
    const s = summarizeProgress(computeProgress(makeInput()));
    expect(s.masteryPercent).toBe(0);
    expect(s.quizAvgPercent).toBeNull();
    expect(s.completedLessons).toBe(0);
    expect(s.totalLessons).toBe(3);
    expect(s.solvedExercises).toBe(0);
    expect(s.totalExercises).toBe(0);
  });

  it("میانگین تسلط را از درس‌ها حساب می‌کند", () => {
    const input = makeInput({
      quizAttempts: [
        { lessonId: "l1", score: 10, total: 10, passed: true }, // ۱۰۰٪
        { lessonId: "l2", score: 5, total: 10, passed: false }, // ۵۰٪
      ],
    });
    const s = summarizeProgress(computeProgress(input));
    // تسلط: (۱۰۰ + ۵۰ + ۰) / ۳ ≈ ۵۰
    expect(s.masteryPercent).toBe(50);
    // میانگین کوییز درس‌هایی که کوییز داده‌اند: (۱۰۰ + ۵۰) / ۲ = ۷۵
    expect(s.quizAvgPercent).toBe(75);
    expect(s.completedLessons).toBe(0);
  });

  it("درس‌های کامل‌شده و تمرین‌های حل‌شده را می‌شمارد", () => {
    const input = makeInput({
      progress: { l1: "completed" },
      exercises: [
        { id: "e1", lessonId: "l1" },
        { id: "e2", lessonId: "l2" },
        { id: "e3", lessonId: null },
      ],
      exerciseAttempts: [
        { exerciseId: "e1", passed: true },
        { exerciseId: "e2", passed: false },
        { exerciseId: "e3", passed: true },
      ],
    });
    const s = summarizeProgress(computeProgress(input));
    expect(s.completedLessons).toBe(1);
    expect(s.solvedExercises).toBe(2); // e1 و e3 (حتی بدون درس)
    expect(s.totalExercises).toBe(3);
  });
});
