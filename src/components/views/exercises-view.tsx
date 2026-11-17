"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { ProfileGate } from "@/components/exercise/profile-gate";
import { toast } from "@/hooks/use-toast";

interface ExerciseListItem {
  slug: string;
  title: string;
  storyPreview: string;
  solved: boolean;
}

export function ExercisesView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ExerciseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  // هشدار پروفایل ناقص بالای فهرست تمرین‌ها
  const [profileBlocked, setProfileBlocked] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/exercises").then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ])
      .then(([d, m]) => {
        setItems(d.exercises ?? []);
        setProfileBlocked(m?.mustCompleteProfile === true);
      })
      .catch(() => toast({ title: "بارگذاری ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const solvedCount = items.filter((i) => i.solved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
          تمرین ثبت سند
        </h1>
        <p className="mt-1 text-muted-foreground">
          {toPersianDigits(solvedCount)} از {toPersianDigits(items.length)} تمرین حل شده.
          هر تمرین درست، در دفتر شرکت مجازی‌ات ثبت می‌شود.
        </p>
      </div>

      {profileBlocked && <ProfileGate />}

      <div className="grid gap-3">
        {items.map((it, i) => (
          <Card
            key={it.slug}
            className="cursor-pointer border-border transition-colors hover:border-primary/40"
            onClick={() => navigate(`/exercise/${it.slug}`)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    تمرین {toPersianDigits(i + 1)}
                  </span>
                  {it.solved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      حل‌شده
                    </span>
                  )}
                </div>
                <p className="font-bold text-foreground">{it.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {it.storyPreview}…
                </p>
              </div>
              <Button size="sm" variant={it.solved ? "outline" : "default"} className="shrink-0">
                {it.solved ? "مرور" : "شروع"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
