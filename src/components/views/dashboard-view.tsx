"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Flame,
  BookText,
  LayoutDashboard,
  Lock,
  Medal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@/lib/router";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { toast } from "@/hooks/use-toast";

interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    points: number;
    level: number;
    streak: number;
  } | null;
}

const MODULES = [
  {
    icon: BookOpen,
    title: "مسیر یادگیری",
    desc: "درس‌های سطح ۱ و ۲ با کوییز.",
    path: "/path",
    stage: 2,
  },
  {
    icon: ClipboardList,
    title: "تمرین ثبت سند",
    desc: "سند بساز و بازخورد فوری بگیر.",
    path: "/exercises",
    stage: 3,
  },
  {
    icon: BookText,
    title: "گزارش‌ها",
    desc: "دفتر روزنامه، کل، تراز آزمایشی.",
    path: "/reports",
    stage: 4,
  },
  {
    icon: LayoutDashboard,
    title: "داشبورد پیشرفت",
    desc: "نمودار فعالیت و نقاط ضعف.",
    path: "/dashboard",
    stage: 5,
  },
];

export function DashboardView() {
  const navigate = useNavigate();
  const [me, setMe] = useState<MeResponse["user"]>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d: MeResponse) => setMe(d.user))
      .catch(() => toast({ title: "بارگذاری اطلاعات ناموفق", variant: "destructive" }));
  }, []);

  const greeting = me?.name ? `سلام، ${me.name}!` : "سلام!";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
          {greeting}
        </h1>
        <p className="mt-1 text-muted-foreground">
          به شرکت مجازی خودت خوش آمدی. از مسیر یادگیری شروع کن.
        </p>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Medal}
          label="امتیاز"
          value={me?.points ?? 0}
        />
        <StatCard icon={Sparkles} label="سطح" value={me?.level ?? 1} />
        <StatCard icon={Flame} label="رکورد روزانه" value={me?.streak ?? 0} />
        <StatCard icon={TrendingUp} label="درس‌های کامل‌شده" value={0} />
      </div>

      {/* شرکت مجازی */}
      <Card className="border-border">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs text-muted-foreground">شرکت مجازی شما</p>
            <p className="text-lg font-bold text-foreground">شرکت من</p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
            آماده برای ثبت سند
          </span>
        </CardContent>
      </Card>

      {/* ماژول‌ها */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-foreground">بخش‌ها</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODULES.map((m) => {
            const Icon = m.icon;
            const locked = m.stage > 1;
            return (
              <Card
                key={m.path}
                className="border-border transition-colors hover:border-primary/40"
              >
                <CardContent className="flex items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{m.title}</h3>
                      {locked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                          <Lock className="h-3 w-3" />
                          مرحله {toPersianDigits(m.stage)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="border-dashed border-border bg-secondary/40">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <BookOpen className="h-8 w-8 text-primary" />
          <p className="font-semibold text-foreground">آماده‌ای شروع کنی؟</p>
          <p className="text-sm text-muted-foreground">
            درس اول در مرحله‌ی دوم اضافه می‌شود. فعلاً حسابت را بساز و منتظر باش.
          </p>
          <Button variant="outline" onClick={() => navigate("/path")}>
            پیش‌نمایش مسیر یادگیری
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
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
        </span>
      </CardContent>
    </Card>
  );
}
