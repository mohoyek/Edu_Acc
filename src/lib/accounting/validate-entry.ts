// موتور اعتبارسنجی سند حسابداری — منطق خالص، بدون وابستگی به React یا دیتابیس.
// بررسی می‌کند:
//   ۱) حداقل دو ردیف
//   ۲) هر ردیف فقط یکی از بدهکار/بستانکار (و مبلغ مثبت)
//   ۳) حساب‌ها در فهرست حساب‌ها موجودند
//   ۴) جمع بدهکار = جمع بستانکار
//   ۵) تطابق با یکی از پاسخ‌های مجاز (هر تمرین می‌تواند چند پاسخ داشته باشد)
// بازخورد فارسی دقیق: کدام قسمت غلط و چرا.

import { formatMoney } from "@/lib/format/money";
import { toPersianDigits } from "@/lib/format/persian-digits";
import type {
  AccountInfo,
  JournalLineInput,
  ValidationResult,
} from "./types";

interface AggregatedLine {
  debit: number;
  credit: number;
}

/** تجمیع ردیف‌ها به‌ازای هر کد حساب (برای تطابق مستقل از ترتیب و ترکیب ردیف‌ها). */
function aggregate(lines: JournalLineInput[]): Map<string, AggregatedLine> {
  const m = new Map<string, AggregatedLine>();
  for (const l of lines) {
    const cur = m.get(l.accountCode) ?? { debit: 0, credit: 0 };
    cur.debit += l.debit;
    cur.credit += l.credit;
    m.set(l.accountCode, cur);
  }
  return m;
}

/** آیا دو نقشه‌ی تجمیعی برابرند؟ */
function aggEqual(a: Map<string, AggregatedLine>, b: Map<string, AggregatedLine>): boolean {
  if (a.size !== b.size) return false;
  for (const [code, va] of a) {
    const vb = b.get(code);
    if (!vb) return false;
    if (va.debit !== vb.debit || va.credit !== vb.credit) return false;
  }
  return true;
}

/** پاسخی با بیشترین همپوشانی حساب‌ها با کاربر (برای بازخورد دقیق‌تر). */
function pickClosestAnswer(
  userAgg: Map<string, AggregatedLine>,
  allowed: JournalLineInput[][],
): JournalLineInput[] {
  let best = allowed[0];
  let bestOverlap = -1;
  for (const ans of allowed) {
    const ansAgg = aggregate(ans);
    let overlap = 0;
    for (const code of userAgg.keys()) if (ansAgg.has(code)) overlap++;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = ans;
    }
  }
  return best;
}

/**
 * اعتبارسنجی سند کاربر در برابر پاسخ‌های مجاز.
 * @param userLines    ردیف‌های سند کاربر (ریال)
 * @param allowedAnswers پاسخ‌های مجاز (هر کدام آرایه‌ای از ردیف‌ها)
 * @param accounts     فهرست حساب‌های موجود
 */
