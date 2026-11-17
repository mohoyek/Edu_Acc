// تولید رمز عبور موقت برای جریان «فراموشی رمز».
// منطق خالص — از Web Crypto (getRandomValues) استفاده می‌کند تا در Node و مرورگر کار کند.

// حروف و ارقام بدون کاراکترهای گیج‌کننده (0/O، 1/l/I و ...).
const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const LETTERS = CHARSET.slice(0, CHARSET.length - 8); // همه به‌جز ارقام
const DIGITS = "23456789";

function secureRandomInt(max: number): number {
  // برای max <= 256 یک بایت کافی است و بایاس انتخاب ناچیز است.
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] % max;
}

/**
 * رمز موقت با طول مشخص می‌سازد؛ تضمین می‌کند حداقل یک حرف و یک رقم داشته باشد.
 * طول پیش‌فرض ۸ کاراکتر است — برای گفتن تلفنی راحت است.
 */
export function generateTempPassword(length = 8): string {
  if (length < 6) length = 6;
  const chars: string[] = [];

  // تضمین ترکیب: حداقل یک حرف و یک رقم
  chars.push(LETTERS[secureRandomInt(LETTERS.length)]);
  chars.push(DIGITS[secureRandomInt(DIGITS.length)]);
  while (chars.length < length) {
    chars.push(CHARSET[secureRandomInt(CHARSET.length)]);
  }

  // جای‌گذاری تصادفی (Fisher–Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
