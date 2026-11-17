// نرمال‌سازی و اعتبارسنجی شماره تماس ایرانی — منطق خالص و قابل تست.
// شماره‌ی ذخیره‌شده همیشه ۱۱ رقمی و با ۰ شروع می‌شود (مثل 09123456789).

import { toEnglishDigits } from "@/lib/format/persian-digits";

export interface PhoneResult {
  ok: boolean;
  /** شماره‌ی نرمال‌شده یا null (وقتی ورودی خالی است — شماره اختیاری است). */
  value: string | null;
  error?: string;
}

/** حذف جداکننده‌های رایج: فاصله، خط تیره، پرانتز، نقطه. */
function stripSeparators(input: string): string {
  return input.replace(/[\s\-().]/g, "");
}

/**
 * شماره‌ی تلفن را نرمال می‌کند:
 *  - ارقام فارسی/عربی → انگلیسی
 *  - حذف جداکننده‌ها
 *  - +98 / 0098 / 98 → 0
 *  - ۹۸XXXXXXXXX یا 9XXXXXXXXX ده‌رقمی → افزودن ۰ ابتدا
 *  - اعتبارسنجی نهایی: ^0\d{10}$ (موبایل یا ثابت با کد شهر)
 */
export function normalizePhone(raw: string): PhoneResult {
  let s = toEnglishDigits(raw ?? "").trim();
  if (s === "") return { ok: true, value: null };
  s = stripSeparators(s);

  // پیش‌شماره بین‌المللی ایران
  if (s.startsWith("+98")) s = "0" + s.slice(3);
  else if (s.startsWith("0098")) s = "0" + s.slice(4);
  else if (s.startsWith("98") && (s.length === 12 || s.length === 11)) s = "0" + s.slice(2);

  // موبایل بدون صفر اول (9XXXXXXXXX)
  if (/^9\d{9}$/.test(s)) s = "0" + s;

  if (!/^0\d{10}$/.test(s)) {
    return {
      ok: false,
      value: null,
      error: "شماره تماس باید ۱۱ رقم باشد؛ مثل 09123456789 یا 02112345678",
    };
  }
  return { ok: true, value: s };
}
