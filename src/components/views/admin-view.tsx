"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Check,
  Copy,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { formatJalali } from "@/lib/format/jalali";
import { generateTempPassword } from "@/lib/password-reset";
import type { AdminAction } from "@/lib/admin-actions";
import { toast } from "@/hooks/use-toast";

interface AdminUserRow {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  points: number;
  level: number;
  streak: number;
  createdAt: string;
  lastActivityAt: string | null;
  badgesCount: number;
  summary: {
    masteryPercent: number;
    quizAvgPercent: number | null;
    completedLessons: number;
    totalLessons: number;
    solvedExercises: number;
    totalExercises: number;
  };
}

interface Overview {
  totalUsers: number;
  activeLastWeek: number;
  pendingResets: number;
  totalLessons: number;
}

interface ResetRequest {
  id: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  user: {
    id: string;
    name: string | null;
    username?: string | null;
    email: string;
    phone: string | null;
    isActive?: boolean;
    createdAt?: string;
  };
}

interface ResetHistoryItem extends ResetRequest {
  resolver?: { name: string | null; email: string } | null;
}

interface UserDetail {
  user: AdminUserRow;
  mastery: { lessonId: string; title: string; level: number; percent: number; quizScore: number | null }[];
  stats: { completedLessons: number; totalLessons: number; solvedExercises: number; totalExercises: number };
  badges: { slug: string; title: string; awardedAt: string }[];
  recentQuizAttempts: {
    id: string;
    lessonTitle: string;
    score: number;
    total: number;
    passed: boolean;
    createdAt: string;
  }[];
  recentExerciseAttempts: {
    id: string;
    exerciseTitle: string;
    exerciseSlug: string;
    passed: boolean;
    createdAt: string;
  }[];
}

