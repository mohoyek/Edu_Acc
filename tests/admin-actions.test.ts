import { describe, it, expect } from "vitest";
import {
  resolveAdminAction,
  canDeleteUser,
  validateAdminPassword,
} from "@/lib/admin-actions";

const adminId = "admin-1";

function target(overrides: Partial<{ id: string; role: string; isActive: boolean }> = {}) {
  return { id: "user-2", role: "USER", isActive: true, ...overrides };
}

describe("resolveAdminAction — ارتقا", () => {
  it("کاربر عادی ارتقا می‌گیرد", () => {
    const r = resolveAdminAction({ action: "promote", adminId, target: target() });
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ role: "ADMIN" });
  });

  it("مدیرِ فعلی دوباره ارتقا نمی‌گیرد", () => {
    const r = resolveAdminAction({
      action: "promote",
      adminId,
      target: target({ role: "ADMIN" }),
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("از قبل مدیر");
  });
});

describe("resolveAdminAction — تنزل", () => {
  it("مدیر دیگر تنزل می‌گیرد", () => {
    const r = resolveAdminAction({
      action: "demote",
      adminId,
      target: target({ role: "ADMIN" }),
    });
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ role: "USER" });
  });

  it("مدیر نمی‌تواند نقش خودش را تغییر دهد", () => {
    const r = resolveAdminAction({
      action: "demote",
      adminId,
      target: target({ id: adminId, role: "ADMIN" }),
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("خودتان");
  });

  it("کاربر عادی قابل تنزل نیست", () => {
    const r = resolveAdminAction({ action: "demote", adminId, target: target() });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("مدیر نیست");
  });
});

describe("resolveAdminAction — غیرفعال‌سازی و فعال‌سازی", () => {
  it("کاربر فعال غیرفعال می‌شود", () => {
    const r = resolveAdminAction({ action: "deactivate", adminId, target: target() });
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ isActive: false });
  });

  it("مدیر نمی‌تواند خودش را غیرفعال کند", () => {
    const r = resolveAdminAction({
      action: "deactivate",
      adminId,
      target: target({ id: adminId }),
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("خودتان");
  });

  it("کاربر غیرفعال دوباره غیرفعال نمی‌شود", () => {
    const r = resolveAdminAction({
      action: "deactivate",
      adminId,
      target: target({ isActive: false }),
    });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("از قبل غیرفعال");
  });

  it("کاربر غیرفعال دوباره فعال می‌شود", () => {
    const r = resolveAdminAction({
      action: "activate",
      adminId,
      target: target({ isActive: false }),
    });
    expect(r.ok).toBe(true);
    expect(r.data).toEqual({ isActive: true });
  });

  it("کاربر فعال دوباره فعال نمی‌شود", () => {
    const r = resolveAdminAction({ action: "activate", adminId, target: target() });
    expect(r.ok).toBe(false);
    expect(r.error).toContain("از قبل فعال");
  });

  it("فعال‌سازیِ حسابِ فعالِ مدیر هم خطای «از قبل فعال» می‌دهد", () => {
    const r = resolveAdminAction({
      action: "activate",
      adminId,
      target: target({ id: adminId, isActive: true }),
    });
    expect(r.ok).toBe(false);
  });
});

describe("canDeleteUser", () => {
  it("حذف خود ممنوع است", () => {
    const r = canDeleteUser(adminId, adminId);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("خودتان");
  });

  it("حذف کاربر دیگر مجاز است", () => {
    expect(canDeleteUser(adminId, "user-9").ok).toBe(true);
  });
});

describe("validateAdminPassword", () => {
  it("رمز معتبر بدون خطا است", () => {
    expect(validateAdminPassword("i199064R#")).toBeNull();
    expect(validateAdminPassword("123456")).toBeNull();
    expect(validateAdminPassword("pass word 12")).toBeNull(); // فاصله داخلی مجاز
  });

  it("رمز خالی یا کوتاه رد می‌شود", () => {
    expect(validateAdminPassword("")).toContain("وارد کنید");
    expect(validateAdminPassword("12345")).toContain("۶");
  });

  it("فاصله در ابتدا/انتها رد می‌شود", () => {
    expect(validateAdminPassword(" abc123 ")).toContain("فاصله");
  });

  it("رمز بلندتر از ۷۲ رد می‌شود", () => {
    expect(validateAdminPassword("a".repeat(73))).toContain("۷۲");
  });
});
