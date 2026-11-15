"use client";

import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GLOSSARY } from "@/data/glossary";

const GLOSSARY_MAP: Record<string, (typeof GLOSSARY)[number]> = Object.fromEntries(
  GLOSSARY.map((g) => [g.slug, g]),
);

export function GlossaryTooltip({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const term = GLOSSARY_MAP[slug];
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help items-center gap-0.5 border-b border-dashed border-primary/60 font-semibold text-primary">
            {children}
            <HelpCircle className="h-3 w-3 opacity-60" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm">
          {term ? (
            <div className="space-y-1">
              <p className="font-bold">{term.term}</p>
              <p>{term.definition}</p>
            </div>
          ) : (
            <p>{slug}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
