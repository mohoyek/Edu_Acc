// ساخت یا ارتقای حساب مدیر با نام کاربری و رمز:
//   ADMIN_USERNAME=MoHoYek ADMIN_PASSWORD='...' npx tsx scripts/make-admin.ts [identifier]
//   - identifier می‌تواند ایمیل یا نام کاربری باشد (پیش‌فرض: ADMIN_USERNAME)
//   - اگر حساب موجود باشد: به ADMIN ارتقا می‌یابد و اگر ADMIN_PASSWORD داده شده باشد رمزش عوض می‌شود
//   - اگر حساب نباشد: ساخته می‌شود (ایمیل داخلی: <username>@acc.local) + شرکت مجازی پیش‌فرض
// نیازمند DATABASE_URL — روی همان دیتابیسی اجرا می‌شود که .env به آن اشاره می‌کند.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const identifier = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? process.env.ADMIN_USERNAME ?? "")
  .trim();
const username = (process.env.ADMIN_USERNAME ?? "").trim() || null;
const password = process.env.ADMIN_PASSWORD ?? "";

if (!identifier) {
  console.error("استفاده: ADMIN_PASSWORD='...' npx tsx scripts/make-admin.ts <ایمیل یا نام کاربری>");
  process.exit(1);
}
if (!password) {
  console.error("رمز مدیر را با متغیر محیطی ADMIN_PASSWORD بدهید؛ مثال:");
  console.error("  ADMIN_PASSWORD='رمز' npx tsx scripts/make-admin.ts MoHoYek");
  process.exit(1);
}
if (password.length < 6) {
  console.error("رمز باید حداقل ۶ کاراکتر باشد.");
  process.exit(1);
}

const db = new PrismaClient();
const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

try {
  const existing = await db.user.findFirst({
    where: {
      OR: [
        { email: identifier.toLowerCase() },
        ...(username ? [{ username: { equals: username, mode: "insensitive" as const } }] : []),
        ...(looksLikeEmail
          ? []
          : [{ username: { equals: identifier, mode: "insensitive" as const } }]),
      ],
    },
  });

  const passwordHash = bcrypt.hashSync(password, 10);

  if (existing) {
    const updated = await db.user.update({
      where: { id: existing.id },
      data: {
        role: "ADMIN",
        isActive: true,
        ...(password ? { passwordHash } : {}),
        ...(username && !existing.username ? { username } : {}),
      },
      select: { id: true, email: true, username: true, role: true, name: true },
    });
    console.log(
      `OK: حساب موجود ارتقا یافت → ${updated.email}${updated.username ? ` (${updated.username})` : ""} role=${updated.role}${password ? " + رمز به‌روزرسانی شد" : ""}`,
    );
  } else {
    const email = looksLikeEmail ? identifier.toLowerCase() : `${identifier.toLowerCase()}@acc.local`;
    const finalUsername = username ?? (looksLikeEmail ? null : identifier);
    const name = process.env.ADMIN_NAME ?? "مدیر سایت";

    const created = await db.user.create({
      data: {
        email,
        username: finalUsername,
        name,
        role: "ADMIN",
        isActive: true,
        passwordHash,
      },
      select: { id: true, email: true, username: true, role: true, name: true },
    });
    await db.company.create({ data: { userId: created.id, name: "شرکت من" } });
    console.log(
      `OK: حساب مدیر ساخته شد → ${created.email}${created.username ? ` (${created.username})` : ""} role=${created.role}`,
    );
    console.log("ورود با نام کاربری یا ایمیل فوق انجام می‌شود.");
  }
} finally {
  await db.$disconnect();
}
