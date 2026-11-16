"use client";

import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  ClipboardList,
  Flame,
  GraduationCap,
  Lightbulb,
  Loader2,
  Medal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "@/lib/router";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart";
import { toast } from "@/hooks/use-toast";

interface ProgressData {
  points: number;
  level: number;
  streak: number;
  levelProgress: { level: number; completed: number; total: number; percent: number }[];
  mastery: { lessonId: string; slug: string; title: string; level: number; percent: number }[];
  weakPoints: { slug: string; title: string; reason: string }[];
  weeklyActivity: { dateMs: number; count: number }[];
  stats: { totalLessons: number; completedLessons: number; totalExercises: number; solvedExercises: number };
  badges: { slug: string; title: string; description: string; icon: string; earned: boolean }[];
}

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Award,
  Flame,
  Medal,
};

export function DashboardView() {
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast({ title: "بارگذاری پیشرفت ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
            داشبورد پیشرفت
          </h1>
          <p className="mt-1 text-muted-foreground">
            سطح {toPersianDigits(data.level)} · {toPersianDigits(data.points)} امتیاز ·{" "}
            {toPersianDigits(data.streak)} روز رکورد
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/path")}>
          <BookOpen className="h-4 w-4" />
          ادامه‌ی یادگیری
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Medal} label="امتیاز" value={data.points} />
        <StatCard icon={Flame} label="رکورد روزانه" value={data.streak} suffix="روز" />
        <StatCard icon={BookOpen} label="درس‌های کامل" value={data.stats.completedLessons} suffix={`/${toPersianDigits(data.stats.totalLessons)}`} />
        <StatCard icon={ClipboardList} label="تمرین‌های حل‌شده" value={data.stats.solvedExercises} suffix={`/${toPersianDigits(data.stats.totalExercises)}`} />
      </div>

      <Card className="border-border">
        <CardContent className="space-y-4 p-5">
          <h2 className="font-bold text-foreground">پیشرفت سطوح</h2>
          {data.levelProgress.map((lv) => (
            <div key={lv.level}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">سطح {toPersianDigits(lv.level)}</span>
                <span className="text-muted-foreground">
                  {toPersianDigits(lv.completed)} از {toPersianDigits(lv.total)} ({toPersianDigits(lv.percent)}٪)
                </span>
              </div>
              <Progress value={lv.percent} className="h-2.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border">
          <CardContent className="space-y-3 p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              تسلط هر مبحث
            </h2>
            <div className="space-y-3">
              {data.mastery.map((m) => (
                <div key={m.lessonId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-foreground">{m.title}</span>
                    <span className="text-muted-foreground">{toPersianDigits(m.percent)}٪</span>
                  </div>
                  <Progress value={m.percent} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="space-y-3 p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <Lightbulb className="h-5 w-5 text-primary" />
              نقاط ضعف و پیشنهاد مرور
            </h2>
            {data.weakPoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">عالی! نقطه‌ی ضعف مشخصی نیست. به تلاشت ادامه بده.</p>
            ) : (
              <div className="space-y-2">
                {data.weakPoints.map((w) => (
                  <button
                    key={w.slug}
                    onClick={() => navigate(`/lessons/${w.slug}`)}
                    className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-right hover:border-primary/40"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{w.title}</p>
                      <p className="text-xs text-muted-foreground">{w.reason}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">مرور ←</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardContent className="space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-bold text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            فعالیت هفتگی
          </h2>
          <WeeklyActivityChart data={data.weeklyActivity} />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-bold text-foreground">
            <Award className="h-5 w-5 text-primary" />
            نشان‌ها
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.badges.map((b) => {
              const Icon = BADGE_ICONS[b.icon] ?? Award;
              return (
                <div
                  key={b.slug}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    b.earned ? "border-primary/40 bg-primary/5" : "border-border opacity-50"
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    b.earned ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-extrabold text-foreground">
          {toPersianDigits(value)}
          {suffix ? <span className="text-sm font-normal text-muted-foreground"> {suffix}</span> : null}
        </span>
      </CardContent>
    </Card>
  );
}
