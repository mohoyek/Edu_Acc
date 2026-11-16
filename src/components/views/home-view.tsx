"use client";

import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@/lib/router";

const FEATURES = [
  {
    icon: BookOpen,
    title: "درس‌های خیلی ساده",
    desc: "هر درس فقط یک مفهوم، ۵ تا ۷ دقیقه. اول یک داستان روزمره، بعد تعریف رسمی.",
  },
  {
    icon: ClipboardList,
    title: "تمرین ثبت سند با بازخورد فوری",
    desc: "اتفاق مالی را می‌خوانی، سند را می‌سازی، سیستم دقیق می‌گوید کجای کار غلط است و چرا.",
  },
  {
    icon: LayoutDashboard,
    title: "شرکت مجازی و گزارش‌گیری",
    desc: "سندهای درست‌شده در دفتر کل ثبت می‌شود؛ تراز آزمایشی و سود و زیان واقعی می‌بینی.",
  },
  {
    icon: TrendingUp,
    title: "داشبورد پیشرفت",
    desc: "درصد تسلط هر مبحث، نقاط ضعف، رکورد روزانه و نمودار فعالیت هفتگی.",
  },
];

export function HomeView() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      {/* هیرو */}
      <section className="flex flex-col items-center text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          <Sparkles className="h-4 w-4" />
          از صفر تا حسابدار حرفه‌ای
        </span>
        <h1 className="text-3xl font-extrabold leading-tight text-foreground md:text-5xl">
          حسابداری را با{" "}
          <span className="text-primary">تمرین عملی</span> یاد بگیر
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          درس‌های کوتاه به زبان ساده، تمرین ثبت سند با بازخورد فوری، و یک شرکت
          مجازی که گزارش‌های واقعی می‌دهد. ارزش اصلی، تمرینِ عملی است؛ نه فقط متن
          و ویدیو.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate("/register")}>
            <Wallet className="h-5 w-5" />
            شروع رایگان
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/login")}
          >
            ورود
          </Button>
        </div>
      </section>

      {/* ویژگی‌ها */}
      <section className="mt-16 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="border-border">
              <CardContent className="flex flex-col gap-3 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* مسیر */}
      <section className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-8">
        <h2 className="text-xl font-bold text-foreground">مسیر یادگیری</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-secondary/60 p-5">
            <p className="text-sm font-bold text-foreground">سطح ۱ — مفاهیم پایه</p>
            <p className="mt-1 text-sm text-muted-foreground">
              دارایی، بدهی، سرمایه، درآمد، هزینه و معادله‌ی حسابداری.
            </p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-5">
            <p className="text-sm font-bold text-foreground">سطح ۲ — ثبت سند</p>
            <p className="mt-1 text-sm text-muted-foreground">
              ثبت سند، دفتر کل و تراز آزمایشی.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
