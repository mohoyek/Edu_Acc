"use client";

import { LESSON_COMPONENTS } from "@/lib/lessons-registry";
import { GlossaryTooltip } from "@/components/lesson/glossary-tooltip";

// استایل‌دهی به عناصر HTML که در MDX استفاده می‌شوند (جدول‌ها، کد، ...)
const MDX_COMPONENTS = {
  Term: GlossaryTooltip,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-4 overflow-x-auto">
      <table
        {...props}
        className="w-full border-collapse text-sm border border-border"
      />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} className="bg-secondary" />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="border border-border px-3 py-2 text-right font-bold text-foreground"
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      {...props}
      className="border border-border px-3 py-2 text-foreground"
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm text-foreground"
    />
  ),
};

export function LessonContent({ contentSlug }: { contentSlug: string }) {
  const Comp = LESSON_COMPONENTS[contentSlug];
  if (!Comp) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-muted-foreground">
        محتوای این درس هنوز آماده نشده است.
      </p>
    );
  }
  return (
    <div className="prose-headings:font-bold prose-headings:text-foreground prose-p:leading-relaxed prose-li:leading-relaxed max-w-none text-foreground">
      <Comp components={MDX_COMPONENTS} />
    </div>
  );
}
