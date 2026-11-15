import { describe, it, expect } from "vitest";
import {
  toJalaali,
  gregorianToJalaali,
  jalaaliToGregorian,
  isLeapJalaaliYear,
  jalaaliMonthLength,
  formatJalali,
  JALALI_MONTHS,
} from "@/lib/format/jalali";

describe("toJalaali — لنگرهای تاریخی شناخته‌شده", () => {
  it("نوروز ۱۴۰۱", () => {
    // 2022-03-21 = 1401-01-01
    expect(toJalaali(new Date(2022, 2, 21))).toEqual({ jy: 1401, jm: 1, jd: 1 });
  });

  it("نوروز ۱۴۰۲", () => {
    expect(toJalaali(new Date(2023, 2, 21))).toEqual({ jy: 1402, jm: 1, jd: 1 });
  });

  it("نوروز ۱۴۰۳", () => {
    // 2024-03-20 = 1403-01-01
    expect(toJalaali(new Date(2024, 2, 20))).toEqual({ jy: 1403, jm: 1, jd: 1 });
  });

  it("نوروز ۱۴۰۴", () => {
    expect(toJalaali(new Date(2025, 2, 21))).toEqual({ jy: 1404, jm: 1, jd: 1 });
  });

  it("اول ژانویه ۲۰۲۴ در دی ۱۴۰۲", () => {
    // 2024-01-01 = 1402-10-11
    expect(toJalaali(new Date(2024, 0, 1))).toEqual({ jy: 1402, jm: 10, jd: 11 });
  });
});

describe("round-trip میلادی ↔ شمسی", () => {
  it("تبدیل رفت و برگشت برای روزهای نمونه در یک بازه‌ی ۱۰ ساله", () => {
    const start = new Date(2018, 0, 1).getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    // هر ۱۹ روز یک نمونه در طول ۱۰ سال (~۱۹۰ نمونه)
    for (let i = 0; i < 190; i++) {
      const d = new Date(start + i * 19 * oneDay);
      const j = toJalaali(d);
      const g = jalaaliToGregorian(j.jy, j.jm, j.jd);
      expect(g.gy).toBe(d.getFullYear());
      expect(g.gm).toBe(d.getMonth() + 1);
      expect(g.gd).toBe(d.getDate());
    }
  });
});

describe("سال‌های کبیسه و طول ماه", () => {
  it("۱۴۰۳ کبیسه است و ۱۴۰۲ نیست", () => {
    expect(isLeapJalaaliYear(1403)).toBe(true);
    expect(isLeapJalaaliYear(1402)).toBe(false);
  });

  it("طول ماه‌ها", () => {
    // ۶ ماه اول ۳۱ روز
    for (let m = 1; m <= 6; m++) {
      expect(jalaaliMonthLength(1403, m)).toBe(31);
    }
    // ماه‌های ۷ تا ۱۱ = ۳۰ روز
    for (let m = 7; m <= 11; m++) {
      expect(jalaaliMonthLength(1403, m)).toBe(30);
    }
    // اسفند کبیسه = ۳۰، غیرکبیسه = ۲۹
    expect(jalaaliMonthLength(1403, 12)).toBe(30); // ۱۴۰۳ کبیسه
    expect(jalaaliMonthLength(1402, 12)).toBe(29); // ۱۴۰۲ غیرکبیسه
  });
});

describe("gregorianToJalaali با اعداد مجزا", () => {
  it("2024-03-20 → 1403-01-01", () => {
    expect(gregorianToJalaali(2024, 3, 20)).toEqual({ jy: 1403, jm: 1, jd: 1 });
  });
});

describe("formatJalali", () => {
  it("قالب کوتاه با ارقام فارسی", () => {
    expect(formatJalali(new Date(2024, 2, 20), "short")).toBe("۱۴۰۳/۰۱/۰۱");
  });

  it("قالب بلند با نام ماه", () => {
    expect(formatJalali(new Date(2024, 2, 20), "long")).toBe("۱ فروردین ۱۴۰۳");
  });

  it("قالب با روز هفته", () => {
    // 2024-03-20 چهارشنبه است (getDay()=3 → JALALI_WEEKDAYS[3]="چهارشنبه")
    expect(formatJalali(new Date(2024, 2, 20), "weekday")).toBe(
      "چهارشنبه ۱ فروردین ۱۴۰۳",
    );
  });

  it("تعداد نام ماه‌ها ۱۲ است", () => {
    expect(JALALI_MONTHS.length).toBe(12);
  });
});
