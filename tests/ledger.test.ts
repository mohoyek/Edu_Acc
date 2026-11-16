import { describe, it, expect } from "vitest";
import { computeLedger } from "@/lib/accounting/ledger";
import type { AccountInfo } from "@/lib/accounting/types";
import type { LedgerEntry } from "@/lib/accounting/ledger";

const ACCOUNTS: AccountInfo[] = [
  { code: "101", name: "صندوق", type: "asset", normalBalance: "debit" },
  { code: "401", name: "فروش", type: "revenue", normalBalance: "credit" },
];

const ENTRIES: LedgerEntry[] = [
  {
    date: "2024-03-21T00:00:00Z",
    description: "سرمایه‌گذاری اولیه",
    lines: [
      { accountCode: "101", debit: 500, credit: 0 },
      { accountCode: "301", debit: 0, credit: 500 },
    ],
  },
  {
    date: "2024-03-22T00:00:00Z",
    description: "خرید نقدی کالا",
    lines: [
      { accountCode: "105", debit: 80, credit: 0 },
      { accountCode: "101", debit: 0, credit: 80 },
    ],
  },
  {
    date: "2024-03-23T00:00:00Z",
    description: "فروش نقدی",
    lines: [
      { accountCode: "101", debit: 20, credit: 0 },
      { accountCode: "401", debit: 0, credit: 20 },
    ],
  },
];

describe("computeLedger", () => {
  it("فقط سندهای مربوط به حساب را شامل می‌شود", () => {
    const r = computeLedger("101", ENTRIES, ACCOUNTS);
    expect(r.rows).toHaveLength(3);
    expect(r.accountName).toBe("صندوق");
  });

  it("مانده‌ی جاری (running balance) صحیح", () => {
    const r = computeLedger("101", ENTRIES, ACCOUNTS);
    expect(r.rows[0].runningBalance).toBe(500);
    expect(r.rows[1].runningBalance).toBe(420);
    expect(r.rows[2].runningBalance).toBe(440);
  });

  it("مانده‌ی پایان و سمت آن", () => {
    const r = computeLedger("101", ENTRIES, ACCOUNTS);
    expect(r.closingBalance).toBe(440);
    expect(r.closingSide).toBe("debit");
  });

  it("ترتیب بر اساس تاریخ", () => {
    const shuffled = [...ENTRIES].reverse();
    const r = computeLedger("101", shuffled, ACCOUNTS);
    expect(r.rows[0].description).toBe("سرمایه‌گذاری اولیه");
    expect(r.rows[2].description).toBe("فروش نقدی");
  });

  it("حساب بدون تراکنش → خالی", () => {
    const r = computeLedger("401", ENTRIES.slice(0, 2), ACCOUNTS);
    expect(r.rows).toHaveLength(0);
    expect(r.closingBalance).toBe(0);
  });
});
