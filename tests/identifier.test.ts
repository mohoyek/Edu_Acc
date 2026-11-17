import { describe, it, expect } from "vitest";
import { parseIdentifier } from "@/lib/identifier";

describe("parseIdentifier — شماره تماس", () => {
  it("موبایل استاندارد را می‌پذیرد", () => {
    const r = parseIdentifier("09123456789");
    expect(r).toEqual({ ok: true, kind: "phone", value: "09123456789" });
  });

  it("موبایل بدون صفر اول را نرمال می‌کند", () => {
    expect(parseIdentifier("9123456789")).toEqual({
      ok: true,
      kind: "phone",
      value: "09123456789",
    });
  });

  it("پیش‌شماره بین‌المللی را نرمال می‌کند", () => {
    expect(parseIdentifier("+989123456789")).toEqual({
      ok: true,
      kind: "phone",
      value: "09123456789",
    });
    expect(parseIdentifier("00989123456789")).toEqual({
      ok: true,
      kind: "phone",
      value: "09123456789",
    });
  });

  it("ارقام فارسی و جداکننده‌ها را هندل می‌کند", () => {
    expect(parseIdentifier("۰۹۱۲-۳۴۵-۶۷۸۹")).toEqual({
      ok: true,
      kind: "phone",
      value: "09123456789",
    });
  });

  it("عدد کوتاه‌تر از شماره معتبر رد می‌شود", () => {
    const r = parseIdentifier("12345");
    expect(r.ok).toBe(false);
    expect(r.error).toContain("09123456789");
  });
});

describe("parseIdentifier — نام کاربری", () => {
  it("نام کاربری استاندارد را می‌پذیرد", () => {
    expect(parseIdentifier("MoHoYek")).toEqual({
      ok: true,
      kind: "username",
      value: "MoHoYek",
    });
    expect(parseIdentifier(" mo_hoyek-2 ")).toEqual({
      ok: true,
      kind: "username",
      value: "mo_hoyek-2",
    });
  });

  it("حاوی @ (ایمیل) را به‌عنوان نام کاربری رد می‌کند", () => {
    // ایمیل در ثبت‌نام پذیرفته نمی‌شود؛ باید ساختار نام کاربری داشته باشد
    const r = parseIdentifier("user@example.com");
    expect(r.ok).toBe(false);
  });

  it("کاراکترهای نامعتبر را رد می‌کند", () => {
    expect(parseIdentifier("mo ho!").ok).toBe(false);
    expect(parseIdentifier("ab").ok).toBe(false); // خیلی کوتاه
  });
});

describe("parseIdentifier — موارد عمومی", () => {
  it("ورودی خالی رد می‌شود", () => {
    const r = parseIdentifier("   ");
    expect(r.ok).toBe(false);
    expect(r.error).toContain("وارد کنید");
  });
});
