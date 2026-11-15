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

export function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
          <div className="mt-4 text-center text-sm text-muted-foreground">
            حساب نداری؟{" "}
            <button
              className="font-semibold text-primary hover:underline"
              onClick={() => navigate("/register")}
            >
              ثبت‌نام کن
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
