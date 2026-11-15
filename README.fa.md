# حسابدار شو

وب‌سایت آموزش حسابداری فارسی با تمرین ثبت سند و بازخورد فوری. کاربر از صفر شروع می‌کند و با درس‌های ساده و تمرین عملی به حسابدار حرفه‌ای تبدیل می‌شود.

## تکنولوژی‌ها

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS 4** + **shadcn/ui**
- **Prisma** + **SQLite** (قابل انتقال به PostgreSQL)
- **Auth.js (NextAuth v4)** با ایمیل/رمز
- **MDX** برای محتوای درس‌ها (پوشه‌ی `content/lessons`)
- **Recharts** برای نمودارها
- **Vitest** برای تست واحد
- **jalaali-js** برای تبدیل تاریخ میلادی ↔ شمسی

## الزامات فارسی

- کل رابط **RTL** با فونت **Vazirmatn**
- اعداد فارسی در نمایش، تاریخ میلادی در دیتابیس → شمسی در نمایش
- مبالغ به‌صورت عدد صحیح **ریال** در دیتابیس، نمایش به **تومان** (یا ریال) با جداکننده‌ی هزارگان

## نصب و اجرا

```bash
# نصب وابستگی‌ها
bun install

# همگام‌سازی دیتابیس با schema
bun run db:push

# تولید Prisma Client
bun run db:generate

# وارد کردن داده‌های اولیه (فهرست حساب‌های استاندارد)
bun run seed

# اجرای سرور توسعه (پورت ۳۰۰۰)
bun run dev
```

سپس به `http://localhost:3000` بروید.

## تست

```bash
# اجرای همه‌ی تست‌های واحد
bun run test

# حالت watch
bun run test:watch
```

تست‌های موجود (مرحله‌های ۱ و ۲):
- `tests/persian-digits.test.ts` — تبدیل ارقام فارسی/انگلیسی
- `tests/money.test.ts` — قالب‌بندی مبلغ ریال/تومان
- `tests/jalali.test.ts` — تبدیل تاریخ شمسی و لنگرهای تاریخی
- `tests/quiz.test.ts` — تصحیح کوییز و محاسبه‌ی قبولی
- `tests/path.test.ts` — منطق قفل سطح در مسیر یادگیری

## اسکریپت‌های پرکاربرد

| دستور | توضیح |
| --- | --- |
| `bun run dev` | سرور توسعه |
| `bun run lint` | بررسی کیفیت کد |
| `bun run db:push` | اعمال schema روی دیتابیس |
| `bun run db:generate` | تولید Prisma Client |
| `bun run seed` | وارد کردن داده‌های اولیه |
| `bun run test` | اجرای تست‌ها |

## ساختار پروژه

```
prisma/
  schema.prisma     مدل داده
  seed.ts           اسکریپت seed (حساب‌ها)
src/
  app/
    layout.tsx      RTL + Vazirmatn + حالت تاریک
    page.tsx        ریشه‌ی SPA + هش‌روتر
    api/            مسیرهای API (auth، accounts، me، ...)
  components/
    layout/         Header، AppShell، ThemeToggle
    views/          نماها: Home، Login، Register، Dashboard، ComingSoon
    ui/             کامپوننت‌های shadcn
  lib/
    auth.ts         پیکربندی NextAuth (Credentials)
    password.ts     هش رمز با bcryptjs
    session.ts      کمک‌تابع جلسه
    router.ts       هش‌روتر ساده
    db.ts           Prisma Client
    format/         persian-digits، money، jalali
  data/
    accounts.ts     فهرست حساب‌های استاندارد
content/
  lessons/          فایل‌های MDX درس‌ها (مرحله‌ی ۲)
tests/              تست‌های Vitest
```

## مدل داده

مدل‌ها در `prisma/schema.prisma`:
`User`, `Account`, `Company`, `Lesson`, `GlossaryTerm`, `LessonProgress`, `QuizAttempt`, `Exercise`, `ExerciseAttempt`, `JournalEntry`, `JournalLine`, `Badge`, `UserBadge`.

نکته: SQLite از `enum` پشتیبانی نمی‌کند؛ مقادیر محدود (مثل نوع حساب و ماهیت) به‌صورت `String` ذخیره و در کد بررسی می‌شوند. مبالغ همیشه عدد صحیح **ریال** هستند.

## نقشه‌ی مراحل

1. **مرحله‌ی ۱ (انجام‌شده):** اسکلت پروژه، RTL/Vazirmatn، احراز هویت ایمیل/رمز، هش‌روتر، مدل‌ها، seed فهرست حساب‌ها، تست‌های فرمت.
2. **مرحله‌ی ۲ (انجام‌شده):** درس (MDX) + کوییز با بازخورد + فرهنگ لغت (۱۵ اصطلاح) + مسیر یادگیری با قفل سطح (۷ درس در ۲ سطح).
3. **مرحله‌ی ۳:** موتور تمرین ثبت سند با بازخورد فوری.
4. **مرحله‌ی ۴:** شرکت مجازی و گزارش‌ها (روزنامه، کل، تراز آزمایشی، سود و زیان).
5. **مرحله‌ی ۵:** داشبورد پیشرفت و انگیزه (امتیاز، نشان، رکورد روزانه).

## متغیرهای محیطی

در فایل `.env`:

```
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=<رشته‌ی تصادفی>
NEXTAUTH_URL=http://localhost:3000
```
