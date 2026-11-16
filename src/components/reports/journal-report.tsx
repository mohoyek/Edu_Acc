"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportToolbar, ReportTable } from "@/components/reports/report-controls";
import { formatMoney } from "@/lib/format/money";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { formatJalali } from "@/lib/format/jalali";
import { downloadCSV, printPage } from "@/lib/csv";
import { toast } from "@/hooks/use-toast";

interface JLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}
interface JEntry {
  id: string;
  date: string;
  description: string;
  source: string;
  exercise: string | null;
  lines: JLine[];
}

export function JournalReport() {
  const [entries, setEntries] = useState<JEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/journal")
      .then((r) => r.json())
      .then((d) => setEntries(d.journal ?? []))
      .catch(() => toast({ title: "بارگذاری ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  const handleCSV = () => {
    const rows: (string | number)[][] = [];
    for (const e of entries) {
      for (const l of e.lines) {
        rows.push([
          formatJalali(new Date(e.date), "short"),
          e.description,
          l.accountCode,
          l.accountName,
          l.debit > 0 ? Math.round(l.debit / 10) : 0,
          l.credit > 0 ? Math.round(l.credit / 10) : 0,
        ]);
      }
    }
    downloadCSV("دفتر-روزنامه.csv", ["تاریخ", "شرح", "کد", "حساب", "بدهکار", "بستانکار"], rows);
    toast({ title: "CSV دانلود شد" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">دفتر روزنامه</h2>
          <p className="text-sm text-muted-foreground">
            {toPersianDigits(entries.length)} سند ثبت شده
          </p>
        </div>
        <ReportToolbar onCSV={handleCSV} onPrint={printPage} />
      </div>

      {entries.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="p-6 text-center text-muted-foreground">
            هنوز سندی ثبت نشده. یک تمرین ثبت سند را حل کن تا اینجا بیفتد.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id} className="border-border print-block">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-bold text-foreground">{e.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {toPersianDigits(formatJalali(new Date(e.date), "short"))}
                  </p>
                </div>
                <ReportTable
                  headers={["کد", "حساب", "بدهکار (تومان)", "بستانکار (تومان)"]}
                  rows={e.lines.map((l) => [
                    l.accountCode,
                    l.accountName,
                    l.debit > 0 ? toPersianDigits(formatMoney(l.debit)) : "",
                    l.credit > 0 ? toPersianDigits(formatMoney(l.credit)) : "",
                  ])}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
