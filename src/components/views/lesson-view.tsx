"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { LessonContent } from "@/components/lesson/lesson-content";
import { Quiz } from "@/components/lesson/quiz";
import type { QuizQuestion } from "@/data/lessons";
import { toast } from "@/hooks/use-toast";

interface LessonDetail {
  lesson: {
    slug: string;
    level: number;
    order: number;
    title: string;
    summary: string;
    contentSlug: string;
    questions: QuizQuestion[];
    glossarySlugs: string[];
    status: "not_started" | "in_progress" | "completed";
    quizScore: number | null;
  };
  terms: { slug: string; term: string; definition: string }[];
  nextLesson: { slug: string; title: string; level: number } | null;
}

export function LessonView({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [data, setData] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/lessons?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d: LessonDetail) => {
        if (!active) return;
        setData(d);
        setPassed(d.lesson.status === "completed");
        setLoading(false);
        // علامت‌گذاری به‌عنوان در حال مطالعه
        if (d.lesson.status === "not_started") {
          fetch("/api/progress/lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, status: "in_progress" }),
          }).catch(() => {});
        }
      })
      .catch(() => {
        toast({ title: "بارگذاری درس ناموفق", variant: "destructive" });
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-dashed border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          درس یافت نشد.
          <div className="mt-3">
            <Button variant="outline" onClick={() => navigate("/path")}>
              بازگشت به مسیر
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { lesson, terms, nextLesson } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button className="hover:text-primary" onClick={() => navigate("/path")}>
          مسیر یادگیری
        </button>
        <span>/</span>
        <span>سطح {toPersianDigits(lesson.level)}</span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
          {lesson.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          درس {toPersianDigits(lesson.order)} · سطح {toPersianDigits(lesson.level)}
        </p>
      </div>

      <LessonContent contentSlug={lesson.contentSlug} />

      {/* خلاصه */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="space-y-2 p-5">
          <h3 className="flex items-center gap-2 font-bold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            خلاصه‌ی درس
          </h3>
          <p className="whitespace-pre-line text-foreground">{lesson.summary}</p>
        </CardContent>
      </Card>

      {/* اصطلاحات مرتبط */}
      {terms.length > 0 && (
        <Card className="border-border">
          <CardContent className="space-y-2 p-5">
            <h3 className="font-bold text-foreground">اصطلاحات این درس</h3>
            <ul className="space-y-2">
              {terms.map((t) => (
                <li key={t.slug}>
                  <span className="font-semibold text-primary">{t.term}:</span>{" "}
                  <span className="text-foreground">{t.definition}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* کوییز */}
      <Quiz
        lessonSlug={lesson.slug}
        questions={lesson.questions}
        onComplete={(p) => setPassed(p)}
      />

      {/* درس بعدی */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => navigate("/path")}>
          <ArrowLeft className="h-4 w-4" />
          بازگشت به مسیر
        </Button>
        {nextLesson && (
          <Button onClick={() => navigate(`/lessons/${nextLesson.slug}`)}>
            درس بعدی: {nextLesson.title}
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {passed && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-3 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">این درس را کامل کردی!</span>
        </div>
      )}
    </div>
  );
}
