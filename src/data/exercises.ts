// ۸ تمرین ثبت سند از ساده تا متوسط.
// همه‌ی مبالغ به‌صورت عدد صحیح «ریال» (ضرایب ۱۰، تا در تومان عدد تمیز بدهند).
// هر تمرین می‌تواند چند پاسخ مجاز داشته باشد (allowedAnswers آرایه‌ای از پاسخ‌هاست).

import type { JournalLineInput } from "@/lib/accounting/types";

export interface ExerciseSeed {
  slug: string;
  lessonSlug?: string;
  title: string;
  storyText: string;
  allowedAnswers: JournalLineInput[][];
  hint: string;
  solution: JournalLineInput[]; // پاسخ نمونه برای «نمایش پاسخ»
}

export const EXERCISES: ExerciseSeed[] = [
  {
    slug: "initial-investment",
    lessonSlug: "equity",
    title: "سرمایه‌گذاری اولیه",
    storyText:
      "علی تصمیم گرفت کافه‌اش را باز کند. او ۵۰ میلیون تومان پول نقد از جیب خودش در صندوق کافه می‌گذارد تا سرمایه‌ی اولیه باشد. این سند را ثبت کن.",
    allowedAnswers: [
      [
        { accountCode: "101", debit: 500_000_000, credit: 0 },
        { accountCode: "301", debit: 0, credit: 500_000_000 },
      ],
    ],
    hint: "صندوق (دارایی) زیاد شده → بدهکار. سرمایه زیاد شده → بستانکار.",
    solution: [
      { accountCode: "101", debit: 500_000_000, credit: 0 },
      { accountCode: "301", debit: 0, credit: 500_000_000 },
    ],
  },
  {
    slug: "buy-inventory-cash",
    lessonSlug: "journal-entry",
    title: "خرید نقدی کالا",
    storyText:
      "کافه‌ی علی ۸ میلیون تومان دانه‌ی قهوه خرید و مبلغ را نقدی از صندوق پرداخت کرد. سند این اتفاق را ثبت کن.",
    allowedAnswers: [
      [
        { accountCode: "105", debit: 80_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 80_000_000 },
      ],
    ],
    hint: "موجودی کالا (دارایی) زیاد شده → بدهکار. صندوق (دارایی) کم شده → بستانکار.",
    solution: [
      { accountCode: "105", debit: 80_000_000, credit: 0 },
      { accountCode: "101", debit: 0, credit: 80_000_000 },
    ],
  },
  {
    slug: "cash-sale",
    lessonSlug: "journal-entry",
    title: "فروش نقدی",
    storyText:
      "علی در یک روز ۲ میلیون تومان قهوه فروخت و همه‌ی مبلغ را نقد گرفت. سند فروش را ثبت کن.",
    allowedAnswers: [
      [
        { accountCode: "101", debit: 20_000_000, credit: 0 },
        { accountCode: "401", debit: 0, credit: 20_000_000 },
      ],
    ],
    hint: "صندوق (دارایی) زیاد شده → بدهکار. فروش (درآمد) زیاد شده → بستانکار.",
    solution: [
      { accountCode: "101", debit: 20_000_000, credit: 0 },
      { accountCode: "401", debit: 0, credit: 20_000_000 },
    ],
  },
  {
    slug: "pay-rent",
    lessonSlug: "revenue-and-expense",
    title: "پرداخت اجاره",
    storyText:
      "علی ۲ میلیون تومان اجاره‌ی مغازه را پرداخت کرد. مبلغ را از صندوق یا حساب بانکی پرداخت کرده است (هر دو قابل‌قبول). سند را ثبت کن.",
    allowedAnswers: [
      [
        { accountCode: "503", debit: 20_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 20_000_000 },
      ],
      [
        { accountCode: "503", debit: 20_000_000, credit: 0 },
        { accountCode: "102", debit: 0, credit: 20_000_000 },
      ],
    ],
    hint: "هزینه اجاره (هزینه) زیاد شده → بدهکار. صندوق یا بانک (دارایی) کم شده → بستانکار.",
    solution: [
      { accountCode: "503", debit: 20_000_000, credit: 0 },
      { accountCode: "101", debit: 0, credit: 20_000_000 },
    ],
  },
  {
    slug: "buy-equipment-note",
    lessonSlug: "asset-and-liability",
    title: "خرید تجهیزات با چک",
    storyText:
      "علی یک دستگاه اسپرسوساز ۲۰ میلیون تومانی خرید و بهای آن را با یک چک (سند پرداختنی) پرداخت کرد. سند را ثبت کن.",
    allowedAnswers: [
      [
        { accountCode: "106", debit: 200_000_000, credit: 0 },
        { accountCode: "202", debit: 0, credit: 200_000_000 },
      ],
    ],
    hint: "تجهیزات (دارایی) زیاد شده → بدهکار. اسناد پرداختنی (بدهی) ایجاد شده → بستانکار.",
    solution: [
      { accountCode: "106", debit: 200_000_000, credit: 0 },
      { accountCode: "202", debit: 0, credit: 200_000_000 },
    ],
  },
  {
    slug: "credit-sale",
    lessonSlug: "journal-entry",
    title: "فروش نسیه",
    storyText:
      "علی ۵ میلیون تومان قهوه به یک شرکت فروخت و توافق کردند که مبلغ را هفته‌ی بعد بپردازند (نسیه). سند را ثبت کن.",
    allowedAnswers: [
      [
        { accountCode: "103", debit: 50_000_000, credit: 0 },
        { accountCode: "401", debit: 0, credit: 50_000_000 },
      ],
    ],
    hint: "چون پول نقد نگرفته، حساب‌های دریافتنی (دارایی) زیاد شده → بدهکار. فروش (درآمد) → بستانکار.",
    solution: [
      { accountCode: "103", debit: 50_000_000, credit: 0 },
      { accountCode: "401", debit: 0, credit: 50_000_000 },
    ],
  },
  {
    slug: "collect-receivable",
    lessonSlug: "journal-entry",
    title: "وصول مطالبات",
    storyText:
      "علی ۵ میلیون تومان از طلبِ مشتریِ هفته‌ی قبل را وصول کرد. مبلغ را به صندوق یا حساب بانکی دریافت کرده است (هر دو قابل‌قبول). سند را ثبت کن.",
    allowedAnswers: [
      [
        { accountCode: "101", debit: 50_000_000, credit: 0 },
        { accountCode: "103", debit: 0, credit: 50_000_000 },
      ],
      [
        { accountCode: "102", debit: 50_000_000, credit: 0 },
        { accountCode: "103", debit: 0, credit: 50_000_000 },
      ],
    ],
    hint: "صندوق یا بانک (دارایی) زیاد شده → بدهکار. حساب‌های دریافتنی (دارایی) کم شده → بستانکار.",
    solution: [
      { accountCode: "101", debit: 50_000_000, credit: 0 },
      { accountCode: "103", debit: 0, credit: 50_000_000 },
    ],
  },
  {
    slug: "buy-inventory-with-freight",
    lessonSlug: "journal-entry",
    title: "خرید کالا با هزینه‌ی حمل",
    storyText:
      "علی ۸ میلیون تومان دانه‌ی قهوه خرید و ۵۰۰ هزار تومان هم هزینه‌ی حمل آن را پرداخت. همه‌ی مبلغ را نقدی از صندوق داد. سند این اتفاق مرکب را ثبت کن (سه ردیف).",
    allowedAnswers: [
      [
        { accountCode: "105", debit: 80_000_000, credit: 0 },
        { accountCode: "504", debit: 5_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 85_000_000 },
      ],
    ],
    hint: "موجودی کالا (دارایی) و هزینه‌ی حمل (هزینه) هر دو بدهکار می‌شوند. صندوق به اندازه‌ی مجموع (۸٬۵۰۰٬۰۰۰ تومان) بستانکار می‌شود.",
    solution: [
      { accountCode: "105", debit: 80_000_000, credit: 0 },
      { accountCode: "504", debit: 5_000_000, credit: 0 },
      { accountCode: "101", debit: 0, credit: 85_000_000 },
    ],
  },
];
