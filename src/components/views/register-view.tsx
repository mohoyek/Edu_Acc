"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@/lib/router";
import { toast } from "@/hooks/use-toast";

export function RegisterView() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "ثبت‌نام ناموفق",
          description: data?.error ?? "خطایی رخ داد.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      // ورود خودکار
      const sign = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });
      if (sign?.error) {
        toast({
          title: "ثبت‌نام انجام شد",
          description: "حالا وارد شو.",
        });
        navigate("/login");
        return;
      }
      toast({
        title: "خوش آمدی!",
        description: "ثبت‌نام موفق بود؛ اول پروفایلت را تکمیل کن.",
      });
      // بعد از ثبت‌نام، مستقیم به صفحه‌ی تکمیل پروفایل
      navigate("/profile");
    } catch {
      toast({
        title: "خطا",
        description: "اتصال به سرور ناموفق بود.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full border-border">
        <CardHeader>
          <CardTitle className="text-center text-2xl">ثبت‌نام</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">شماره تماس یا نام کاربری</Label>
              <Input
                id="identifier"
                type="text"
                required
                dir="ltr"
                inputMode="text"
                placeholder="09123456789 یا MoHoYek"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                با همین شماره یا نام کاربری، هر بار وارد می‌شوی.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور (حداقل ۶ کاراکتر)</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                dir="ltr"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <p className="rounded-lg bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
              نیازی به ایمیل نیست. بعد از ثبت‌نام، نام و نام خانوادگی و شماره تماس‌ات
              را در پروفایل تکمیل می‌کنی — برای حل تمرین‌ها لازم است.
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              ثبت‌نام
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            حساب داری؟{" "}
            <button
              className="font-semibold text-primary hover:underline"
              onClick={() => navigate("/login")}
            >
              وارد شو
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
