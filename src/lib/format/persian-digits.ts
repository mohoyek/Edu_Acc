// تبدیل اعداد لاتین/فارسی
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** عدد یا رشته‌ی انگلیسی‌رقم را به فارسی تبدیل می‌کند (فقط ارقام، بقیه کاراکترها دست‌نخورده). */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** ارقام فارسی/عربی را به انگلیسی تبدیل می‌کند. */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** فقط عدد صحیح فارسی می‌سازد یا null اگر ورودی معتبر نباشد. */
export function parsePersianInt(input: string): number | null {
  const en = toEnglishDigits(input).replace(/[,_\s]/g, "");
  if (en === "" || !/^-?\d+$/.test(en)) return null;
  return Number(en);
}
