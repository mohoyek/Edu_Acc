import { describe, it, expect } from "vitest";
import { normalizePhone } from "@/lib/phone";

describe("normalizePhone", () => {
  it("خالی = اختیاری بودن شماره → موفق با مقدار null", () => {
    expect(normalizePhone("")).toEqual({ ok: true, value: null });
    expect(normalizePhone("   ")).toEqual({ ok: true, value: null });
  });

  it("موبایل استاندارد ۱۱ رقمی را همان‌طور نگه می‌دارد", () => {
    expect(normalizePhone("09123456789")).toEqual({ ok: true, value: "09123456789" });
  });

  it("ارقام فارسی را به انگلیسی تبدیل می‌کند", () => {
    expect(normalizePhone("۰۹۱۲۳۴۵۶۷۸۹")).toEqual({ ok: true, value: "09123456789" });
  });

  it("جداکننده‌ها را حذف می‌کند", () => {
    expect(normalizePhone("0912 345 6789")).toEqual({ ok: true, value: "09123456789" });
    expect(normalizePhone("0912-345-6789")).toEqual({ ok: true, value: "09123456789" });
    expect(normalizePhone("(0912) 3456789")).toEqual({ ok: true, value: "09123456789" });
  });

  it("پیش‌شماره بین‌المللی +98 و 0098 و 98 را به ۰ تبدیل می‌کند", () => {
    expect(normalizePhone("+989123456789")).toEqual({ ok: true, value: "09123456789" });
    expect(normalizePhone("00989123456789")).toEqual({ ok: true, value: "09123456789" });
    expect(normalizePhone("989123456789")).toEqual({ ok: true, value: "09123456789" });
  });

  it("موبایل بدون صفر اول (۱۰ رقم) را با ۰ کامل می‌کند", () => {
    expect(normalizePhone("9123456789")).toEqual({ ok: true, value: "09123456789" });
    expect(normalizePhone("۹۱۲۳۴۵۶۷۸۹")).toEqual({ ok: true, value: "09123456789" });
  });

  it("شماره ثابت با کد شهر را می‌پذیرد", () => {
    expect(normalizePhone("02112345678")).toEqual({ ok: true, value: "02112345678" });
  });

  it("شماره‌های کوتاه/طولانی نامعتبر را رد می‌کند", () => {
    expect(normalizePhone("0912345").ok).toBe(false);
    expect(normalizePhone("09123456789012").ok).toBe(false);
    expect(normalizePhone("12345").ok).toBe(false);
    expect(normalizePhone("abc").ok).toBe(false);
  });

  it("پیام خطای فارسی دارد", () => {
    const r = normalizePhone("123");
    expect(r.ok).toBe(false);
    expect(r.error).toContain("۱۱ رقم");
  });
});
