// محاسبه‌ی دفتر کل یک حساب — منطق خالص.

import type { AccountInfo } from "./types";

export interface LedgerEntry {
  date: Date | string;
  description: string;
  lines: { accountCode: string; debit: number; credit: number }[];
}

export interface LedgerRow {
  date: string; // ISO
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface LedgerResult {
  accountCode: string;
  accountName: string;
  rows: LedgerRow[];
  openingBalance: number;
  closingBalance: number;
  closingSide: "debit" | "credit";
}

export function computeLedger(
  accountCode: string,
  entries: LedgerEntry[],
  accounts: AccountInfo[],
): LedgerResult {
  const acc = accounts.find((a) => a.code === accountCode);
  const accountName = acc?.name ?? `کد ${accountCode}`;

  const relevant = entries
    .filter((e) => e.lines.some((l) => l.accountCode === accountCode))
    .map((e) => {
      const d = typeof e.date === "string" ? new Date(e.date) : e.date;
      return { date: d, description: e.description, lines: e.lines };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let balance = 0;
  const rows: LedgerRow[] = [];

  for (const e of relevant) {
    const line = e.lines.find((l) => l.accountCode === accountCode)!;
    balance += line.debit - line.credit;
    rows.push({
      date: e.date.toISOString(),
      description: e.description,
      debit: line.debit,
      credit: line.credit,
      runningBalance: balance,
    });
  }

  return {
    accountCode,
    accountName,
    rows,
    openingBalance: 0,
    closingBalance: balance,
    closingSide: balance >= 0 ? "debit" : "credit",
  };
}
