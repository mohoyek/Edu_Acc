"use client";

import { useState } from "react";
import { Check, X, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { gradeQuiz, type AnswerMap, type QuizGradeResult } from "@/lib/quiz";
import type { QuizQuestion } from "@/data/lessons";
import { toast } from "@/hooks/use-toast";

export function Quiz({
  lessonSlug,
  questions,
  onComplete,
}: {
  lessonSlug: string;
  questions: QuizQuestion[];
  onComplete?: (passed: boolean) => void;
}) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [result, setResult] = useState<QuizGradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitted = result !== null;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  function selectOption(qid: string, idx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
  }

  async function handleSubmit() {
    const r = gradeQuiz(questions, answers);
    setResult(r);
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug,
          score: r.score,
          total: r.total,
          passed: r.passed,
          answers,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (r.passed) {
        toast({
          title: "آفرین! کوییز قبول شدی",
          description: data?.pointsAwarded
            ? `${toPersianDigits(data.pointsAwarded)} امتیاز گرفتی.`
            : undefined,
        });
      } else {
        toast({
          title: "ای بابا!",
          description: `نمره: ${toPersianDigits(r.score)} از ${toPersianDigits(
            r.total,
          )}. دوباره تلاش کن.`,
          variant: "destructive",
        });
      }
      onComplete?.(r.passed);
    } catch {
      toast({ title: "ثبت نتیجه ناموفق بود", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <Card className="border-border">
      <CardContent className="space-y-5 p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">کوییز درس</h3>
          {submitted && result && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold",
                result.passed
                  ? "bg-primary/15 text-primary"
                  : "bg-destructive/15 text-destructive",
              )}
            >
              نمره: {toPersianDigits(result.score)} از{" "}
              {toPersianDigits(result.total)}
            </span>
          )}
        </div>

        {questions.map((q, qi) => {
          const sel = answers[q.id] ?? null;
          const r = result?.results.find((x) => x.questionId === q.id);
          const isCorrect = r?.correct;
          return (
            <div key={q.id} className="space-y-2">
              <p className="font-semibold text-foreground">
                {toPersianDigits(qi + 1)}. {q.prompt}
              </p>
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  const selected = sel === oi;
                  const correct = oi === q.correctIndex;
                  let style = "border-border hover:border-primary/40 bg-background";
                  if (submitted) {
                    if (correct)
                      style = "border-primary bg-primary/10 text-primary";
                    else if (selected && !correct)
                      style = "border-destructive bg-destructive/10 text-destructive";
                    else style = "border-border opacity-70";
                  } else if (selected) {
                    style = "border-primary bg-primary/10 text-primary";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => selectOption(q.id, oi)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-4 py-2.5 text-right transition-colors",
                        style,
                      )}
                    >
                      <span>{opt}</span>
                      {submitted && correct && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      {submitted && selected && !correct && (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p
                  className={cn(
                    "rounded-md px-3 py-2 text-sm",
                    isCorrect
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {isCorrect ? "درست! " : "غلط. "}
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-3">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              ثبت پاسخ‌ها
            </Button>
          ) : (
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4" />
              تلاش دوباره
            </Button>
          )}
          {!allAnswered && !submitted && (
            <span className="text-sm text-muted-foreground">
              به همه‌ی سؤال‌ها پاسخ بده.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
