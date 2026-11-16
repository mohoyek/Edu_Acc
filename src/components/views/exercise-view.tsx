"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, Lightbulb, Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router";
import { toPersianDigits } from "@/lib/format/persian-digits";
import {
  JournalBuilder,
  builderLinesToRials,
  type BuilderLine,
} from "@/components/exercise/journal-builder";
import { FeedbackPanel } from "@/components/exercise/feedback-panel";
import type { AccountInfo, JournalLineInput, ValidationResult } from "@/lib/accounting/types";
import { toast } from "@/hooks/use-toast";

interface ExerciseDetail {
  exercise: {
    slug: string;
    title: string;
    storyText: string;
    hint: string | null;
    solution: JournalLineInput[];
    lessonSlug: string | null;
  };
  solved: boolean;
  nextExercise: { slug: string; title: string } | null;
}

export function ExerciseView({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [lines, setLines] = useState<BuilderLine[]>([
    { accountCode: "", debit: "", credit: "" },
    { accountCode: "", debit: "", credit: "" },
  ]);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [checking, setChecking] = useState(false);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/exercises?slug=${encodeURIComponent(slug)}`).then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ])
      .then(([d, a]) => {
        if (!active) return;
        setDetail(d);
        setAccounts(a.accounts ?? []);
        setSolved(d.solved);
        setLoading(false);
      })
      .catch(() => {
        toast({ title: "بارگذاری ناموفق", variant: "destructive" });
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  async function handleCheck() {
    if (!detail) return;
    setChecking(true);
    const rialsLines = builderLinesToRials(lines);
    try {
      const res = await fetch("/api/exercises/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, lines: rialsLines }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data?.error ?? "خطا", variant: "destructive" });
        return;
      }
      const vr = data.result as ValidationResult;
      setResult(vr);
      if (vr.valid) {
        setSolved(true);
        if (data.posted) {
          toast({
            title: "آفرین! سند درست است",
            description: data.pointsAwarded
              ? `${toPersianDigits(data.pointsAwarded)} امتیاز گرفتی و سند در دفتر ثبت شد.`
              : "سند در دفتر ثبت شد.",
          });
        } else {
          toast({ title: "سند درست است", description: "این تمرین را قبلاً حل کرده بودی." });
        }
      }
    } catch {
      toast({ title: "خطای ارتباط با سرور", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!detail) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          تمرین یافت نشد.
          <div className="mt-3">
            <Button variant="outline" onClick={() => navigate("/exercises")}>
              بازگشت به فهرست
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { exercise, nextExercise } = detail;
  const locked = solved && result?.valid;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button className="hover:text-primary" onClick={() => navigate("/exercises")}>
          تمرین‌ها
        </button>
        <span>/</span>
        <span>{exercise.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
          {exercise.title}
        </h1>
        {solved && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
            <CheckCircle2 className="h-3 w-3" />
            حل‌شده
          </span>
        )}
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          <p className="text-foreground">{exercise.storyText}</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="font-bold text-foreground">سند را بساز:</h2>
        <JournalBuilder
          accounts={accounts}
          lines={lines}
          onChange={setLines}
          disabled={locked}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleCheck} disabled={checking || locked}>
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          بررسی سند
        </Button>
        <Button variant="outline" onClick={() => setShowHint((v) => !v)}>
          <Lightbulb className="h-4 w-4" />
          {showHint ? "پنهان کردن راهنمایی" : "راهنمایی"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowSolution((v) => !v)}
          disabled={locked && !showSolution}
        >
          <Eye className="h-4 w-4" />
          {showSolution ? "پنهان کردن پاسخ" : "نمایش پاسخ"}
        </Button>
      </div>

      <FeedbackPanel
        result={result}
        hint={exercise.hint ?? undefined}
        solution={exercise.solution}
        showHint={showHint}
        showSolution={showSolution}
      />

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={() => navigate("/exercises")}>
          <ArrowLeft className="h-4 w-4" />
          بازگشت به فهرست
        </Button>
        {nextExercise && (
          <Button onClick={() => navigate(`/exercise/${nextExercise.slug}`)}>
            تمرین بعدی: {nextExercise.title}
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
