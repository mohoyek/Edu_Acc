"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrialBalanceReport } from "@/components/reports/trial-balance-report";
import { JournalReport } from "@/components/reports/journal-report";
import { LedgerReport } from "@/components/reports/ledger-report";
import { IncomeStatementReport } from "@/components/reports/income-statement-report";

export function ReportsView() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">
          گزارش‌های شرکت مجازی
        </h1>
        <p className="mt-1 text-muted-foreground">
          سندهای تمرین‌های حل‌شده در این گزارش‌ها دیده می‌شوند.
        </p>
      </div>

      <Tabs defaultValue="trial-balance">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="trial-balance">تراز آزمایشی</TabsTrigger>
          <TabsTrigger value="journal">دفتر روزنامه</TabsTrigger>
          <TabsTrigger value="ledger">دفتر کل</TabsTrigger>
          <TabsTrigger value="income">سود و زیان</TabsTrigger>
        </TabsList>
        <TabsContent value="trial-balance" className="mt-4">
          <TrialBalanceReport />
        </TabsContent>
        <TabsContent value="journal" className="mt-4">
          <JournalReport />
        </TabsContent>
        <TabsContent value="ledger" className="mt-4">
          <LedgerReport />
        </TabsContent>
        <TabsContent value="income" className="mt-4">
          <IncomeStatementReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
