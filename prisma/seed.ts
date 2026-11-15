// اسکریپت seed: فهرست حساب‌ها + درس‌ها + کوییزها + فرهنگ لغت.
// اجرا: bun run seed
import { PrismaClient } from "@prisma/client";
import { ACCOUNTS } from "../src/data/accounts";
import { LESSONS } from "../src/data/lessons";
import { GLOSSARY } from "../src/data/glossary";

const prisma = new PrismaClient();

async function seedAccounts() {
  console.log("→ seeding حساب‌ها…");
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
  }
  console.log(`  ✓ ${await prisma.account.count()} حساب`);
}

async function seedGlossary() {
  console.log("→ seeding فرهنگ لغت…");
  for (const g of GLOSSARY) {
    await prisma.glossaryTerm.upsert({
      where: { slug: g.slug },
      update: { term: g.term, definition: g.definition, example: g.example },
      create: {
        slug: g.slug,
        term: g.term,
        definition: g.definition,
        example: g.example,
      },
    });
  }
  console.log(`  ✓ ${await prisma.glossaryTerm.count()} اصطلاح`);
}

async function seedLessons() {
  console.log("→ seeding درس‌ها + کوییزها…");
  for (const l of LESSONS) {
    await prisma.lesson.upsert({
      where: { slug: l.slug },
      update: {
        level: l.level,
        order: l.order,
        title: l.title,
        summary: l.summary,
        contentSlug: l.contentSlug,
        glossarySlugs: l.glossarySlugs,
        questionsJson: l.questions,
      },
      create: {
        slug: l.slug,
        level: l.level,
        order: l.order,
        title: l.title,
        summary: l.summary,
        contentSlug: l.contentSlug,
        glossarySlugs: l.glossarySlugs,
        questionsJson: l.questions,
      },
    });
  }
  console.log(`  ✓ ${await prisma.lesson.count()} درس`);
}

async function main() {
  await seedAccounts();
  await seedGlossary();
  await seedLessons();
  console.log("✅ seed کامل شد.");
}

main()
  .catch((e) => {
    console.error("seed خطا:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
