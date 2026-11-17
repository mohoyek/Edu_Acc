// منطق خالص اعمال مدیر روی کاربر — ارتقا، تنزل، فعال/غیرفعال‌سازی، حذف و تغییر رمز.
// بدون وابستگی به دیتابیس؛ APIها قبل از هر تغییر این گارد را صدا می‌زنند تا
// قواعد (مثل «مدیر نمی‌تواند خودش را حذف کند») یک‌جا و قابل تست بمانند.

export type AdminAction = "promote" | "demote" | "activate" | "deactivate";

export interface AdminActionTarget {
  id: string;
  role: string; // USER | ADMIN
  isActive: boolean;
}

export interface AdminActionInput {
  action: AdminAction;
  /** شناسه‌ی مدیری که درخواست را داده (برای گارد خودحذفی). */
  adminId: string;
  target: AdminActionTarget;
}

export interface AdminActionResult {
  ok: boolean;
  error?: string;
  /** مقادیر مجاز برای prisma.user.update — فقط وقتی ok === true. */
  data?: { role?: string; isActive?: boolean };
}

/** اعمال تغییر نقش/وضعیت را بررسی و مقادیر update را می‌سازد. */
export function resolveAdminAction({
  action,
  adminId,
  target,
}: AdminActionInput): AdminActionResult {
  switch (action) {
    case "promote":
      if (target.role === "ADMIN") {
        return { ok: false, error: "این کاربر از قبل مدیر است" };
      }
      return { ok: true, data: { role: "ADMIN" } };

    case "demote":
      if (target.id === adminId) {
        return { ok: false, error: "نمی‌توانید نقش خودتان را تغییر دهید" };
      }
      if (target.role !== "ADMIN") {
        return { ok: false, error: "این کاربر مدیر نیست" };
      }
      return { ok: true, data: { role: "USER" } };

    case "deactivate":
      if (target.id === adminId) {
        return { ok: false, error: "نمی‌توانید حساب خودتان را غیرفعال کنید" };
      }
      if (!target.isActive) {
        return { ok: false, error: "این حساب از قبل غیرفعال است" };
      }
      return { ok: true, data: { isActive: false } };

    case "activate":
      if (target.isActive) {
        return { ok: false, error: "این حساب از قبل فعال است" };
      }
      return { ok: true, data: { isActive: true } };
  }
}

/** گارد حذف کاربر: مدیر نمی‌تواند خودش را حذف کند. */
export function canDeleteUser(
  adminId: string,
  targetId: string,
): { ok: boolean; error?: string } {
  if (targetId === adminId) {
    return { ok: false, error: "نمی‌توانید حساب خودتان را حذف کنید" };
  }
  return { ok: true };
}

/**
 * سیاست رمز عبور برای تغییر رمز توسط مدیر — هم‌راستا با ثبت‌نام (حداقل ۶ کاراکتر)
 * به‌علاوه سقف ۷۲ کاراکتر (محدودیت bcrypt) و بدون فاصله در ابتدا/انتها.
 * خروجی: پیام خطا یا null (معتبر).
 */
export function validateAdminPassword(password: string): string | null {
  if (typeof password !== "string" || password.length === 0) {
    return "رمز عبور را وارد کنید";
  }
  if (password !== password.trim()) {
    return "رمز نباید با فاصله شروع یا تمام شود";
  }
  if (password.length < 6) {
    return "رمز حداقل ۶ کاراکتر باشد";
  }
  if (password.length > 72) {
    return "رمز حداکثر ۷۲ کاراکتر باشد";
  }
  return null;
}
