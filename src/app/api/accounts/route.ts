import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/accounts — فهرست حساب‌های استاندارد (برای انتخابگر حساب در تمرین سند). */
export async function GET() {
  const accounts = await db.account.findMany({
    where: { isDefault: true },
    orderBy: { code: "asc" },
    select: {
      code: true,
      name: true,
      type: true,
      normalBalance: true,
    },
  });
  return NextResponse.json({ accounts });
}
