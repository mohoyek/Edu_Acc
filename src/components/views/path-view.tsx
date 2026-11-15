"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Lock, PlayCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { computePathState, type LessonInfo } from "@/lib/path";
import { toast } from "@/hooks/use-toast";

interface LessonListItem {
  slug: string;
  level: 1 | 2;
  order: number;
  title: string;
  summary: string;
  status: "not_started" | "in_progress" | "completed";
}

const LEVEL_TITLES: Record<number, string> = {
  1: "سطح ۱ — مفاهیم پایه",
  2: "سطح ۲ — ثبت سند",
};

export function PathView() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lessons")
      .then((r) => r.json())
      .then((d) => setLessons(d.lessons ?? []))
      .catch(() => toast({ title: "بارگذاری درس‌ها ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const infos: LessonInfo[] = lessons.map((l) => ({
    slug: l.slug,
    level: l.level,
    order: l.order,
  }));
  const progress = Object.fromEntries(
    lessons.map((l) => [l.slug, l.status]),
  );
  const state = computePathState(infos, progress);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
          مسیر یادگیری
        </h1>
        <p className="mt-1 text-muted-foreground">
          {toPersianDigits(state.overallCompleted)} از{" "}
          {toPersianDigits(state.overallTotal)} درس کامل شده.
        </p>
      </div>

      {state.levels.map((lvl) => (
        <section key={lvl.level} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {LEVEL_TITLES[lvl.level]}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                lvl.unlocked
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {lvl.unlocked
                ? `${toPersianDigits(lvl.completedCount)}/${toPersianDigits(
                    lvl.total,
                  )} کامل`
                : "قفل تا تکمیل سطح ۱"}
            </span>
          </div>

          <div className="grid gap-3">
            {lvl.lessons.map((ls) => {
              const meta = lessons.find((x) => x.slug === ls.slug);
              const Icon = ls.locked
                ? Lock
                : ls.status === "completed"
                  ? CheckCircle2
                  : ls.status === "in_progress"
                    ? PlayCircle
                    : Circle;
              return (
                <Card
                  key={ls.slug}
                  className={`border-border transition-colors ${
                    ls.locked ? "opacity-60" : "hover:border-primary/40 cursor-pointer"
                  }`}
                  onClick={() => {
                    if (ls.locked) {
                      toast({
                        title: "این درس قفل است",
                        description: "ابتدا همه‌ی درس‌های سطح ۱ را کامل کن.",
                        variant: "destructive",
                      });
                      return;
                    }
                    navigate(`/lessons/${ls.slug}`);
                  }}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <Icon
                      className={`h-6 w-6 shrink-0 ${
                        ls.status === "completed"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-foreground">
                        {toPersianDigits(ls.order)}. {meta?.title ?? ls.slug}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {meta?.summary}
                      </p>
                    </div>
                    {!ls.locked && (
                      <Button
                        size="sm"
                        variant={ls.status === "completed" ? "outline" : "default"}
                        className="shrink-0"
                      >
                        {ls.status === "completed"
                          ? "مرور"
                          : ls.status === "in_progress"
                            ? "ادامه"
                            : "شروع"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
