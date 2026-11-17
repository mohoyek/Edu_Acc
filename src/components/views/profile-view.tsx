"use client";

import { useEffect, useState } from "react";
import { Loader2, KeyRound, Save, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { formatJalali } from "@/lib/format/jalali";
import { toast } from "@/hooks/use-toast";

interface ProfileUser {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  points: number;
  level: number;
  streak: number;
  createdAt: string;
}

export function ProfileView() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  // فرم پروفایل
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // فرم تغییر رمز
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          setFirstName(d.user.firstName ?? "");
          setLastName(d.user.lastName ?? "");
          setPhone(d.user.phone ?? "");
        }
      })
      .catch(() => toast({ title: "بارگذاری پروفایل ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errors = data?.errors as Record<string, string> | undefined;
        const detail = errors
          ? Object.values(errors)[0]
          : data?.error ?? "ذخیره ناموفق بود.";
        toast({ title: "ذخیره ناموفق", description: detail, variant: "destructive" });
        return;
      }
      setUser(data.user);
      toast({ title: "ذخیره شد", description: "پروفایل شما به‌روزرسانی شد." });
    } catch {
      toast({ title: "خطا", description: "اتصال به سرور ناموفق بود.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "تکرار رمز مطابقت ندارد",
        description: "رمز جدید و تکرار آن باید یکسان باشند.",
        variant: "destructive",
      });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "تغییر رمز ناموفق",
          description: data?.error ?? "خطایی رخ داد.",
          variant: "destructive",
        });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "رمز عوض شد", description: "از این به بعد با رمز جدید وارد شو." });
    } catch {
      toast({ title: "خطا", description: "اتصال به سرور ناموفق بود.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
            پروفایل من
          </h1>
          <p className="mt-1 text-muted-foreground">
            مشخصات، اطلاعات تماس و تغییر رمز عبور
          </p>
        </div>
        {user.role === "ADMIN" && (
          <Badge className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            مدیر
          </Badge>
        )}
      </div>

      {/* خلاصه‌ی وضعیت */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">امتیاز</p>
            <p className="text-xl font-extrabold text-primary">{toPersianDigits(user.points)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">سطح</p>
            <p className="text-xl font-extrabold text-primary">{toPersianDigits(user.level)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">رکورد روزها</p>
            <p className="text-xl font-extrabold text-primary">{toPersianDigits(user.streak)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">عضویت از</p>
            <p className="text-sm font-bold text-primary pt-1.5">
              {formatJalali(new Date(user.createdAt), "long")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* فرم مشخصات */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">مشخصات و اطلاعات تماس</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">نام</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">نام خانوادگی</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">شماره تماس</Label>
                <Input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  اگر رمزت را فراموش کنی، رمز موقت با همین شماره به تو اعلام می‌شود.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-readonly">ایمیل (غیرقابل تغییر)</Label>
                <Input id="email-readonly" type="email" dir="ltr" value={user.email} disabled />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              ذخیره مشخصات
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* تغییر رمز عبور */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5" />
            تغییر رمز عبور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">رمز فعلی</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  required
                  dir="ltr"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">رمز جدید (حداقل ۶ کاراکتر)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  minLength={6}
                  dir="ltr"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز جدید</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  dir="ltr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" variant="outline" disabled={changingPassword}>
              {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              تغییر رمز
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
