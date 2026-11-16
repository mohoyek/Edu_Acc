// محاسبه‌ی تراز آزمایشی از روی ردیف‌های سند — منطق خالص.
// هر حساب: جمع بدهکار و جمع بستانکار → مانده در سمت بزرگ‌تر.
// چون هر سند متوازن است، جمع کل ستون بدهکار = جمع کل ستون بستانکار.

import type { AccountInfo } from "./types";

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  type: string;
  debitBalance: number; // ریال؛ صفر اگر مانده بستانکار باشد
  creditBalance: number; // ریال؛ صفر اگر مانده بدهکار باشد
}

export interface TrialBalanceResult {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
}

export interface JournalLineFlat {
  accountCode: string;
  debit: number;
  credit: number;
}

export function computeTrialBalance(
  lines: JournalLineFlat[],
  accounts: AccountInfo[],
): TrialBalanceResult {
  const accountMap = new Map(accounts.map((a) => [a.code, a]));
  const sums = new Map<string, { debit: number; credit: number }>();

  for (const l of lines) {
    const cur = sums.get(l.accountCode) ?? { debit: 0, credit: 0 };
    cur.debit += l.debit;
    cur.credit += l.credit;
    sums.set(l.accountCode, cur);
  }

  const rows: TrialBalanceRow[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  for (const [code, s] of sums) {
    const diff = s.debit - s.credit;
    if (diff === 0) continue;
    const acc = accountMap.get(code);
    const row: TrialBalanceRow = {
      accountCode: code,
      accountName: acc?.name ?? `کد ${code}`,
      type: acc?.type ?? "unknown",
      debitBalance: diff > 0 ? diff : 0,
      creditBalance: diff < 0 ? -diff : 0,
    };
    rows.push(row);
    totalDebit += row.debitBalance;
    totalCredit += row.creditBalance;
  }

  rows.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  return {
    rows,
    totalDebit,
    totalCredit,
    balanced: totalDebit === totalCredit,
  };
}
