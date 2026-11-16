// اسکریپت seed: فهرست حساب‌ها + درس‌ها + کوییزها + فرهنگ لغت.
// اجرا: bun run seed
import { PrismaClient } from "@prisma/client";
import { ACCOUNTS } from "../src/data/accounts";
import { LESSONS } from "../src/data/lessons";
import { GLOSSARY } from "../src/data/glossary";
import { EXERCISES } from "../src/data/exercises";
import { BADGE_DEFINITIONS } from "../src/lib/badges";

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

async function seedExercises() {
  console.log("→ seeding تمرین‌های ثبت سند…");
  for (const ex of EXERCISES) {
    let lessonId: string | null = null;
    if (ex.lessonSlug) {
      const lesson = await prisma.lesson.findUnique({
        where: { slug: ex.lessonSlug },
        select: { id: true },
      });
      lessonId = lesson?.id ?? null;
    }
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: {
        lessonId,
        title: ex.title,
        storyText: ex.storyText,
        allowedAnswers: ex.allowedAnswers as object,
        hint: ex.hint,
        solution: ex.solution as object,
      },
      create: {
        slug: ex.slug,
        lessonId,
        title: ex.title,
        storyText: ex.storyText,
        allowedAnswers: ex.allowedAnswers as object,
        hint: ex.hint,
        solution: ex.solution as object,
      },
    });
  }
  console.log(`  ✓ ${await prisma.exercise.count()} تمرین`);
}

async function seedBadges() {
  console.log("→ seeding نشان‌ها…");
  for (const b of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: { title: b.title, description: b.description, icon: b.icon },
      create: { slug: b.slug, title: b.title, description: b.description, icon: b.icon },
    });
  }
  console.log(`  ✓ ${await prisma.badge.count()} نشان`);
}

async function main() {
  await seedAccounts();
  await seedGlossary();
  await seedLessons();
  await seedExercises();
  await seedBadges();
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
