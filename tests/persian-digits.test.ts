import { describe, it, expect } from "vitest";
import {
  toPersianDigits,
  toEnglishDigits,
  parsePersianInt,
} from "@/lib/format/persian-digits";

describe("toPersianDigits", () => {
  it("اعداد انگلیسی را به فارسی تبدیل می‌کند", () => {
    expect(toPersianDigits(123)).toBe("۱۲۳");
    expect(toPersianDigits(0)).toBe("۰");
    expect(toPersianDigits(9876543210)).toBe("۹۸۷۶۵۴۳۲۱۰");
  });

  it("رشته‌ها را فقط در ارقام تغییر می‌دهد", () => {
    expect(toPersianDigits("1,234")).toBe("۱,۲۳۴");
    expect(toPersianDigits("سود 5000 تومان")).toBe("سود ۵۰۰۰ تومان");
  });
});

describe("toEnglishDigits", () => {
  it("ارقام فارسی را به انگلیسی برمی‌گرداند", () => {
    expect(toEnglishDigits("۱۲۳")).toBe("123");
    expect(toEnglishDigits("۱۰,۰۰۰")).toBe("10,000");
  });

  it("ارقام عربی را هم پشتیبانی می‌کند", () => {
    expect(toEnglishDigits("١٢٣")).toBe("123");
  });
});

describe("parsePersianInt", () => {
  it("عدد فارسی با جداکننده را تجزیه می‌کند", () => {
    expect(parsePersianInt("۱,۲۳۴")).toBe(1234);
    expect(parsePersianInt("۵۰۰۰")).toBe(5000);
  });

  it("ورودی نامعتبر null برمی‌گرداند", () => {
    expect(parsePersianInt("")).toBeNull();
    expect(parsePersianInt("abc")).toBeNull();
    expect(parsePersianInt("۱۲.۵")).toBeNull();
  });
});
