// محاسبه‌ی صورت سود و زیان ساده — منطق خالص.
// درآمدها (revenue) مانده بستانکار دارند → مبلغ درآمد.
// هزینه‌ها (expense) مانده بدهکار دارند → مبلغ هزینه.
// سود خالص = جمع درآمدها − جمع هزینه‌ها.

import type { TrialBalanceRow } from "./trial-balance";

export interface IncomeStatementResult {
  revenues: { accountCode: string; accountName: string; amount: number }[];
  expenses: { accountCode: string; accountName: string; amount: number }[];
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export function computeIncomeStatement(
  trialRows: TrialBalanceRow[],
): IncomeStatementResult {
  const revenues = trialRows
    .filter((r) => r.type === "revenue" && r.creditBalance > 0)
    .map((r) => ({
      accountCode: r.accountCode,
      accountName: r.accountName,
      amount: r.creditBalance,
    }));
  const expenses = trialRows
    .filter((r) => r.type === "expense" && r.debitBalance > 0)
    .map((r) => ({
      accountCode: r.accountCode,
      accountName: r.accountName,
      amount: r.debitBalance,
    }));

  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expenses.reduce((s, r) => s + r.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  return { revenues, expenses, totalRevenue, totalExpense, netProfit };
}
