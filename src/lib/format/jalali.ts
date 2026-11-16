// تبدیل بین تقویم میلادی (Gregorian) و شمسی (Jalali).
// از کتابخانه‌ی معتبر jalaali-js (الگوریتم Birashk/نجومی، مطابق تقویم رسمی ایران) استفاده می‌کنیم
// و لایه‌ی نمایش فارسی (نام ماه، روز هفته، ارقام فارسی) را روی آن می‌نویسیم.
// مجوز jalaali-js: MIT — https://github.com/jalaali/jalaali-js

import {
  toJalaali as jToJalaali,
  toGregorian as jToGregorian,
  isLeapJalaaliYear as jIsLeap,
  jalaaliMonthLength as jMonthLength,
} from "jalaali-js";
import { toPersianDigits } from "./persian-digits";

export interface JalaaliDate {
  jy: number; // سال شمسی
  jm: number; // ماه (۱..۱۲)
  jd: number; // روز (۱..۳۱)
}

export interface GregorianDate {
  gy: number;
  gm: number; // ۱..۱۲
  gd: number; // ۱..۳۱
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

// getDay() در جاوااسکریپت: ۰=یکشنبه … ۶=شنبه
export const JALALI_WEEKDAYS = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
] as const;

/** تاریخ میلادی (Date) را به شمسی تبدیل می‌کند. */
export function toJalaali(date: Date): JalaaliDate {
  return jToJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ) as JalaaliDate;
}

/** (gy, gm, gd) میلادی را به شمسی تبدیل می‌کند. */
export function gregorianToJalaali(
  gy: number,
  gm: number,
  gd: number,
): JalaaliDate {
  return jToJalaali(gy, gm, gd) as JalaaliDate;
}

/** (jy, jm, jd) شمسی را به میلادی تبدیل می‌کند. */
export function jalaaliToGregorian(
  jy: number,
  jm: number,
  jd: number,
): GregorianDate {
  return jToGregorian(jy, jm, jd) as GregorianDate;
}

/** آیا سال شمسی کبیسه است؟ */
export function isLeapJalaaliYear(jy: number): boolean {
  return jIsLeap(jy);
}

/** طول ماه شمسی. */
export function jalaaliMonthLength(jy: number, jm: number): number {
  return jMonthLength(jy, jm);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export type JalaliFormat = "short" | "long" | "weekday";

/** تاریخ میلادی را به رشته‌ی شمسی فارسی تبدیل می‌کند.
 *  - short: ۱۴۰۳/۰۱/۰۱
 *  - long: ۱ فروردین ۱۴۰۳
 *  - weekday: چهارشنبه ۱ فروردین ۱۴۰۳
 */
export function formatJalali(date: Date, format: JalaliFormat = "short"): string {
  const { jy, jm, jd } = toJalaali(date);
  const fa = toPersianDigits(`${pad2(jy)}/${pad2(jm)}/${pad2(jd)}`);
  if (format === "short") return fa;
  const long = `${toPersianDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
  if (format === "long") return long;
  const wd = JALALI_WEEKDAYS[date.getDay()];
  return `${wd} ${long}`;
}
