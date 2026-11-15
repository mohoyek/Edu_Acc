"use client";

import type { ComponentType } from "react";
import AssetLiability from "@content/lessons/asset-and-liability.mdx";
import Equity from "@content/lessons/equity.mdx";
import RevenueExpense from "@content/lessons/revenue-and-expense.mdx";
import AccountingEquation from "@content/lessons/accounting-equation.mdx";
import DebitCredit from "@content/lessons/debit-and-credit.mdx";
import JournalEntry from "@content/lessons/journal-entry.mdx";
import TrialBalance from "@content/lessons/trial-balance.mdx";

// نگاشت contentSlug → کامپوننت MDX (ارجاع‌های ثابت در سطح ماژول)
export const LESSON_COMPONENTS: Record<
  string,
  ComponentType<{ components?: Record<string, unknown> }>
> = {
  "asset-and-liability": AssetLiability,
  equity: Equity,
  "revenue-and-expense": RevenueExpense,
  "accounting-equation": AccountingEquation,
  "debit-and-credit": DebitCredit,
  "journal-entry": JournalEntry,
  "trial-balance": TrialBalance,
};

export function hasLesson(contentSlug: string): boolean {
  return contentSlug in LESSON_COMPONENTS;
}
