// منطق خالص تصحیح کوییز — بدون وابستگی به React یا دیتابیس.
import type { QuizQuestion } from "@/data/lessons";

export interface QuizGradeResult {
  score: number;
  total: number;
  passed: boolean;
  results: {
    questionId: string;
    selectedIndex: number | null;
    correctIndex: number;
    correct: boolean;
    explanation: string;
  }[];
}

export interface GradeOptions {
  passRatio?: number; // حداقل نسبت درست برای قبولی (پیش‌فرض ۰٫۶)
}

/** پاسخ‌های کاربر: نگاشت questionId → ایندکس گزینه‌ی انتخاب‌شده (یا null اگر پاسخ نداده). */
export type AnswerMap = Record<string, number | null>;

/** یک کوییز را تصحیح می‌کند. */
export function gradeQuiz(
  questions: QuizQuestion[],
  answers: AnswerMap,
  options: GradeOptions = {},
): QuizGradeResult {
  const passRatio = options.passRatio ?? 0.6;
  const total = questions.length;

  const results = questions.map((q) => {
    const selectedIndex = answers[q.id] ?? null;
    const correct = selectedIndex === q.correctIndex;
    return {
      questionId: q.id,
      selectedIndex,
      correctIndex: q.correctIndex,
      correct,
      explanation: q.explanation,
    };
  });

  const score = results.filter((r) => r.correct).length;
  const passed = total > 0 ? score / total >= passRatio : false;

  return { score, total, passed, results };
}
