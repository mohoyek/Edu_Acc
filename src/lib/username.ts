// اعتبارسنجی نام کاربری — منطق خالص و قابل تست.
// نام کاربری اختیاری است و فعلاً فقط برای حساب مدیر استفاده می‌شود
// تا ورود با «نام کاربری» به‌جای ایمیل ممکن باشد.

export interface UsernameResult {
  ok: boolean;
  /** نام کاربری پاک‌سازی‌شده یا null (وقتی ورودی خالی است — اختیاری بودن). */
  value: string | null;
  error?: string;
}

const USERNAME_RE = /^[A-Za-z0-9._-]{3,30}$/;
const EDGES_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;

/**
 * نام کاربری را نرمال و اعتبارسنجی می‌کند:
 *  - خالی → معتبر و بی‌مقدار (اختیاری)
 *  - فقط حروف انگلیسی، رقم، نقطه، خط تیره و زیرخط؛ بین ۳ تا ۳۰ کاراکتر
 *  - باید با حرف یا رقم شروع و تمام شود (نه نقطه/خط‌تیره)
 */
export function normalizeUsername(raw: string): UsernameResult {
  const s = (raw ?? "").trim();
  if (s === "") return { ok: true, value: null };

  if (!USERNAME_RE.test(s)) {
    return {
      ok: false,
      value: null,
      error:
        "نام کاربری باید ۳ تا ۳۰ کاراکتر و فقط شامل حروف انگلیسی، رقم، نقطه، خط تیره یا زیرخط باشد",
    };
  }
  if (!EDGES_RE.test(s)) {
    return {
      ok: false,
      value: null,
      error: "نام کاربری باید با حرف یا رقم شروع و تمام شود",
    };
  }
  return { ok: true, value: s };
}
