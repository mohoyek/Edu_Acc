"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  ClipboardList,
  Home,
  LayoutDashboard,
  BookText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHashRoute, useNavigate } from "@/lib/router";
import { Header } from "@/components/layout/header";
import { toPersianDigits } from "@/lib/format/persian-digits";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  stage?: number; // در کدام مرحله فعال می‌شود
  match: string[]; // مسیرهایی که آیتم را «فعال» نشان می‌دهند
}

const NAV_ITEMS: NavItem[] = [
  { label: "داشبورد", path: "/dashboard", icon: LayoutDashboard, match: ["/dashboard", "/"] },
  { label: "مسیر یادگیری", path: "/path", icon: BookOpen, stage: 2, match: ["/path"] },
  { label: "تمرین ثبت سند", path: "/exercises", icon: ClipboardList, stage: 3, match: ["/exercises", "/exercise"] },
  { label: "گزارش‌ها", path: "/reports", icon: BookText, stage: 4, match: ["/reports"] },
  { label: "فرهنگ لغت", path: "/glossary", icon: Sparkles, stage: 2, match: ["/glossary"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const route = useHashRoute();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    if (session?.user) {
      fetch("/api/me")
        .then((r) => r.json())
        .then((d) => {
          if (active && d?.user) setPoints(d.user.points ?? 0);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [session?.user]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
        {/* سایدبار: در دسکتاپ سمت راست (RTL) */}
        <aside className="hidden w-60 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.match.some(
                (m) => route === m || route.startsWith(m + "/"),
              );
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-sm">{item.label}</span>
                  {item.stage ? (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                      مرحله {toPersianDigits(item.stage)}
                    </span>
                  ) : null}
                </button>
              );
            })}
            {points !== null && (
              <div className="mt-4 rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">امتیاز شما</p>
                <p className="text-xl font-extrabold text-primary">
                  {toPersianDigits(points)}
                </p>
              </div>
            )}
          </nav>
        </aside>

        {/* محتوای اصلی */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground">
          حسابدار شو — آموزش حسابداری با تمرین عملی · ساخته‌شده با Next.js
        </div>
      </footer>
    </div>
  );
}