export function AdminView() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [pending, setPending] = useState<ResetRequest[]>([]);
  const [history, setHistory] = useState<ResetHistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [tempDialog, setTempDialog] = useState<{ name: string; password: string } | null>(null);

  // دیالوگ تغییر رمز توسط مدیر
  const [pwUser, setPwUser] = useState<AdminUserRow | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // دیالوگ حذف کاربر
  const [deleteUser, setDeleteUser] = useState<AdminUserRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      if (res.status === 403) {
        setRole("USER");
        return;
      }
      toast({ title: "بارگذاری کاربران ناموفق", description: d?.error, variant: "destructive" });
      return;
    }
    const d = await res.json();
    setUsers(d.users);
    setOverview(d.overview);
    setViewerId(d.viewerId ?? null);
    setRole("ADMIN");
  }, []);

  const loadResets = useCallback(async () => {
    const res = await fetch("/api/admin/resets");
    if (!res.ok) return;
    const d = await res.json();
    setPending(d.pending);
    setHistory(d.history);
  }, []);

  useEffect(() => {
    Promise.all([loadUsers(), loadResets()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadUsers, loadResets]);

  async function toggleDetail(userId: string) {
    if (expandedId === userId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(userId);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`);
      if (!res.ok) throw new Error();
      setDetail(await res.json());
    } catch {
      toast({ title: "بارگذاری جزئیات ناموفق", variant: "destructive" });
      setExpandedId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  // ارتقا / تنزل / فعال‌سازی / غیرفعال‌سازی
  async function handleAction(user: AdminUserRow, action: AdminAction) {
    setWorkingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "عملیات ناموفق",
          description: data?.error ?? "خطایی رخ داد.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: data.message ?? "انجام شد" });
      await loadUsers();
    } catch {
      toast({ title: "خطا", description: "اتصال به سرور ناموفق بود.", variant: "destructive" });
    } finally {
      setWorkingId(null);
    }
  }

  // تغییر رمز کاربر توسط مدیر
  async function handleSetPassword() {
    if (!pwUser) return;
    if (pwValue.trim().length < 6) {
      toast({
        title: "رمز کوتاه است",
        description: "رمز باید حداقل ۶ کاراکتر باشد.",
        variant: "destructive",
      });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${pwUser.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwValue }),
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
      toast({
        title: "رمز تغییر کرد",
        description: "رمز جدید را با تلفن یا پیام‌رسان به کاربر اعلام کنید.",
      });
      setPwUser(null);
      setPwValue("");
      await Promise.all([loadUsers(), loadResets()]);
    } catch {
      toast({ title: "خطا", description: "اتصال به سرور ناموفق بود.", variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  }

  // حذف کامل کاربر
  async function handleDelete() {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "حذف ناموفق",
          description: data?.error ?? "خطایی رخ داد.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "کاربر حذف شد", description: data.message });
      setDeleteUser(null);
      if (expandedId === deleteUser.id) {
        setExpandedId(null);
        setDetail(null);
      }
      await Promise.all([loadUsers(), loadResets()]);
    } catch {
      toast({ title: "خطا", description: "اتصال به سرور ناموفق بود.", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleRequest(requestId: string, action: "reset" | "reject") {
    setWorkingId(requestId);
    try {
      const res = await fetch("/api/admin/resets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "رسیدگی ناموفق",
          description: data?.error ?? "خطایی رخ داد.",
          variant: "destructive",
        });
        return;
      }
      if (action === "reject") {
        toast({ title: "درخواست رد شد" });
      } else {
        setTempDialog({
          name: data.user?.name ?? data.user?.email ?? "کاربر",
          password: data.tempPassword,
        });
      }
      await loadResets();
      await loadUsers();
    } catch {
      toast({ title: "خطا", description: "اتصال به سرور ناموفق بود.", variant: "destructive" });
    } finally {
      setWorkingId(null);
    }
  }

  function copyTempPassword() {
    if (!tempDialog) return;
    navigator.clipboard
      .writeText(tempDialog.password)
      .then(() => toast({ title: "کپی شد", description: "رمز موقت در حافظه کپی شد." }))
      .catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role !== "ADMIN") {
    return (
      <Card className="mx-auto max-w-md border-border">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldCheck className="h-10 w-10 text-muted-foreground" />
          <p className="font-bold text-foreground">دسترسی محدود</p>
          <p className="text-sm text-muted-foreground">
            این بخش فقط برای مدیر سایت در دسترس است.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">پنل مدیر</h1>
          <p className="mt-1 text-muted-foreground">
            کاربران، پیشرفت آن‌ها، درخواست‌های فراموشی رمز و مدیریت حساب‌ها
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => Promise.all([loadUsers(), loadResets()])}
        >
          <RefreshCw className="h-4 w-4" />
          به‌روزرسانی
        </Button>
      </div>

      {/* کارت‌های آماری */}
      {overview && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-8 w-8 text-primary/70" />
              <div>
                <p className="text-xs text-muted-foreground">کل کاربران</p>
                <p className="text-xl font-extrabold text-primary">{toPersianDigits(overview.totalUsers)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Flame className="h-8 w-8 text-orange-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">فعال در ۷ روز اخیر</p>
                <p className="text-xl font-extrabold text-primary">{toPersianDigits(overview.activeLastWeek)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <ShieldCheck className="h-8 w-8 text-amber-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">درخواست رمز در انتظار</p>
                <p className="text-xl font-extrabold text-primary">{toPersianDigits(overview.pendingResets)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <BadgeCheck className="h-8 w-8 text-emerald-500/80" />
              <div>
                <p className="text-xs text-muted-foreground">کل درس‌ها</p>
                <p className="text-xl font-extrabold text-primary">{toPersianDigits(overview.totalLessons)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" dir="rtl">
        <TabsList>
          <TabsTrigger value="users">کاربران</TabsTrigger>
          <TabsTrigger value="resets">
            فراموشی رمز
            {pending.length > 0 && (
              <Badge variant="destructive" className="mr-2 h-5 min-w-5 px-1.5">
                {toPersianDigits(pending.length)}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ---------- کاربران ---------- */}
        <TabsContent value="users" className="space-y-3">
          <Card className="border-border">
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام</TableHead>
                    <TableHead>تماس</TableHead>
                    <TableHead>امتیاز</TableHead>
                    <TableHead>تسلط</TableHead>
                    <TableHead>درس کامل</TableHead>
                    <TableHead>تمرین حل‌شده</TableHead>
                    <TableHead>نشان</TableHead>
                    <TableHead>ثبت‌نام</TableHead>
                    <TableHead>جزئیات</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <AdminUserRowView
                      key={u.id}
                      user={u}
                      viewerId={viewerId}
                      expanded={expandedId === u.id}
                      detail={detail}
                      detailLoading={detailLoading && expandedId === u.id}
                      working={workingId === u.id}
                      onToggle={() => toggleDetail(u.id)}
                      onAction={handleAction}
                      onOpenPassword={(x) => {
                        setPwValue("");
                        setPwUser(x);
                      }}
                      onOpenDelete={setDeleteUser}
                    />
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                        هنوز کاربری ثبت‌نام نکرده است.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- فراموشی رمز ---------- */}
        <TabsContent value="resets" className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">درخواست‌های در انتظار</h2>
            {pending.length === 0 && (
              <Card className="border-border">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  درخواستی در انتظار رسیدگی نیست.
                </CardContent>
              </Card>
            )}
            {pending.map((r) => (
              <Card key={r.id} className="border-border">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">
                      {r.user.name ?? "بدون نام"}
                      <span className="mr-2 text-xs font-normal text-muted-foreground" dir="ltr">
                        {r.user.email}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      شماره تماس: {r.user.phone ? toPersianDigits(r.user.phone) : "ثبت نشده"}
                      {" · "}
                      تاریخ درخواست: {formatJalali(new Date(r.createdAt), "long")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={workingId === r.id}
                      onClick={() => handleRequest(r.id, "reset")}
                    >
                      {workingId === r.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      ساخت رمز موقت
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={workingId === r.id}
                      onClick={() => handleRequest(r.id, "reject")}
                    >
                      <X className="h-4 w-4" />
                      رد
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">تاریخچه رسیدگی</h2>
            <Card className="border-border">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>کاربر</TableHead>
                      <TableHead>نتیجه</TableHead>
                      <TableHead>تاریخ رسیدگی</TableHead>
                      <TableHead>مدیر</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>
                          <span className="font-medium">{h.user.name ?? "بدون نام"}</span>
                          <span className="mr-2 text-xs text-muted-foreground" dir="ltr">
                            {h.user.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          {h.status === "RESOLVED" ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600">رمز موقت ساخته شد</Badge>
                          ) : (
                            <Badge variant="secondary">رد شد</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {h.resolvedAt ? formatJalali(new Date(h.resolvedAt)) : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {h.resolver?.name ?? h.resolver?.email ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {history.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          هنوز درخواستی رسیدگی نشده است.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>

      {/* دیالوگ تغییر رمز کاربر */}
      <Dialog open={pwUser !== null} onOpenChange={(open) => !open && setPwUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تغییر رمز کاربر</DialogTitle>
            <DialogDescription>
              رمز جدید برای «{pwUser?.name ?? pwUser?.email}» را تعیین کنید و خارج از سایت
              (تلفن یا پیام‌رسان) به او اعلام کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground" dir="ltr">
              {pwUser?.email}
              {pwUser?.username ? ` · ${pwUser.username}` : ""}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">رمز جدید</Label>
              <div className="flex gap-2">
                <Input
                  id="new-password"
                  type="text"
                  dir="ltr"
                  placeholder="حداقل ۶ کاراکتر"
                  value={pwValue}
                  onChange={(e) => setPwValue(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPwValue(generateTempPassword(8))}
                >
                  تولید رمز موقت
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPwUser(null)}>
              انصراف
            </Button>
            <Button onClick={handleSetPassword} disabled={pwLoading || pwValue.trim().length < 6}>
              {pwLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              ذخیره رمز جدید
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* دیالوگ حذف کاربر */}
      <Dialog open={deleteUser !== null} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">حذف کاربر</DialogTitle>
            <DialogDescription>
              با حذف «{deleteUser?.name ?? deleteUser?.email}» همه‌ی داده‌های او برای همیشه پاک
              می‌شود: شرکت مجازی، سندها، پیشرفت درس‌ها، تلاش‌های تمرین و نشان‌ها. این عمل قابل
              بازگشت نیست.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              حذف همیشگی
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* دیالوگ نمایش رمز موقت — فقط یک‌بار */}
      <Dialog open={tempDialog !== null} onOpenChange={(open) => !open && setTempDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>رمز موقت ساخته شد</DialogTitle>
            <DialogDescription>
              این رمز برای «{tempDialog?.name}» ساخته شد. فقط همین یک‌بار نمایش داده
              می‌شود — آن را با تلفن یا پیام‌رسان برای کاربر ارسال کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-3 py-2">
            <code className="rounded-lg border border-border bg-muted px-4 py-2 text-lg font-bold tracking-widest" dir="ltr">
              {tempDialog?.password}
            </code>
            <Button variant="outline" size="icon" onClick={copyTempPassword} aria-label="کپی رمز">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            کاربر با این رمز وارد می‌شود و بهتر است از صفحه پروفایل، رمز خود را عوض کند.
          </p>
          <DialogFooter>
            <Button className="w-full" onClick={() => setTempDialog(null)}>
              فهمیدم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- ردیف کاربر + نمای بازشده ----------------

function AdminUserRowView({
  user,
  viewerId,
  expanded,
  detail,
  detailLoading,
  working,
  onToggle,
  onAction,
  onOpenPassword,
  onOpenDelete,
}: {
  user: AdminUserRow;
  viewerId: string | null;
  expanded: boolean;
  detail: UserDetail | null;
  detailLoading: boolean;
  working: boolean;
  onToggle: () => void;
  onAction: (user: AdminUserRow, action: AdminAction) => void | Promise<void>;
  onOpenPassword: (user: AdminUserRow) => void;
  onOpenDelete: (user: AdminUserRow) => void;
}) {
  const isSelf = viewerId === user.id;

  return (
    <>
      <TableRow
        className={`cursor-pointer ${!user.isActive ? "opacity-60" : ""}`}
        onClick={onToggle}
      >
        <TableCell>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`font-medium text-foreground ${!user.isActive ? "line-through decoration-muted-foreground/50" : ""}`}>
              {user.name ?? "بدون نام"}
            </span>
            {user.role === "ADMIN" && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                مدیر
              </Badge>
            )}
            {!user.isActive && (
              <Badge variant="outline" className="h-5 border-destructive/40 px-1.5 text-[10px] text-destructive">
                غیرفعال
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground" dir="ltr">
            {user.username ? `${user.username} · ` : ""}
            {user.email}
          </span>
        </TableCell>
        <TableCell className="text-sm" dir="ltr">
          {user.phone ? toPersianDigits(user.phone) : "—"}
        </TableCell>
        <TableCell className="text-sm font-bold text-primary">
          {toPersianDigits(user.points)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Progress value={user.summary.masteryPercent} className="h-2 w-14" />
            <span className="text-xs text-muted-foreground">
              {toPersianDigits(user.summary.masteryPercent)}٪
            </span>
          </div>
        </TableCell>
        <TableCell className="text-sm">
          {toPersianDigits(user.summary.completedLessons)} / {toPersianDigits(user.summary.totalLessons)}
        </TableCell>
        <TableCell className="text-sm">
          {toPersianDigits(user.summary.solvedExercises)} / {toPersianDigits(user.summary.totalExercises)}
        </TableCell>
        <TableCell className="text-sm">{toPersianDigits(user.badgesCount)}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatJalali(new Date(user.createdAt))}
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="icon" aria-label="نمایش جزئیات">
            {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-0.5">
            {/* تغییر رمز — همیشه در دسترس */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="تغییر رمز"
              aria-label="تغییر رمز"
              disabled={working}
              onClick={() => onOpenPassword(user)}
            >
              <KeyRound className="h-4 w-4" />
            </Button>

            {/* ارتقا به مدیر */}
            {user.role !== "ADMIN" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="ارتقا به مدیر"
                aria-label="ارتقا به مدیر"
                disabled={working}
                onClick={() => onAction(user, "promote")}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </Button>
            )}

            {/* سلب مدیریت */}
            {user.role === "ADMIN" && !isSelf && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="سلب مدیریت"
                aria-label="سلب مدیریت"
                disabled={working}
                onClick={() => onAction(user, "demote")}
              >
                <ShieldOff className="h-4 w-4 text-amber-600" />
              </Button>
            )}

            {/* غیرفعال‌سازی / فعال‌سازی */}
            {isSelf ? null : user.isActive ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="غیرفعال‌سازی حساب"
                aria-label="غیرفعال‌سازی حساب"
                disabled={working}
                onClick={() => onAction(user, "deactivate")}
              >
                <UserX className="h-4 w-4 text-orange-600" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="فعال‌سازی حساب"
                aria-label="فعال‌سازی حساب"
                disabled={working}
                onClick={() => onAction(user, "activate")}
              >
                <UserCheck className="h-4 w-4 text-emerald-600" />
              </Button>
            )}

            {/* حذف */}
            {!isSelf && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="حذف کاربر"
                aria-label="حذف کاربر"
                disabled={working}
                onClick={() => onOpenDelete(user)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}

            {working && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={10} className="bg-muted/30 p-4">
            {detailLoading || !detail ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* تسلط درس‌به‌درس */}
                <div className="space-y-2 lg:col-span-2">
                  <p className="text-sm font-bold text-foreground">تسلط درس‌به‌درس</p>
                  <div className="space-y-1.5">
                    {detail.mastery.map((m) => (
                      <div key={m.lessonId} className="flex items-center gap-2">
                        <span className="w-40 shrink-0 truncate text-xs text-muted-foreground">
                          {m.title}
                        </span>
                        <Progress value={m.percent} className="h-2 flex-1" />
                        <span className="w-12 text-left text-xs text-muted-foreground">
                          {toPersianDigits(m.percent)}٪
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* نشان‌ها + تلاش‌های اخیر */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-foreground">
                      نشان‌ها ({toPersianDigits(detail.badges.length)})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {detail.badges.map((b) => (
                        <Badge key={b.slug} variant="secondary" className="text-[11px]">
                          {b.title}
                        </Badge>
                      ))}
                      {detail.badges.length === 0 && (
                        <span className="text-xs text-muted-foreground">هنوز نشان ندارد</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">تلاش‌های اخیر</p>
                    {detail.recentQuizAttempts.slice(0, 3).map((a) => (
                      <p key={a.id} className="text-xs text-muted-foreground">
                        کوییز «{a.lessonTitle}»: {toPersianDigits(a.score)} از{" "}
                        {toPersianDigits(a.total)} · {formatJalali(new Date(a.createdAt))}
                      </p>
                    ))}
                    {detail.recentExerciseAttempts.slice(0, 3).map((a) => (
                      <p key={a.id} className="text-xs text-muted-foreground">
                        تمرین «{a.exerciseTitle}»: {a.passed ? "حل شد ✓" : "ناموفق"} ·{" "}
                        {formatJalali(new Date(a.createdAt))}
                      </p>
                    ))}
                    {detail.recentQuizAttempts.length === 0 &&
                      detail.recentExerciseAttempts.length === 0 && (
                        <p className="text-xs text-muted-foreground">هنوز فعالیتی ندارد</p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
