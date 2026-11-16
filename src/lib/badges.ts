// تعریف نشان‌ها و منطق ارزیابی آن‌ها — خالص و قابل تست.

export interface BadgeContext {
  completedLessons: number;
  solvedExercises: number;
  streak: number;
  points: number;
  level1Done: boolean;
}

export interface BadgeDefinition {
  slug: string;
  title: string;
  description: string;
  icon: string;
  condition: (ctx: BadgeContext) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: "first-lesson",
    title: "اولین قدم",
    description: "اولین درس را کامل کردی.",
    icon: "BookOpen",
    condition: (c) => c.completedLessons >= 1,
  },
  {
    slug: "first-exercise",
    title: "اولین سند",
    description: "اولین تمرین ثبت سند را درست حل کردی.",
    icon: "ClipboardList",
    condition: (c) => c.solvedExercises >= 1,
  },
  {
    slug: "level1-complete",
    title: "استاد مفاهیم",
    description: "همه‌ی درس‌های سطح ۱ را کامل کردی.",
    icon: "GraduationCap",
    condition: (c) => c.level1Done,
  },
  {
    slug: "five-exercises",
    title: "پنج سند",
    description: "پنج تمرین ثبت سند را حل کردی.",
    icon: "Award",
    condition: (c) => c.solvedExercises >= 5,
  },
  {
    slug: "streak-3",
    title: "سه‌روزه",
    description: "سه روز پشت سر هم فعال بودی.",
    icon: "Flame",
    condition: (c) => c.streak >= 3,
  },
  {
    slug: "points-50",
    title: "پنجاه امتیاز",
    description: "به ۵۰ امتیاز رسیدی.",
    icon: "Medal",
    condition: (c) => c.points >= 50,
  },
];

export function evaluateBadges(ctx: BadgeContext): string[] {
  return BADGE_DEFINITIONS.filter((b) => b.condition(ctx)).map((b) => b.slug);
}
