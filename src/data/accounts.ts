// فهرست حساب‌های استاندارد اولیه (seed)
// type: asset (دارایی) | liability (بدهی) | equity (سرمایه) | revenue (درآمد) | expense (هزینه)
// normalBalance: debit (بدهکار) | credit (بستانکار) — ماهیت حساب

export type AccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense";

export type NormalBalance = "debit" | "credit";

export interface AccountSeed {
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
}

export const ACCOUNTS: AccountSeed[] = [
  // دارایی‌ها
  { code: "101", name: "صندوق", type: "asset", normalBalance: "debit" },
  { code: "102", name: "بانک", type: "asset", normalBalance: "debit" },
  {
    code: "103",
    name: "حساب‌های دریافتنی",
    type: "asset",
    normalBalance: "debit",
  },
  {
    code: "104",
    name: "اسناد دریافتنی",
    type: "asset",
    normalBalance: "debit",
  },
  { code: "105", name: "موجودی کالا", type: "asset", normalBalance: "debit" },
  { code: "106", name: "تجهیزات", type: "asset", normalBalance: "debit" },
  // بدهی‌ها
  {
    code: "201",
    name: "حساب‌های پرداختنی",
    type: "liability",
    normalBalance: "credit",
  },
  {
    code: "202",
    name: "اسناد پرداختنی",
    type: "liability",
    normalBalance: "credit",
  },
  // سرمایه
  { code: "301", name: "سرمایه", type: "equity", normalBalance: "credit" },
  // درآمد
  { code: "401", name: "فروش", type: "revenue", normalBalance: "credit" },
  // هزینه‌ها
  { code: "501", name: "خرید", type: "expense", normalBalance: "debit" },
  {
    code: "502",
    name: "هزینه حقوق",
    type: "expense",
    normalBalance: "debit",
  },
  {
    code: "503",
    name: "هزینه اجاره",
    type: "expense",
    normalBalance: "debit",
  },
  { code: "504", name: "هزینه حمل", type: "expense", normalBalance: "debit" },
];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: "دارایی",
  liability: "بدهی",
  equity: "سرمایه",
  revenue: "درآمد",
  expense: "هزینه",
};

export const NORMAL_BALANCE_LABELS: Record<NormalBalance, string> = {
  debit: "بدهکار",
  credit: "بستانکار",
};
