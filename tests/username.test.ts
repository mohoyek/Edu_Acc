import { describe, it, expect } from "vitest";
import { normalizeUsername } from "@/lib/username";

describe("normalizeUsername", () => {
  it("نام کاربری معتبر را برمی‌گرداند", () => {
    expect(normalizeUsername("MoHoYek")).toEqual({ ok: true, value: "MoHoYek" });
    expect(normalizeUsername("mohoyek")).toEqual({ ok: true, value: "mohoyek" });
    expect(normalizeUsername("mo_hoyek-2.ok")).toEqual({
      ok: true,
      value: "mo_hoyek-2.ok",
    });
  });

  it("فاصله‌های ابتدا و انتها را حذف می‌کند", () => {
    expect(normalizeUsername("   MoHoYek   ")).toEqual({ ok: true, value: "MoHoYek" });
  });

  it("ورودی خالی → اختیاری، بی‌مقدار و بدون خطا", () => {
    expect(normalizeUsername("")).toEqual({ ok: true, value: null });
    expect(normalizeUsername("    ")).toEqual({ ok: true, value: null });
    expect(normalizeUsername(undefined as unknown as string)).toEqual({
      ok: true,
      value: null,
    });
  });

  it("طول کمتر از ۳ رد می‌شود", () => {
    const r = normalizeUsername("ab");
    expect(r.ok).toBe(false);
    expect(r.value).toBeNull();
    expect(r.error).toContain("۳ تا ۳۰");
  });

  it("طول بیشتر از ۳۰ رد می‌شود", () => {
    const r = normalizeUsername("a".repeat(31));
    expect(r.ok).toBe(false);
    expect(r.error).toContain("۳ تا ۳۰");
  });

  it("کاراکترهای غیرمجاز رد می‌شوند", () => {
    expect(normalizeUsername("mo ho").ok).toBe(false); // فاصله
    expect(normalizeUsername("mo@ho").ok).toBe(false); // @
    expect(normalizeUsername("کاربر").ok).toBe(false); // حروف فارسی
    expect(normalizeUsername("mo/hoyek").ok).toBe(false); // /
  });

  it("شروع یا پایان با نقطه/خط‌تیره رد می‌شود", () => {
    expect(normalizeUsername(".mohoyek").ok).toBe(false);
    expect(normalizeUsername("mohoyek.").ok).toBe(false);
    expect(normalizeUsername("-mohoyek").ok).toBe(false);
    expect(normalizeUsername("mohoyek-").ok).toBe(false);
  });

  it("حدهای مجاز قبول می‌شوند", () => {
    expect(normalizeUsername("a".repeat(3)).ok).toBe(true);
    expect(normalizeUsername("a".repeat(30)).ok).toBe(true);
    expect(normalizeUsername("a1").ok).toBe(false); // کوتاه‌تر از حد
  });
});
