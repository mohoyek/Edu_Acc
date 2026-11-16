import { describe, it, expect } from "vitest";
import { evaluateBadges, BADGE_DEFINITIONS, type BadgeContext } from "@/lib/badges";

const ctx = (over: Partial<BadgeContext> = {}): BadgeContext => ({
  completedLessons: 0,
  solvedExercises: 0,
  streak: 0,
  points: 0,
  level1Done: false,
  ...over,
});

describe("evaluateBadges", () => {
  it("شروع: هیچ نشانی", () => {
    expect(evaluateBadges(ctx())).toEqual([]);
  });

  it("اولین درس → first-lesson", () => {
    expect(evaluateBadges(ctx({ completedLessons: 1 }))).toContain("first-lesson");
  });

  it("اولین تمرین → first-exercise", () => {
    expect(evaluateBadges(ctx({ solvedExercises: 1 }))).toContain("first-exercise");
  });

  it("سطح ۱ کامل → level1-complete", () => {
    expect(evaluateBadges(ctx({ level1Done: true }))).toContain("level1-complete");
  });

  it("۵ تمرین → five-exercises", () => {
    expect(evaluateBadges(ctx({ solvedExercises: 5 }))).toContain("five-exercises");
  });

  it("streak ۳ → streak-3", () => {
    expect(evaluateBadges(ctx({ streak: 3 }))).toContain("streak-3");
  });

  it("۵۰ امتیاز → points-50", () => {
    expect(evaluateBadges(ctx({ points: 50 }))).toContain("points-50");
  });

  it("همه‌چیز → همه‌ی نشان‌ها", () => {
    const earned = evaluateBadges(
      ctx({ completedLessons: 7, solvedExercises: 5, streak: 5, points: 100, level1Done: true }),
    );
    expect(earned.length).toBe(BADGE_DEFINITIONS.length);
  });
});
