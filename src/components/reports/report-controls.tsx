"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportToolbar({
  onCSV,
  onPrint,
  csvLabel = "خروجی CSV",
}: {
  onCSV: () => void;
  onPrint: () => void;
  csvLabel?: string;
}) {
  return (
    <div className="no-print flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onCSV}>
        <Download className="h-4 w-4" />
        {csvLabel}
      </Button>
      <Button variant="outline" size="sm" onClick={onPrint}>
        <Printer className="h-4 w-4" />
        چاپ
      </Button>
    </div>
  );
}

export function ReportTable({
  headers,
  rows,
  totalRow,
}: {
  headers: string[];
  rows: (string | number)[][];
  totalRow?: (string | number)[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm print-block">
        <thead className="bg-secondary">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border border-border px-3 py-2 text-right font-bold"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="border border-border px-3 py-4 text-center text-muted-foreground"
              >
                داده‌ای برای نمایش نیست. ابتدا یک تمرین ثبت سند را حل کن.
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-border px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {totalRow && (
          <tfoot>
            <tr className="bg-muted/50 font-bold">
              {totalRow.map((cell, i) => (
                <td key={i} className="border border-border px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
