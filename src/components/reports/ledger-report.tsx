"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportToolbar, ReportTable } from "@/components/reports/report-controls";
import { formatMoney } from "@/lib/format/money";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { formatJalali } from "@/lib/format/jalali";
import { downloadCSV, printPage } from "@/lib/csv";
import type { AccountInfo } from "@/lib/accounting/types";
import { toast } from "@/hooks/use-toast";

interface LedgerRow {
  date: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}
interface LedgerResult {
  accountCode: string;
  accountName: string;
  rows: LedgerRow[];
  closingBalance: number;
  closingSide: "debit" | "credit";
}

export function LedgerReport() {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [code, setCode] = useState<string>("");
  const [data, setData] = useState<LedgerResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((d) => {
        setAccounts(d.accounts ?? []);
        if (d.accounts?.length) setCode(d.accounts[0].code);
      })
      .catch(() => toast({ title: "بارگذاری حساب‌ها ناموفق", variant: "destructive" }));
  }, []);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/reports/ledger?accountCode=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast({ title: "بارگذاری ناموفق", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [code]);

  const handleCSV = () => {
    if (!data) return;
    downloadCSV(
      `دفتر-کل-${data.accountCode}.csv`,
      ["تاریخ", "شرح", "بدهکار", "بستانکار", "مانده"],
      data.rows.map((r) => [
        formatJalali(new Date(r.date), "short"),
        r.description,
        r.debit > 0 ? Math.round(r.debit / 10) : 0,
        r.credit > 0 ? Math.round(r.credit / 10) : 0,
        Math.round(Math.abs(r.runningBalance) / 10) * (r.runningBalance < 0 ? -1 : 1),
      ]),
    );
    toast({ title: "CSV دانلود شد" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-foreground">دفتر کل</h2>
          <p className="text-sm text-muted-foreground">مانده‌ی هر حساب به‌تفکیک.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={code} onValueChange={setCode}>
            <SelectTrigger className="min-w-[200px]">
              <SelectValue placeholder="انتخاب حساب" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.code} value={a.code}>
                  {a.code} — {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ReportToolbar onCSV={handleCSV} onPrint={printPage} />
        </div>
      </div>

      {loading || !data ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <Card className="border-border print-block">
          <CardContent className="p-4">
            <p className="mb-3 font-bold text-foreground">
              {data.accountName} ({toPersianDigits(data.accountCode)}) — مانده‌ی پایان:{" "}
              {toPersianDigits(formatMoney(Math.abs(data.closingBalance)))} تومان{" "}
              {data.closingSide === "debit" ? "بدهکار" : "بستانکار"}
            </p>
            <ReportTable
              headers={["تاریخ", "شرح", "بدهکار (تومان)", "بستانکار (تومان)", "مانده (تومان)"]}
              rows={data.rows.map((r) => [
                toPersianDigits(formatJalali(new Date(r.date), "short")),
                r.description,
                r.debit > 0 ? toPersianDigits(formatMoney(r.debit)) : "",
                r.credit > 0 ? toPersianDigits(formatMoney(r.credit)) : "",
                toPersianDigits(formatMoney(Math.abs(r.runningBalance))) +
                  (r.runningBalance < 0 ? " (بس)" : ""),
              ])}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
