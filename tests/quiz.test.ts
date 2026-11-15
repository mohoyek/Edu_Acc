import { describe, it, expect } from "vitest";
import { gradeQuiz } from "@/lib/quiz";
import type { QuizQuestion } from "@/data/lessons";

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "۱+۱؟",
    options: ["۱", "۲", "۳", "۴"],
    correctIndex: 1,
    explanation: "۱+۱=۲.",
  },
  {
    id: "q2",
    prompt: "۲+۲؟",
    options: ["۲", "۳", "۴", "۵"],
    correctIndex: 2,
    explanation: "۲+۲=۴.",
  },
  {
    id: "q3",
    prompt: "۳+۳؟",
    options: ["۵", "۶", "۷", "۸"],
    correctIndex: 1,
    explanation: "۳+۳=۶.",
  },
];

describe("gradeQuiz", () => {
  it("همه درست → نمره کامل و قبولی", () => {
    const r = gradeQuiz(QUESTIONS, { q1: 1, q2: 2, q3: 1 });
    expect(r.score).toBe(3);
    expect(r.total).toBe(3);
    expect(r.passed).toBe(true);
    expect(r.results).toHaveLength(3);
  });

  it("همه غلط → رد", () => {
    const r = gradeQuiz(QUESTIONS, { q1: 0, q2: 0, q3: 0 });
    expect(r.score).toBe(0);
    expect(r.passed).toBe(false);
  });

  it("دو از سه درست (۶۶٪) → قبولی با حد پیش‌فرض ۶۰٪", () => {
    const r = gradeQuiz(QUESTIONS, { q1: 1, q2: 2, q3: 0 });
    expect(r.score).toBe(2);
    expect(r.passed).toBe(true);
  });

  it("یک از سه درست (۳۳٪) → رد", () => {
    const r = gradeQuiz(QUESTIONS, { q1: 1, q2: 0, q3: 0 });
    expect(r.score).toBe(1);
    expect(r.passed).toBe(false);
  });

  it("پاسخ نداده (null) → غلط محسوب می‌شود", () => {
    const r = gradeQuiz(QUESTIONS, { q1: 1, q2: null, q3: null });
    expect(r.score).toBe(1);
    expect(r.passed).toBe(false);
  });

  it("توضیح برای هر سؤال برمی‌گردد", () => {
    const r = gradeQuiz(QUESTIONS, { q1: 1, q2: 2, q3: 1 });
    expect(r.results[0].explanation).toBe("۱+۱=۲.");
    expect(r.results[1].correct).toBe(true);
    expect(r.results[0].correctIndex).toBe(1);
  });

  it("حد قبولی قابل تنظیم است", () => {
    // با حد ۱۰۰٪، دو از سه رد می‌شود
    const r = gradeQuiz(QUESTIONS, { q1: 1, q2: 2, q3: 0 }, { passRatio: 1 });
    expect(r.score).toBe(2);
    expect(r.passed).toBe(false);
  });

  it("کوییز خالی → رد", () => {
    const r = gradeQuiz([], {});
    expect(r.total).toBe(0);
    expect(r.passed).toBe(false);
  });
});
