// اسکریپت seed: فهرست حساب‌های استاندارد را در دیتابیس می‌ریزد.
// اجرا: bun run seed
import { PrismaClient } from "@prisma/client";
import { ACCOUNTS } from "../src/data/accounts";

const prisma = new PrismaClient();

async function main() {
  console.log("→ در حال seeding فهرست حساب‌ها…");

  for (const acc of ACCOUNTS) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: {
        name: acc.name,
        type: acc.type,
        normalBalance: acc.normalBalance,
        isDefault: true,
      },
      create: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        normalBalance: acc.normalBalance,
        isDefault: true,
      },
    });
    console.log(`  ✓ ${acc.code} — ${acc.name}`);
  }

  const count = await prisma.account.count();
  console.log(`✅ تعداد حساب‌ها: ${count}`);
}

main()
  .catch((e) => {
    console.error("seed خطا:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
