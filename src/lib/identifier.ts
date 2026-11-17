// تشخیص نوع شناسه‌ی ثبت‌نام/ورود — منطق خالص و قابل تست.
// کاربر با «شماره تماس» یا «نام کاربری» ثبت‌نام می‌کند (ایمیل اختیاری و خارج از ثبت‌نام است).
// قاعده: اگر ورودی فقط رقم/+/جداکننده‌های رایج باشد → مسیر شماره تماس؛ وگرنه → مسیر نام کاربری.

import { toEnglishDigits } from "@/lib/format/persian-digits";
import { normalizePhone } from "@/lib/phone";
import { normalizeUsername } from "@/lib/username";

export type IdentifierKind = "phone" | "username";

export interface IdentifierResult {
  ok: boolean;
  kind: IdentifierKind | null;
  /** شماره‌ی نرمال‌شده (kind=phone) یا نام کاربری پاک‌سازی‌شده (kind=username). */
  value: string | null;
  error?: string;
}

/** ورودی را به شماره تماس یا نام کاربری معتبر تبدیل می‌کند؛ در غیر این صورت خطا می‌دهد. */
export function parseIdentifier(raw: string): IdentifierResult {
  const s = toEnglishDigits(raw ?? "").trim();
  if (s === "") {
    return {
      ok: false,
      kind: null,
      value: null,
      error: "شماره تماس یا نام کاربری را وارد کنید",
    };
  }

  // ورودی عددی (مثل 09123456789 یا +989123456789) → حتماً باید شماره تماس معتبر باشد
  const compact = s.replace(/[\s\-().]/g, "");
  if (/^[0-9+]+$/.test(compact)) {
    const p = normalizePhone(s);
    if (p.ok && p.value) {
      return { ok: true, kind: "phone", value: p.value };
    }
    return {
      ok: false,
      kind: null,
      value: null,
      error:
        p.error ??
        "شماره تماس معتبر نیست؛ مثل 09123456789 — یا از نام کاربری با حروف انگلیسی استفاده کن",
    };
  }

  // ورودی متنی → نام کاربری
  const u = normalizeUsername(s);
  if (u.ok && u.value) {
    return { ok: true, kind: "username", value: u.value };
  }
  return {
    ok: false,
    kind: null,
    value: null,
    error: u.error ?? "نام کاربری معتبر نیست",
  };
}
