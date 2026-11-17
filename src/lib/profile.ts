// اعتبارسنجی اطلاعات پروفایل (نام، نام خانوادگی، شماره تماس) — منطق خالص و قابل تست.
// هم در ثبت‌نام و هم در ویرایش پروفایل استفاده می‌شود تا پیام‌های خطا یکسان بمانند.

import { normalizePhone } from "@/lib/phone";
import { toPersianDigits } from "@/lib/format/persian-digits";

export interface ProfileInput {
  firstName: string;
  lastName: string;
  phone: string; // خالی = اختیاری بودن شماره
}

export interface ProfileErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ProfileValidation {
  ok: boolean;
  errors: ProfileErrors;
  /** مقادیر پاک‌سازی‌شده برای ذخیره (فقط وقتی ok === true). */
  values?: { firstName: string; lastName: string; phone: string | null };
}

const MIN_NAME = 2;
const MAX_NAME = 40;

export function validateProfile(input: ProfileInput): ProfileValidation {
  const errors: ProfileErrors = {};

  const firstName = (input.firstName ?? "").trim();
  const lastName = (input.lastName ?? "").trim();

  if (firstName.length < MIN_NAME) {
    errors.firstName = `نام باید حداقل ${toPersianDigits(MIN_NAME)} حرف باشد`;
  } else if (firstName.length > MAX_NAME) {
    errors.firstName = `نام حداکثر ${toPersianDigits(MAX_NAME)} حرف است`;
  }

  if (lastName.length < MIN_NAME) {
    errors.lastName = `نام خانوادگی باید حداقل ${toPersianDigits(MIN_NAME)} حرف باشد`;
  } else if (lastName.length > MAX_NAME) {
    errors.lastName = `نام خانوادگی حداکثر ${toPersianDigits(MAX_NAME)} حرف است`;
  }

  const phone = normalizePhone(input.phone ?? "");
  if (!phone.ok) errors.phone = phone.error;

  const ok = Object.keys(errors).length === 0;
  return {
    ok,
    errors,
    values: ok
      ? { firstName, lastName, phone: phone.value }
      : undefined,
  };
}

/** نام نمایشی استاندارد: «نام نام‌خانوادگی». */
export function displayName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}
