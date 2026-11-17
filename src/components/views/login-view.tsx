"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@/lib/router";
import { toast } from "@/hooks/use-toast";

export function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast({
        title: "ورود ناموفق",
        description: "ایمیل یا رمز اشتباه است.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "خوش آمدید!", description: "با موفقیت وارد شدید." });
    navigate("/dashboard");
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "خطا",
          description: data?.error ?? "ارسال درخواست ناموفق بود.",
          variant: "destructive",
        });
        return;
      }
      setForgotDone(true);
    } catch {
      toast({
        title: "خطا",
        description: "اتصال به سرور ناموفق بود.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  }

  if (mode === "forgot") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
        <Card className="w-full border-border">
          <CardHeader>
            <CardTitle className="text-center text-2xl">فراموشی رمز عبور</CardTitle>
          </CardHeader>
          <CardContent>
            {forgotDone ? (
              <div className="space-y-4 text-center">
                <p className="text-sm leading-6 text-foreground">
                  درخواست شما ثبت شد. مدیر سایت آن را بررسی می‌کند و یک رمز موقت
                  برای شما می‌سازد؛ رمز از طریق شماره تماسی که در پروفایل دارید به
                  شما اعلام می‌شود.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setMode("login")}>
                  <ArrowRight className="h-4 w-4" />
                  بازگشت به ورود
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  ایمیل حساب خود را وارد کنید تا درخواست بازیابی رمز برای مدیر
                  ارسال شود.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">ایمیل</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    dir="ltr"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={forgotLoading}>
                  {forgotLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  ارسال درخواست
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm font-semibold text-primary hover:underline"
                  onClick={() => setMode("login")}
                >
                  بازگشت به ورود
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full border-border">
        <CardHeader>
          <CardTitle className="text-center text-2xl">ورود</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                required
                dir="ltr"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                required
                dir="ltr"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              ورود
            </Button>
          </form>
          <div className="mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <button
              className="font-semibold text-primary hover:underline"
              onClick={() => setMode("forgot")}
            >
              رمزم را فراموش کرده‌ام
            </button>
            <span>
              حساب نداری؟{" "}
              <button
                className="font-semibold text-primary hover:underline"
                onClick={() => navigate("/register")}
              >
                ثبت‌نام کن
              </button>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
