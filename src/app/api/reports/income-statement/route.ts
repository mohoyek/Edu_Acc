import { NextResponse } from "next/server";
import { getCompanyData } from "@/app/api/reports/journal/route";
import { computeTrialBalance } from "@/lib/accounting/trial-balance";
import { computeIncomeStatement } from "@/lib/accounting/income-statement";

/** GET /api/reports/income-statement — صورت سود و زیان ساده */
export async function GET() {
  const data = await getCompanyData();
  if (!data) return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  const flat = data.entries.flatMap((e) =>
    e.lines.map((l) => ({ accountCode: l.accountCode, debit: l.debit, credit: l.credit })),
  );
  const tb = computeTrialBalance(flat, data.accounts);
  const result = computeIncomeStatement(tb.rows);
  return NextResponse.json(result);
}
