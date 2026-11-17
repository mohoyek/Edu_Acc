// ارتقای یک کاربر به نقش مدیر:
//   bun scripts/make-admin.ts <email>
// (یا با tsx: npx tsx scripts/make-admin.ts <email>)
// نیازمند DATABASE_URL در .env — روی همان دیتابیسی اجرا می‌شود که به آن اشاره می‌کند.

import { PrismaClient } from "@prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("استفاده: bun scripts/make-admin.ts <email>");
  process.exit(1);
}

const db = new PrismaClient();

try {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`کاربری با ایمیل ${email} پیدا نشد. اول باید ثبت‌نام کند.`);
    process.exit(1);
  }
  const updated = await db.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { email: true, role: true, name: true },
  });
  console.log(`OK: ${updated.email} اکنون مدیر است (role=${updated.role})`);
} finally {
  await db.$disconnect();
}
