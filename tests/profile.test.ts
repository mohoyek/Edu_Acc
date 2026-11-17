import { describe, it, expect } from "vitest";
import { validateProfile, displayName, isProfileComplete } from "@/lib/profile";

describe("validateProfile", () => {
  it("پروفایل معتبر را می‌پذیرد و مقادیر را پاک می‌کند", () => {
    const r = validateProfile({ firstName: "  علی ", lastName: " رضایی ", phone: "" });
    expect(r.ok).toBe(true);
    expect(r.values).toEqual({ firstName: "علی", lastName: "رضایی", phone: null });
  });

  it("نام خیلی کوتاه را رد می‌کند", () => {
    const r = validateProfile({ firstName: "ا", lastName: "رضایی", phone: "" });
    expect(r.ok).toBe(false);
    expect(r.errors.firstName).toContain("حداقل ۲ حرف");
  });

  it("نام خانوادگی خالی را رد می‌کند", () => {
    const r = validateProfile({ firstName: "علی", lastName: "  ", phone: "" });
    expect(r.ok).toBe(false);
    expect(r.errors.lastName).toContain("حداقل ۲ حرف");
  });

  it("نام طولانی‌تر از ۴۰ حرف را رد می‌کند", () => {
    const r = validateProfile({ firstName: "ا".repeat(41), lastName: "رضایی", phone: "" });
    expect(r.ok).toBe(false);
    expect(r.errors.firstName).toContain("حداکثر ۴۰");
  });

  it("شماره تماس نامعتبر را رد می‌کند", () => {
    const r = validateProfile({ firstName: "علی", lastName: "رضایی", phone: "123" });
    expect(r.ok).toBe(false);
    expect(r.errors.phone).toContain("۱۱ رقم");
  });

  it("شماره تماس معتبر فارسی‌رقم را نرمال می‌کند", () => {
    const r = validateProfile({ firstName: "علی", lastName: "رضایی", phone: "۰۹۱۲۳۴۵۶۷۸۹" });
    expect(r.ok).toBe(true);
    expect(r.values?.phone).toBe("09123456789");
  });

  it("همه‌ی خطاها هم‌زمان جمع می‌شوند", () => {
    const r = validateProfile({ firstName: "", lastName: "", phone: "bad" });
    expect(r.ok).toBe(false);
    expect(r.errors.firstName).toBeDefined();
    expect(r.errors.lastName).toBeDefined();
    expect(r.errors.phone).toBeDefined();
  });
});

describe("displayName", () => {
  it("نام نمایشی را با فاصله می‌سازد", () => {
    expect(displayName("علی", "رضایی")).toBe("علی رضایی");
  });

  it("فاصله‌های اضافی را حذف می‌کند", () => {
    expect(displayName(" علی ", " رضایی ")).toBe("علی رضایی");
  });
});

describe("isProfileComplete", () => {
  it("پروفایل کامل (نام + نام خانوادگی + تلفن) → true", () => {
    expect(
      isProfileComplete({ firstName: "علی", lastName: "رضایی", phone: "09123456789" }),
    ).toBe(true);
  });

  it("بدون تلفن ناقص است (تلفن برای حل تمرین اجباری است)", () => {
    expect(isProfileComplete({ firstName: "علی", lastName: "رضایی", phone: null })).toBe(false);
    expect(isProfileComplete({ firstName: "علی", lastName: "رضایی", phone: "" })).toBe(false);
  });

  it("بدون نام یا نام خانوادگی ناقص است", () => {
    expect(isProfileComplete({ firstName: null, lastName: "رضایی", phone: "09123456789" })).toBe(false);
    expect(isProfileComplete({ firstName: "علی", lastName: null, phone: "09123456789" })).toBe(false);
    expect(isProfileComplete({ firstName: " ", lastName: "رضایی", phone: "09123456789" })).toBe(false);
  });

  it("فیلدهای undefined هم ناقص محسوب می‌شوند", () => {
    expect(isProfileComplete({})).toBe(false);
  });
});
