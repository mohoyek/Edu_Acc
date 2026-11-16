"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportToolbar, ReportTable } from "@/components/reports/report-controls";
import { formatMoney } from "@/lib/format/money";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { downloadCSV, printPage } from "@/lib/csv";
import { toast } from "@/hooks/use-toast";

interface ISResult {
  revenues: { accountCode: string; accountName: string; amount: number }[];
  expenses: { accountCode: string; accountName: string; amount: number }[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export function IncomeStatementReport() {
  const [data, setData] = useState<ISResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/income-statement")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast({ title: "بارگذاری ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  if (!data) return null;

  const handleCSV = () => {
    const rows: (string | number)[][] = [];
    rows.push(["درآمدها", "", ""]);
    for (const r of data.revenues)
      rows.push(["", r.accountName, Math.round(r.amount / 10)]);
    rows.push(["جمع درآمدها", "", Math.round(data.totalRevenue / 10)]);
    rows.push(["هزینه‌ها", "", ""]);
    for (const e of data.expenses)
      rows.push(["", e.accountName, Math.round(e.amount / 10)]);
    rows.push(["جمع هزینه‌ها", "", Math.round(data.totalExpense / 10)]);
    rows.push(["سود (زیان) خالص", "", Math.round(data.netProfit / 10)]);
    downloadCSV("سود-و-زیان.csv", ["بخش", "حساب", "مبلغ (تومان)"], rows);
    toast({ title: "CSV دانلود شد" });
  };

  const revRows = [
    ...data.revenues.map((r) => ["درآمد", r.accountName, toPersianDigits(formatMoney(r.amount))]),
    ["", "جمع درآمدها", toPersianDigits(formatMoney(data.totalRevenue))],
  ];
  const expRows = [
    ...data.expenses.map((e) => ["هزینه", e.accountName, toPersianDigits(formatMoney(e.amount))]),
    ["", "جمع هزینه‌ها", toPersianDigits(formatMoney(data.totalExpense))],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">صورت سود و زیان</h2>
          <p className="text-sm text-muted-foreground">
            سود خالص:{" "}
            <span className={data.netProfit >= 0 ? "text-primary font-bold" : "text-destructive font-bold"}>
              {toPersianDigits(formatMoney(Math.abs(data.netProfit)))} تومان{" "}
              {data.netProfit >= 0 ? "(سود)" : "(زیان)"}
            </span>
          </p>
        </div>
        <ReportToolbar onCSV={handleCSV} onPrint={printPage} />
      </div>
      <Card className="border-border print-block">
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="mb-2 font-bold text-primary">درآمدها</p>
            <ReportTable headers={["نوع", "حساب", "مبلغ (تومان)"]} rows={revRows} />
          </div>
          <div>
            <p className="mb-2 font-bold text-destructive">هزینه‌ها</p>
            <ReportTable headers={["نوع", "حساب", "مبلغ (تومان)"]} rows={expRows} />
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-3 text-left">
            <span className="font-bold text-foreground">
              سود (زیان) خالص:{" "}
              {toPersianDigits(formatMoney(Math.abs(data.netProfit)))} تومان{" "}
              {data.netProfit >= 0 ? "سود" : "زیان"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
