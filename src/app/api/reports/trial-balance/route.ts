import { NextResponse } from "next/server";
import { getCompanyData } from "@/app/api/reports/journal/route";
import { computeTrialBalance } from "@/lib/accounting/trial-balance";

/** GET /api/reports/trial-balance — تراز آزمایشی */
export async function GET() {
  const data = await getCompanyData();
  if (!data) return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  const flat = data.entries.flatMap((e) =>
    e.lines.map((l) => ({ accountCode: l.accountCode, debit: l.debit, credit: l.credit })),
  );
  const result = computeTrialBalance(flat, data.accounts);
  return NextResponse.json(result);
}
