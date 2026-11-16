// تایپ‌های مشترک موتور تمرین ثبت سند.
// همه‌ی مبالغ به‌صورت عدد صحیح «ریال» هستند.

export interface JournalLineInput {
  accountCode: string;
  debit: number; // ریال
  credit: number; // ریال
}

export interface AccountInfo {
  code: string;
  name: string;
  type: string; // asset | liability | equity | revenue | expense
  normalBalance: string; // debit | credit
}

export interface ValidationResult {
  /** آیا سند کاملاً درست است (ساختار درست + متوازن + مطابق پاسخ مجاز) */
  valid: boolean;
  /** آیا قواعد ساختاری رعایت شده (حداقل ۲ ردیف، تک‌سمتی، حساب‌ها موجود) */
  structuralValid: boolean;
  /** آیا جمع بدهکار = جمع بستانکار */
  balanced: boolean;
  /** آیا با یکی از پاسخ‌های مجاز تطابق دارد */
  matched: boolean;
  /** جمع بدهکار (ریال) */
  totalDebit: number;
  /** جمع بستانکار (ریال) */
  totalCredit: number;
  /** پیام‌های فارسی برای کاربر */
  feedback: string[];
}
