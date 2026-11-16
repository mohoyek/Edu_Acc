import { describe, it, expect } from "vitest";
import {
  formatMoney,
  rialsToToman,
  tomanToRials,
  parseMoney,
} from "@/lib/format/money";

describe("formatMoney", () => {
  it("ریال را به تومان با جداکننده‌ی هزارگان و ارقام فارسی نمایش می‌دهد", () => {
    // 100,000 ریال = 10,000 تومان
    expect(formatMoney(100000)).toBe("۱۰,۰۰۰");
  });

  it("نمایش به ریال", () => {
    expect(formatMoney(100000, { currency: "rial" })).toBe("۱۰۰,۰۰۰");
  });

  it("نمایش با واحد", () => {
    expect(formatMoney(100000, { currency: "toman", withUnit: true })).toBe(
      "۱۰,۰۰۰ تومان",
    );
    expect(formatMoney(100000, { currency: "rial", withUnit: true })).toBe(
      "۱۰۰,۰۰۰ ریال",
    );
  });

  it("مبلغ صفر", () => {
    expect(formatMoney(0)).toBe("۰");
  });

  it("گردش به نزدیک‌ترین در تبدیل ریال به تومان", () => {
    // ۱۰۰,۰۰۵ ریال → ۱۰,۰۰۰.۵ تومان → گردش به ۱۰,۰۰۱ (نزدیک‌ترین)
    // note: 100005/10 = 10000.5 → round → 10001
    expect(formatMoney(100005)).toBe("۱۰,۰۰۱");
  });
});

describe("تبدیل ریال/تومان", () => {
  it("rialsToToman", () => {
    expect(rialsToToman(100000)).toBe(10000);
    expect(rialsToToman(0)).toBe(0);
  });

  it("tomanToRials", () => {
    expect(tomanToRials(10000)).toBe(100000);
    expect(tomanToRials(0)).toBe(0);
  });

  it("round-trip", () => {
    expect(tomanToRials(rialsToToman(99990))).toBe(99990);
  });
});

describe("parseMoney", () => {
  it("رشته‌ی فارسی با جداکننده را تجزیه می‌کند", () => {
    expect(parseMoney("۱۰,۰۰۰")).toBe(10000);
    expect(parseMoney("۱۰۰,۰۰۰")).toBe(100000);
  });

  it("رشته‌ی انگلیسی", () => {
    expect(parseMoney("100000")).toBe(100000);
  });

  it("ورودی نامعتبر null", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
  });
});
