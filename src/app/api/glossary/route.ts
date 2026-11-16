import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/glossary — فهرست همه‌ی اصطلاحات فرهنگ لغت */
export async function GET() {
  const terms = await db.glossaryTerm.findMany({
    orderBy: { term: "asc" },
    select: { slug: true, term: true, definition: true, example: true },
  });
  return NextResponse.json({ terms });
}
