"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportToolbar, ReportTable } from "@/components/reports/report-controls";
import { formatMoney } from "@/lib/format/money";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { downloadCSV, printPage } from "@/lib/csv";
import { toast } from "@/hooks/use-toast";

interface TBRow {
  accountCode: string;
  accountName: string;
  type: string;
  debitBalance: number;
  creditBalance: number;
}
interface TBResult {
  rows: TBRow[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  asset: "دارایی",
  liability: "بدهی",
  equity: "سرمایه",
  revenue: "درآمد",
  expense: "هزینه",
};

export function TrialBalanceReport() {
  const [data, setData] = useState<TBResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/trial-balance")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast({ title: "بارگذاری ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  if (!data) return null;

  const rows = data.rows.map((r) => [
    r.accountCode,
    r.accountName,
    TYPE_LABEL[r.type] ?? r.type,
    r.debitBalance > 0 ? toPersianDigits(formatMoney(r.debitBalance)) : "",
    r.creditBalance > 0 ? toPersianDigits(formatMoney(r.creditBalance)) : "",
  ]);

  const handleCSV = () => {
    downloadCSV("تراز-آزمایشی.csv", ["کد", "حساب", "نوع", "بدهکار (تومان)", "بستانکار (تومان)"], [
      ...data.rows.map((r) => [
        r.accountCode,
        r.accountName,
        TYPE_LABEL[r.type] ?? r.type,
        r.debitBalance > 0 ? Math.round(r.debitBalance / 10) : 0,
        r.creditBalance > 0 ? Math.round(r.creditBalance / 10) : 0,
      ]),
      ["جمع", "", "", Math.round(data.totalDebit / 10), Math.round(data.totalCredit / 10)],
    ]);
    toast({ title: "CSV دانلود شد" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">تراز آزمایشی</h2>
          <p className="text-sm text-muted-foreground">
            {data.balanced ? (
              <span className="font-semibold text-primary">
                متوازن ✓ جمع بدهکار = جمع بستانکار
              </span>
            ) : (
              <span className="font-semibold text-destructive">نامتوازن — خطایی وجود دارد</span>
            )}
          </p>
        </div>
        <ReportToolbar onCSV={handleCSV} onPrint={printPage} />
      </div>
      <Card className="border-border">
        <CardContent className="p-4">
          <ReportTable
            headers={["کد", "حساب", "نوع", "بدهکار (تومان)", "بستانکار (تومان)"]}
            rows={rows}
            totalRow={[
              "جمع",
              "",
              "",
              toPersianDigits(formatMoney(data.totalDebit)),
              toPersianDigits(formatMoney(data.totalCredit)),
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
