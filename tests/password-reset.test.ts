import { describe, it, expect } from "vitest";
import { generateTempPassword } from "@/lib/password-reset";

describe("generateTempPassword", () => {
  it("طول پیش‌فرض ۸ کاراکتر است", () => {
    expect(generateTempPassword()).toHaveLength(8);
  });

  it("طول خواسته‌شده را رعایت می‌کند (حداقل ۶)", () => {
    expect(generateTempPassword(10)).toHaveLength(10);
    expect(generateTempPassword(3)).toHaveLength(6); // حداقل ۶
  });

  it("حداقل یک حرف و یک رقم دارد", () => {
    for (let i = 0; i < 50; i++) {
      const p = generateTempPassword();
      expect(/[A-Za-z]/.test(p)).toBe(true);
      expect(/[0-9]/.test(p)).toBe(true);
    }
  });

  it("از کاراکترهای گیج‌کننده (0/O/1/l/I) استفاده نمی‌کند", () => {
    const bad = /[0O1lI]/;
    for (let i = 0; i < 100; i++) {
      expect(bad.test(generateTempPassword())).toBe(false);
    }
  });

  it("فقط از مجموعه‌ی مجاز کاراکتر می‌سازد", () => {
    const allowed = /^[A-Za-z2-9]+$/;
    for (let i = 0; i < 100; i++) {
      expect(allowed.test(generateTempPassword(12))).toBe(true);
    }
  });

  it("خروجی‌ها تصادفی و تکراری نیستند", () => {
    const set = new Set<string>();
    for (let i = 0; i < 50; i++) set.add(generateTempPassword());
    // با ۵۰ تولید، احتمال تکرار کامل عملاً صفر است
    expect(set.size).toBeGreaterThan(45);
  });
});
