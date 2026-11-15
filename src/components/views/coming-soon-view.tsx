"use client";

import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/format/persian-digits";

export function ComingSoonView({
  title,
  stage,
  description,
}: {
  title: string;
  stage: number;
  description?: string;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-foreground">{title}</h1>
      <Card className="border-dashed border-border bg-secondary/40">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Lock className="h-6 w-6" />
          </span>
          <p className="font-semibold text-foreground">
            این بخش در مرحله‌ی {toPersianDigits(stage)} اضافه می‌شود
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {description ??
              "در حال حاضر روی مراحل قبلی تمرکز کرده‌ایم. این قسمت به‌زودی آماده می‌شود."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
