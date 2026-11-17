"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useNavigate } from "@/lib/router";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { toPersianDigits } from "@/lib/format/persian-digits";

export function Header() {
  const { data: session, status } = useSession();
  const navigate = useNavigate();

  const user = session?.user;
  const initial = user?.name?.[0] ?? user?.email?.[0] ?? "؟";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <button
          className="flex items-center gap-2"
          onClick={() => navigate(user ? "/dashboard" : "/")}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold text-foreground">
            حسابدار شو
          </span>
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === "authenticated" && user ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">
                  {user.name ?? user.email ?? "کاربر"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
                <span className="mr-1">خروج</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
              >
                ورود
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                شروع کنید
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
