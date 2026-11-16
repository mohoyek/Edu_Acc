"use client";

import { CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedbackPanel({
  result,
  hint,
  solution,
  showHint,
  showSolution,
}: {
  result: { valid: boolean; feedback: string[] } | null;
  hint?: string;
  solution?: { accountCode: string; debit: number; credit: number }[];
  showHint: boolean;
  showSolution: boolean;
}) {
  if (!result && !showHint && !showSolution) return null;

  return (
    <div className="space-y-3">
      {result && (
        <div
          className={cn(
            "rounded-lg border p-4",
            result.valid
              ? "border-primary/40 bg-primary/10"
              : "border-destructive/40 bg-destructive/10",
          )}
        >
          <div className="flex items-center gap-2 font-bold">
            {result.valid ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <span className={result.valid ? "text-primary" : "text-destructive"}>
              {result.valid ? "سند درست است!" : "سند ایراد دارد:"}
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {result.feedback.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showHint && hint && (
        <div className="flex gap-2 rounded-lg border border-border bg-secondary/50 p-4 text-sm">
          <Info className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-foreground">{hint}</p>
        </div>
      )}

      {showSolution && solution && <SolutionTable solution={solution} />}
    </div>
  );
}

function SolutionTable({
  solution,
}: {
  solution: { accountCode: string; debit: number; credit: number }[];
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-2 text-sm font-bold text-foreground">پاسخ نمونه:</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="border border-border px-3 py-2 text-right">حساب</th>
              <th className="border border-border px-3 py-2 text-right">بدهکار</th>
              <th className="border border-border px-3 py-2 text-right">بستانکار</th>
            </tr>
          </thead>
          <tbody>
            {solution.map((l, i) => (
              <tr key={i}>
                <td className="border border-border px-3 py-2">{l.accountCode}</td>
                <td className="border border-border px-3 py-2">
                  {l.debit > 0 ? l.debit.toLocaleString("en-US") : ""}
                </td>
                <td className="border border-border px-3 py-2">
                  {l.credit > 0 ? l.credit.toLocaleString("en-US") : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
