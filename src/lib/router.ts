"use client";

import { useEffect, useState, useCallback } from "react";

/** مسیر فعلی را از hash می‌خواند (مثلاً "/dashboard" یا "/lessons/asset-liability"). */
export function getHashPath(): string {
  if (typeof window === "undefined") return "/";
  const h = window.location.hash.replace(/^#\/?/, "");
  const clean = h.startsWith("/") ? h.slice(1) : h;
  return "/" + clean;
}

/** هوک گوش‌به‌شنوا به تغییرات hash. */
export function useHashRoute(): string {
  const [path, setPath] = useState(getHashPath());
  useEffect(() => {
    const onChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onChange);
    if (!window.location.hash) window.location.hash = "#/";
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

/** تغییر مسیر بدون reload. */
export function navigate(path: string) {
  const clean = path.startsWith("/") ? path : "/" + path;
  window.location.hash = "#" + clean;
}

/** تطبیق الگو با پارامترها: matchRoute("/lessons/x", "/lessons/:slug") → {slug:"x"} */
export function matchRoute(
  path: string,
  pattern: string,
): Record<string, string> | null {
  const ps = pattern.split("/").filter(Boolean);
  const as = path.split("/").filter(Boolean);
  if (ps.length !== as.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < ps.length; i++) {
    if (ps[i].startsWith(":")) {
      params[ps[i].slice(1)] = decodeURIComponent(as[i]);
    } else if (ps[i] !== as[i]) {
      return null;
    }
  }
  return params;
}

/** آیا مسیر当前的 با الگوی داده‌شده مطابقت دارد. */
export function useIsRoute(pattern: string): boolean {
  const path = useHashRoute();
  return matchRoute(path, pattern) !== null || path === pattern;
}

export function useNavigate() {
  return useCallback((path: string) => navigate(path), []);
}