export function validateEntry(
  userLines: JournalLineInput[],
  allowedAnswers: JournalLineInput[][],
  accounts: AccountInfo[],
): ValidationResult {
  const accountMap = new Map(accounts.map((a) => [a.code, a]));
  const feedback: string[] = [];
  const accountName = (code: string) =>
    accountMap.get(code)?.name ?? `کد ${code}`;

  // ردیف‌های «واقعی» = آن‌هایی که حداقل یک حساب یا مبلغ دارند
  const real = userLines.filter(
    (l) => l.accountCode.trim() !== "" || l.debit !== 0 || l.credit !== 0,
  );

  let totalDebit = 0;
  let totalCredit = 0;
  let structuralValid = true;

  // ۱) حداقل دو ردیف
  if (real.length < 2) {
    feedback.push("سند باید حداقل دو ردیف داشته باشد.");
    structuralValid = false;
  }

  // ۲ و ۳) بررسی هر ردیف
  real.forEach((l, idx) => {
    const n = idx + 1;
    if (l.accountCode.trim() === "") {
      feedback.push(`ردیف ${toPersianDigits(n)}: حسابی انتخاب نشده است.`);
      structuralValid = false;
    } else if (!accountMap.has(l.accountCode)) {
      feedback.push(
        `ردیف ${toPersianDigits(n)}: کد حساب «${l.accountCode}» در فهرست حساب‌ها نیست.`,
      );
      structuralValid = false;
    }

    const hasDebit = l.debit > 0;
    const hasCredit = l.credit > 0;
    if (hasDebit && hasCredit) {
      feedback.push(
        `ردیف ${toPersianDigits(n)}: هم بدهکار و هم بستانکار پر شده؛ هر ردیف فقط یکی را باید داشته باشد.`,
      );
      structuralValid = false;
    } else if (!hasDebit && !hasCredit) {
      feedback.push(
        `ردیف ${toPersianDigits(n)}: هیچ مبلغی ندارد؛ بدهکار یا بستانکار را پر کنید.`,
      );
      structuralValid = false;
    } else if (l.debit < 0 || l.credit < 0) {
      feedback.push(
        `ردیف ${toPersianDigits(n)}: مبلغ نمی‌تواند منفی باشد.`,
      );
      structuralValid = false;
    }

    totalDebit += l.debit;
    totalCredit += l.credit;
  });

  // ۴) توازن
  const balanced = totalDebit === totalCredit && (totalDebit > 0 || totalCredit > 0);
  if (structuralValid && !balanced) {
    feedback.push(
      `جمع بدهکار (${formatMoney(totalDebit)} تومان) با جمع بستانکار (${formatMoney(
        totalCredit,
      )} تومان) برابر نیست.`,
    );
  }

  // اگر ساختار مشکل دارد، همین‌جا برمی‌گردیم (تطابق معنا ندارد)
  if (!structuralValid) {
    return {
      valid: false,
      structuralValid,
      balanced,
      matched: false,
      totalDebit,
      totalCredit,
      feedback,
    };
  }

  // ۵) تطابق با پاسخ‌های مجاز
  const userAgg = aggregate(real);
  let matched = false;
  for (const ans of allowedAnswers) {
    if (aggEqual(userAgg, aggregate(ans))) {
      matched = true;
      break;
    }
  }

  if (matched) {
    feedback.push("آفرین! سند درست است و در دفتر ثبت شد.");
    return {
      valid: true,
      structuralValid: true,
      balanced: true,
      matched: true,
      totalDebit,
      totalCredit,
      feedback,
    };
  }

  // بازخورد دقیق: مقایسه با نزدیک‌ترین پاسخ
  const closest = pickClosestAnswer(userAgg, allowedAnswers);
  const ansAgg = aggregate(closest);

  // حساب‌های موجود در پاسخ اما ناقص/مغایر در سند کاربر
  for (const [code, exp] of ansAgg) {
    const got = userAgg.get(code);
    if (!got) {
      if (exp.debit > 0) {
        feedback.push(
          `حساب «${accountName(code)}» را بدهکار ${formatMoney(exp.debit)} نکرده‌اید.`,
        );
      }
      if (exp.credit > 0) {
        feedback.push(
          `حساب «${accountName(code)}» را بستانکار ${formatMoney(exp.credit)} نکرده‌اید.`,
        );
      }
    } else {
      if (exp.debit !== got.debit && (exp.debit > 0 || got.debit > 0)) {
        feedback.push(
          `مبلغ بدهکارِ حساب «${accountName(code)}» باید ${formatMoney(exp.debit)} باشد، نه ${formatMoney(got.debit)}.`,
        );
      }
      if (exp.credit !== got.credit && (exp.credit > 0 || got.credit > 0)) {
        feedback.push(
          `مبلغ بستانکارِ حساب «${accountName(code)}» باید ${formatMoney(exp.credit)} باشد، نه ${formatMoney(got.credit)}.`,
        );
      }
    }
  }

  // حساب‌های اضافی در سند کاربر که در پاسخ نیستند
  for (const [code, got] of userAgg) {
    if (!ansAgg.has(code)) {
      if (got.debit > 0) {
        feedback.push(
          `حساب «${accountName(code)}» (بدهکار ${formatMoney(got.debit)}) اضافی است و نباید در سند باشد.`,
        );
      }
      if (got.credit > 0) {
        feedback.push(
          `حساب «${accountName(code)}» (بستانکار ${formatMoney(got.credit)}) اضافی است و نباید در سند باشد.`,
        );
      }
    }
  }

  if (feedback.length === 0) {
    feedback.push("حساب‌ها یا مبالغ با پاسخ مجاز مطابقت ندارند.");
  }

  return {
    valid: false,
    structuralValid: true,
    balanced,
    matched: false,
    totalDebit,
    totalCredit,
    feedback,
  };
}
