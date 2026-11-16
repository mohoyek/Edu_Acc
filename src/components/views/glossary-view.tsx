"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { toast } from "@/hooks/use-toast";

interface Term {
  slug: string;
  term: string;
  definition: string;
  example?: string | null;
}

export function GlossaryView() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/glossary")
      .then((r) => r.json())
      .then((d) => setTerms(d.terms ?? []))
      .catch(() => toast({ title: "بارگذاری ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return terms;
    return terms.filter(
      (t) => t.term.includes(q) || t.definition.includes(q),
    );
  }, [terms, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
          فرهنگ لغت حسابداری
        </h1>
        <p className="mt-1 text-muted-foreground">
          {toPersianDigits(terms.length)} اصطلاح
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pr-9"
          placeholder="جستجوی اصطلاح…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((t, i) => (
          <Card key={t.slug} className="border-border">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {toPersianDigits(i + 1)}
                </span>
                <h3 className="font-bold text-primary">{t.term}</h3>
              </div>
              <p className="text-sm text-foreground">{t.definition}</p>
              {t.example && (
                <p className="text-xs text-muted-foreground">
                  مثال: {t.example}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground">
          اصطلاحی یافت نشد.
        </p>
      )}
    </div>
  );
}
