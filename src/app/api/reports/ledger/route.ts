import { NextResponse } from "next/server";
import { getCompanyData } from "@/app/api/reports/journal/route";
import { computeLedger } from "@/lib/accounting/ledger";

/** GET /api/reports/ledger?accountCode=101 — دفتر کل یک حساب */
export async function GET(req: Request) {
  const data = await getCompanyData();
  if (!data) return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  const url = new URL(req.url);
  const accountCode = url.searchParams.get("accountCode");
  if (!accountCode) {
    return NextResponse.json({ error: "accountCode لازم است" }, { status: 400 });
  }
  const entries = data.entries.map((e) => ({
    date: e.date,
    description: e.description,
    lines: e.lines.map((l) => ({
      accountCode: l.accountCode,
      debit: l.debit,
      credit: l.credit,
    })),
  }));
  const result = computeLedger(accountCode, entries, data.accounts);
  return NextResponse.json(result);
}
