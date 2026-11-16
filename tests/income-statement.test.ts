import { describe, it, expect } from "vitest";
import { computeIncomeStatement } from "@/lib/accounting/income-statement";
import type { TrialBalanceRow } from "@/lib/accounting/trial-balance";

const ROWS: TrialBalanceRow[] = [
  { accountCode: "101", accountName: "صندوق", type: "asset", debitBalance: 430, creditBalance: 0 },
  { accountCode: "105", accountName: "موجودی کالا", type: "asset", debitBalance: 80, creditBalance: 0 },
  { accountCode: "301", accountName: "سرمایه", type: "equity", debitBalance: 0, creditBalance: 500 },
  { accountCode: "401", accountName: "فروش", type: "revenue", debitBalance: 0, creditBalance: 120 },
  { accountCode: "502", accountName: "هزینه حقوق", type: "expense", debitBalance: 30, creditBalance: 0 },
  { accountCode: "503", accountName: "هزینه اجاره", type: "expense", debitBalance: 10, creditBalance: 0 },
];

describe("computeIncomeStatement", () => {
  it("جمع درآمدها و هزینه‌ها و سود خالص", () => {
    const r = computeIncomeStatement(ROWS);
    expect(r.totalRevenue).toBe(120);
    expect(r.totalExpense).toBe(40);
    expect(r.netProfit).toBe(80);
  });

  it("فقط حساب‌های درآمد در revenues", () => {
    const r = computeIncomeStatement(ROWS);
    expect(r.revenues).toHaveLength(1);
    expect(r.revenues[0].accountCode).toBe("401");
  });

  it("فقط حساب‌های هزینه در expenses", () => {
    const r = computeIncomeStatement(ROWS);
    expect(r.expenses).toHaveLength(2);
    const codes = r.expenses.map((e) => e.accountCode).sort();
    expect(codes).toEqual(["502", "503"]);
  });

  it("زیان وقتی هزینه > درآمد", () => {
    const r = computeIncomeStatement([
      { accountCode: "401", accountName: "فروش", type: "revenue", debitBalance: 0, creditBalance: 50 },
      { accountCode: "503", accountName: "هزینه اجاره", type: "expense", debitBalance: 80, creditBalance: 0 },
    ]);
    expect(r.netProfit).toBe(-30);
  });
});
