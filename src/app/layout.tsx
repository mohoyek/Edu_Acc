import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "حسابدار شو | آموزش حسابداری با تمرین عملی",
  description:
    "از صفر تا حسابدار حرفه‌ای. درس‌های ساده، تمرین ثبت سند با بازخورد فوری، شرکت مجازی و گزارش‌گیری.",
  keywords: [
    "حسابداری",
    "آموزش حسابداری",
    "ثبت سند",
    "تراز آزمایشی",
    "تمرین حسابداری",
  ],
  authors: [{ name: "حسابدار شو" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
