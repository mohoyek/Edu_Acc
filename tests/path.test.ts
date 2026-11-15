import { describe, it, expect } from "vitest";
import { computePathState } from "@/lib/path";
import type { LessonInfo } from "@/lib/path";

const LESSONS: LessonInfo[] = [
  { slug: "a", level: 1, order: 1 },
  { slug: "b", level: 1, order: 2 },
  { slug: "c", level: 2, order: 3 },
];

describe("computePathState — قفل سطح", () => {
  it("شروع: سطح ۱ باز و سطح ۲ قفل", () => {
    const s = computePathState(LESSONS, {});
    expect(s.levels).toHaveLength(2);
    const l1 = s.levels.find((l) => l.level === 1)!;
    const l2 = s.levels.find((l) => l.level === 2)!;
    expect(l1.unlocked).toBe(true);
    expect(l2.unlocked).toBe(false);
    expect(s.lessons["c"].locked).toBe(true);
    expect(s.lessons["a"].locked).toBe(false);
  });

  it("تکمیل فقط یک درس سطح ۱ → سطح ۲ هنوز قفل", () => {
    const s = computePathState(LESSONS, { a: "completed" });
    const l2 = s.levels.find((l) => l.level === 2)!;
    expect(l2.unlocked).toBe(false);
    expect(l1State(s).completedCount).toBe(1);
  });

  it("تکمیل همه‌ی درس‌های سطح ۱ → سطح ۲ باز", () => {
    const s = computePathState(LESSONS, { a: "completed", b: "completed" });
    const l2 = s.levels.find((l) => l.level === 2)!;
    expect(l2.unlocked).toBe(true);
    expect(s.lessons["c"].locked).toBe(false);
  });

  it("in_progress به‌عنوان کامل‌شده حساب نمی‌شود", () => {
    const s = computePathState(LESSONS, {
      a: "completed",
      b: "in_progress",
    });
    expect(s.levels.find((l) => l.level === 2)!.unlocked).toBe(false);
  });

  it("آمار کلی", () => {
    const s = computePathState(LESSONS, { a: "completed", b: "completed", c: "in_progress" });
    expect(s.overallCompleted).toBe(2);
    expect(s.overallTotal).toBe(3);
  });

  it("درس مرتب‌سازی بر اساس level و order", () => {
    const shuffled: LessonInfo[] = [
      { slug: "c", level: 2, order: 3 },
      { slug: "b", level: 1, order: 2 },
      { slug: "a", level: 1, order: 1 },
    ];
    const s = computePathState(shuffled, {});
    const first = s.levels[0].lessons[0];
    expect(first.slug).toBe("a");
  });
});

function l1State(s: ReturnType<typeof computePathState>) {
  return s.levels.find((l) => l.level === 1)!;
}
