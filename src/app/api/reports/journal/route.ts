import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function getCompanyData() {
  const user = await getCurrentUser();
  if (!user) return null;
  const company = await db.company.findUnique({ where: { userId: user.id } });
  if (!company) return null;
  const accounts = await db.account.findMany({
    where: { isDefault: true },
    select: { code: true, name: true, type: true, normalBalance: true },
  });
  const entries = await db.journalEntry.findMany({
    where: { companyId: company.id },
    include: { lines: true, exercise: { select: { slug: true, title: true } } },
    orderBy: { date: "asc" },
  });
  return { company, accounts, entries, userId: user.id };
}

/** GET /api/reports/journal — دفتر روزنامه */
export async function GET() {
  const data = await getCompanyData();
  if (!data) return NextResponse.json({ error: "ورود لازم است" }, { status: 401 });
  const accountName = new Map(data.accounts.map((a) => [a.code, a.name]));
  const journal = data.entries.map((e) => ({
    id: e.id,
    date: e.date.toISOString(),
    description: e.description,
    source: e.source,
    exercise: e.exercise?.slug ?? null,
    lines: e.lines.map((l) => ({
      accountCode: l.accountCode,
      accountName: accountName.get(l.accountCode) ?? `کد ${l.accountCode}`,
      debit: l.debit,
      credit: l.credit,
    })),
  }));
  return NextResponse.json({ journal });
}
