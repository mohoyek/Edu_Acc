import { describe, it, expect } from "vitest";
import { validateEntry } from "@/lib/accounting/validate-entry";
import type { AccountInfo, JournalLineInput } from "@/lib/accounting/types";

const ACCOUNTS: AccountInfo[] = [
  { code: "101", name: "صندوق", type: "asset", normalBalance: "debit" },
  { code: "102", name: "بانک", type: "asset", normalBalance: "debit" },
  { code: "105", name: "موجودی کالا", type: "asset", normalBalance: "debit" },
  { code: "401", name: "فروش", type: "revenue", normalBalance: "credit" },
  { code: "503", name: "هزینه اجاره", type: "expense", normalBalance: "debit" },
];

// خرید نقدی کالا: موجودی کالا بدهکار، صندوق بستانکار (۸۰٬۰۰۰٬۰۰۰ ریال = ۸ میلیون تومان)
const BUY_INVENTORY_ANSWER: JournalLineInput[] = [
  { accountCode: "105", debit: 80_000_000, credit: 0 },
  { accountCode: "101", debit: 0, credit: 80_000_000 },
];

describe("validateEntry — سند درست", () => {
  it("سند ساده دو ردیفی مطابق پاسخ → valid", () => {
    const r = validateEntry(
      [
        { accountCode: "105", debit: 80_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 80_000_000 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.valid).toBe(true);
    expect(r.matched).toBe(true);
    expect(r.balanced).toBe(true);
    expect(r.totalDebit).toBe(80_000_000);
    expect(r.totalCredit).toBe(80_000_000);
  });

  it("ترتیب ردیف‌ها مهم نیست", () => {
    const r = validateEntry(
      [
        { accountCode: "101", debit: 0, credit: 80_000_000 },
        { accountCode: "105", debit: 80_000_000, credit: 0 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.valid).toBe(true);
  });

  it("تقسیم یک طرف به چند ردیف هم تطابق دارد (تجمیع)", () => {
    const r = validateEntry(
      [
        { accountCode: "105", debit: 50_000_000, credit: 0 },
        { accountCode: "105", debit: 30_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 80_000_000 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.valid).toBe(true);
  });
});

describe("validateEntry — خطاهای ساختاری", () => {
  it("کمتر از دو ردیف → خطا", () => {
    const r = validateEntry(
      [{ accountCode: "105", debit: 80_000_000, credit: 0 }],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.valid).toBe(false);
    expect(r.structuralValid).toBe(false);
    expect(r.feedback.some((f) => f.includes("حداقل دو ردیف"))).toBe(true);
  });

  it("ردیف با هم بدهکار هم بستانکار → خطا", () => {
    const r = validateEntry(
      [
        { accountCode: "105", debit: 80_000_000, credit: 20_000_000 },
        { accountCode: "101", debit: 0, credit: 60_000_000 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.structuralValid).toBe(false);
    expect(r.feedback.some((f) => f.includes("هم بدهکار و هم بستانکار"))).toBe(true);
  });

  it("ردیف بدون مبلغ → خطا", () => {
    const r = validateEntry(
      [
        { accountCode: "105", debit: 0, credit: 0 },
        { accountCode: "101", debit: 0, credit: 80_000_000 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.structuralValid).toBe(false);
    expect(r.feedback.some((f) => f.includes("هیچ مبلغی ندارد"))).toBe(true);
  });

  it("حساب ناموجود → خطا", () => {
    const r = validateEntry(
      [
        { accountCode: "999", debit: 80_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 80_000_000 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.structuralValid).toBe(false);
    expect(r.feedback.some((f) => f.includes("فهرست حساب‌ها نیست"))).toBe(true);
  });
});

describe("validateEntry — توازن", () => {
  it("عدم توازن → خطا با مبالغ", () => {
    const r = validateEntry(
      [
        { accountCode: "105", debit: 80_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 70_000_000 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.structuralValid).toBe(true);
    expect(r.balanced).toBe(false);
    expect(r.valid).toBe(false);
    expect(r.feedback.some((f) => f.includes("برابر نیست"))).toBe(true);
  });
});

describe("validateEntry — تطابق ناقص با بازخورد دقیق", () => {
  it("حساب اشتباه → بازخورد دقیق", () => {
    const r = validateEntry(
      [
        { accountCode: "105", debit: 80_000_000, credit: 0 },
        { accountCode: "401", debit: 0, credit: 80_000_000 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.structuralValid).toBe(true);
    expect(r.balanced).toBe(true);
    expect(r.valid).toBe(false);
    expect(r.feedback.some((f) => f.includes("صندوق") && f.includes("بستانکار"))).toBe(true);
    expect(r.feedback.some((f) => f.includes("فروش") && f.includes("اضافی"))).toBe(true);
  });

  it("مبلغ اشتباه → بازخورد با مبلغ مورد انتظار", () => {
    const r = validateEntry(
      [
        { accountCode: "105", debit: 50_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 50_000_000 },
      ],
      [BUY_INVENTORY_ANSWER],
      ACCOUNTS,
    );
    expect(r.valid).toBe(false);
    expect(
      r.feedback.some((f) => f.includes("موجودی کالا") && f.includes("۸,۰۰۰,۰۰۰")),
    ).toBe(true);
  });
});

describe("validateEntry — چند پاسخ مجاز", () => {
  it("تطابق با پاسخ دوم (پرداخت نقدی از صندوق یا بانک)", () => {
    const payRentAnswers: JournalLineInput[][] = [
      [
        { accountCode: "503", debit: 20_000_000, credit: 0 },
        { accountCode: "101", debit: 0, credit: 20_000_000 },
      ],
      [
        { accountCode: "503", debit: 20_000_000, credit: 0 },
        { accountCode: "102", debit: 0, credit: 20_000_000 },
      ],
    ];
    const r = validateEntry(
      [
        { accountCode: "503", debit: 20_000_000, credit: 0 },
        { accountCode: "102", debit: 0, credit: 20_000_000 },
      ],
      payRentAnswers,
      ACCOUNTS,
    );
    expect(r.valid).toBe(true);
    expect(r.matched).toBe(true);
  });
});

describe("validateEntry — سند مرکب (بیش از دو ردیف)", () => {
  it("سه ردیف متوازن و مطابق → valid", () => {
    const compound: JournalLineInput[] = [
      { accountCode: "105", debit: 80_000_000, credit: 0 },
      { accountCode: "503", debit: 5_000_000, credit: 0 },
      { accountCode: "101", debit: 0, credit: 85_000_000 },
    ];
    const r = validateEntry(compound, [compound], ACCOUNTS);
    expect(r.valid).toBe(true);
    expect(r.totalDebit).toBe(85_000_000);
    expect(r.totalCredit).toBe(85_000_000);
  });
});
