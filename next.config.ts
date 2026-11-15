import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // فایل‌های mdx به‌عنوان مسیر در نظر گرفته نشوند (فقط از طریق import در content/ استفاده می‌شوند)
  pageExtensions: ["ts", "tsx"],
};

// فعال‌سازی پردازش MDX برای import کردن فایل‌های content/lessons/*.mdx
// توجه: جدول‌ها به‌صورت HTML table در فایل‌های MDX نوشته می‌شوند تا نیازی به remark-gfm
// (که با Turbopack سازگار نیست) نباشد.
export default createMDX(nextConfig);
