import { describe, it, expect } from "vitest";
import { computeTrialBalance } from "@/lib/accounting/trial-balance";
import type { AccountInfo } from "@/lib/accounting/types";

const ACCOUNTS: AccountInfo[] = [
  { code: "101", name: "صندوق", type: "asset", normalBalance: "debit" },
  { code: "105", name: "موجودی کالا", type: "asset", normalBalance: "debit" },
  { code: "301", name: "سرمایه", type: "equity", normalBalance: "credit" },
  { code: "401", name: "فروش", type: "revenue", normalBalance: "credit" },
  { code: "503", name: "هزینه اجاره", type: "expense", normalBalance: "debit" },
];

const LINES = [
  { accountCode: "101", debit: 500, credit: 0 },
  { accountCode: "301", debit: 0, credit: 500 },
  { accountCode: "105", debit: 80, credit: 0 },
  { accountCode: "101", debit: 0, credit: 80 },
  { accountCode: "101", debit: 20, credit: 0 },
  { accountCode: "401", debit: 0, credit: 20 },
  { accountCode: "503", debit: 10, credit: 0 },
  { accountCode: "101", debit: 0, credit: 10 },
];

describe("computeTrialBalance — توازن", () => {
  it("جمع بدهکار = جمع بستانکار (تراز متوازن)", () => {
    const r = computeTrialBalance(LINES, ACCOUNTS);
    expect(r.balanced).toBe(true);
    expect(r.totalDebit).toBe(r.totalCredit);
  });

  it("مانده‌های صحیح هر حساب", () => {
    const r = computeTrialBalance(LINES, ACCOUNTS);
    const cash = r.rows.find((x) => x.accountCode === "101")!;
    expect(cash.debitBalance).toBe(430);
    expect(cash.creditBalance).toBe(0);
    const sales = r.rows.find((x) => x.accountCode === "401")!;
    expect(sales.creditBalance).toBe(20);
    const rent = r.rows.find((x) => x.accountCode === "503")!;
    expect(rent.debitBalance).toBe(10);
  });

  it("حساب با مانده صفر نمایش داده نمی‌شود", () => {
    const lines = [
      ...LINES,
      { accountCode: "105", debit: 0, credit: 80 },
    ];
    const r = computeTrialBalance(lines, ACCOUNTS);
    const inventory = r.rows.find((x) => x.accountCode === "105");
    expect(inventory).toBeUndefined();
  });

  it("مجموع کل = مجموع مانده‌ها", () => {
    const r = computeTrialBalance(LINES, ACCOUNTS);
    const sumRows = r.rows.reduce((s, x) => s + x.debitBalance, 0);
    expect(sumRows).toBe(r.totalDebit);
  });
});
