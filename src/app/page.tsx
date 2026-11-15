"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useHashRoute, useNavigate, matchRoute } from "@/lib/router";
import { Header } from "@/components/layout/header";
import { AppShell } from "@/components/layout/app-shell";
import { HomeView } from "@/components/views/home-view";
import { LoginView } from "@/components/views/login-view";
import { RegisterView } from "@/components/views/register-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { ComingSoonView } from "@/components/views/coming-soon-view";
import { PathView } from "@/components/views/path-view";
import { LessonView } from "@/components/views/lesson-view";
import { GlossaryView } from "@/components/views/glossary-view";

export default function Home() {
  const { data: session, status } = useSession();
  const route = useHashRoute();
  const navigate = useNavigate();

  const authenticated = status === "authenticated";

  // اگر کاربر واردشده است و روی ورود/ثبت‌نام است → داشبورد
  useEffect(() => {
    if (authenticated && (route === "/login" || route === "/register")) {
      navigate("/dashboard");
    }
  }, [authenticated, route, navigate]);

  // حالت بارگذاری اولیه
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // مسیرهای عمومی (بدون نیاز به ورود)
  if (route === "/login") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <LoginView />
      </div>
    );
  }
  if (route === "/register") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <RegisterView />
      </div>
    );
  }

  // کاربر واردنشده → فقط صفحه‌ی فرود
  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <HomeView />
      </div>
    );
  }

  // کاربر واردشده → اپ با سایدبار
  let view: React.ReactNode;
  if (route === "/dashboard" || route === "/") {
    view = <DashboardView />;
  } else if (route === "/path") {
    view = <PathView />;
  } else if (route === "/glossary") {
    view = <GlossaryView />;
  } else {
    const lessonMatch = matchRoute(route, "/lessons/:slug");
    if (lessonMatch) {
      view = <LessonView key={lessonMatch.slug} slug={lessonMatch.slug} />;
    } else if (route === "/exercises" || route.startsWith("/exercise")) {
      view = (
        <ComingSoonView
          title="تمرین ثبت سند"
          stage={3}
          description="موتور تمرین سند با بازخورد فوری به‌زودی."
        />
      );
    } else if (route === "/reports") {
      view = (
        <ComingSoonView
          title="گزارش‌ها"
          stage={4}
          description="دفتر روزنامه، دفتر کل، تراز آزمایشی و سود و زیان به‌زودی."
        />
      );
    } else {
      view = <DashboardView />;
    }
  }

  return <AppShell>{view}</AppShell>;
}
