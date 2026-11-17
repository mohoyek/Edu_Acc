"use client";

import { UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router";

/**
 * گیت تکمیل پروفایل برای حل تمرین:
 * کاربر عادی تا نام، نام خانوادگی و شماره تماس را در پروفایل پر نکند، اجازه‌ی حل تمرین ندارد.
 */
export function ProfileGate() {
  const navigate = useNavigate();

  return (
    <Card className="mx-auto max-w-lg border-amber-500/40">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
          <UserRound className="h-6 w-6" />
        </span>
        <p className="text-lg font-bold text-foreground">
          اول پروفایلت را تکمیل کن
        </p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          برای حل تمرین‌ها باید نام، نام خانوادگی و شماره تماس‌ات در پروفایل ثبت شده
          باشد. شماره تماس برای بازیابی رمز در صورت فراموشی هم استفاده می‌شود.
        </p>
        <Button className="mt-2" onClick={() => navigate("/profile")}>
          تکمیل پروفایل
        </Button>
      </CardContent>
    </Card>
  );
}
