"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toPersianDigits } from "@/lib/format/persian-digits";
import { formatMoney } from "@/lib/format/money";
import type { AccountInfo } from "@/lib/accounting/types";

export interface BuilderLine {
  accountCode: string;
  debit: string; // ورودی کاربر (تومان، رشته)
  credit: string;
}

export function JournalBuilder({
  accounts,
  lines,
  onChange,
  disabled,
}: {
  accounts: AccountInfo[];
  lines: BuilderLine[];
  onChange: (lines: BuilderLine[]) => void;
  disabled?: boolean;
}) {
  const update = (i: number, patch: Partial<BuilderLine>) => {
    const next = lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onChange(next);
  };

  const addRow = () => {
    onChange([...lines, { accountCode: "", debit: "", credit: "" }]);
  };

  const removeRow = (i: number) => {
    if (lines.length <= 1) return;
    onChange(lines.filter((_, idx) => idx !== i));
  };

  const sumDebit = lines.reduce((s, l) => s + (Number(l.debit.replace(/[^\d]/g, "")) || 0), 0);
  const sumCredit = lines.reduce((s, l) => s + (Number(l.credit.replace(/[^\d]/g, "")) || 0), 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="border border-border px-3 py-2 text-right font-bold">حساب</th>
              <th className="border border-border px-3 py-2 text-right font-bold">بدهکار (تومان)</th>
              <th className="border border-border px-3 py-2 text-right font-bold">بستانکار (تومان)</th>
              <th className="border border-border px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="border border-border p-1">
                  <Select
                    value={line.accountCode}
                    onValueChange={(v) => update(i, { accountCode: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="min-w-[180px]">
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
                </td>
                <td className="border border-border p-1">
                  <Input
                    dir="ltr"
                    inputMode="numeric"
                    className="text-left"
                    placeholder="۰"
                    value={line.debit}
                    disabled={disabled}
                    onChange={(e) => {
                      update(i, { debit: e.target.value, credit: "" });
                    }}
                  />
                </td>
                <td className="border border-border p-1">
                  <Input
                    dir="ltr"
                    inputMode="numeric"
                    className="text-left"
                    placeholder="۰"
                    value={line.credit}
                    disabled={disabled}
                    onChange={(e) => {
                      update(i, { credit: e.target.value, debit: "" });
                    }}
                  />
                </td>
                <td className="border border-border p-1 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(i)}
                    disabled={disabled || lines.length <= 1}
                    aria-label="حذف ردیف"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 font-bold">
              <td className="border border-border px-3 py-2">جمع</td>
              <td className="border border-border px-3 py-2 text-left">
                {sumDebit > 0 ? toPersianDigits(sumDebit.toLocaleString("en-US")) : "—"}
              </td>
              <td className="border border-border px-3 py-2 text-left">
                {sumCredit > 0 ? toPersianDigits(sumCredit.toLocaleString("en-US")) : "—"}
              </td>
              <td className="border border-border"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={disabled}>
          <Plus className="h-4 w-4" />
          افزودن ردیف
        </Button>
        <span className="text-xs text-muted-foreground">
          مبالغ به تومان وارد شوند. هر ردیف فقط یکی از بدهکار یا بستانکار را پر کن.
        </span>
        {sumDebit !== sumCredit && (sumDebit > 0 || sumCredit > 0) && (
          <span className="text-xs font-semibold text-destructive">
            جمع دو طرف برابر نیست (
            {formatMoney(sumDebit * 10)} ≠ {formatMoney(sumCredit * 10)} تومان)
          </span>
        )}
      </div>
    </div>
  );
}

/** تبدیل خطوط سازنده (رشته تومان) به JournalLineInput (ریال). */
export function builderLinesToRials(lines: BuilderLine[]): {
  accountCode: string;
  debit: number;
  credit: number;
}[] {
  const toRials = (s: string) => {
    const digits = s.replace(/[^\d]/g, "");
    const n = digits === "" ? 0 : Number(digits);
    return Math.round(n * 10); // تومان → ریال
  };
  return lines.map((l) => ({
    accountCode: l.accountCode,
    debit: toRials(l.debit),
    credit: toRials(l.credit),
  }));
}
