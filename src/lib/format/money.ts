// قالب‌بندی مبلغ.
// قرارداد: مبلغ همیشه به‌صورت عدد صحیح «ریال» در دیتابیس و منطق ذخیره می‌شود.
// نمایش می‌تواند به ریال یا تومان باشد (۱ تومان = ۱۰ ریال).

import { toPersianDigits } from "./persian-digits";

export type Currency = "rial" | "toman";

export interface MoneyOptions {
  currency?: Currency;
  withUnit?: boolean;
}

/** مبلغ به ریال را به رشته‌ی فارسی با جداکننده‌ی هزارگان تبدیل می‌کند. */
export function formatMoney(rials: number, opts: MoneyOptions = {}): string {
  const currency = opts.currency ?? "toman";
  const value = currency === "toman" ? Math.round(rials / 10) : Math.round(rials);
  const grouped = Math.abs(value).toLocaleString("en-US");
  const sign = value < 0 ? "-" : "";
  const fa = toPersianDigits(sign + grouped);
  if (opts.withUnit) {
    const unit = currency === "toman" ? "تومان" : "ریال";
    return `${fa} ${unit}`;
  }
  return fa;
}

/** مبلغ به ریال را به تومان برمی‌گرداند (عدد صحیح، گردش به نزدیک‌ترین). */
export function rialsToToman(rials: number): number {
  return Math.round(rials / 10);
}

/** تومان را به ریال تبدیل می‌کند. */
export function tomanToRials(toman: number): number {
  return Math.round(toman * 10);
}

/** جداکننده‌ی هزارگان را حذف می‌کند و عدد صحیح برمی‌گرداند (ریال فرض می‌شود). */
export function parseMoney(input: string): number | null {
  const cleaned = input
    .replace(/[,_\s٬]/g, "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  if (cleaned === "" || !/^-?\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}
