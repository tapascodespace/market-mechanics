"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/app/stores/theme-store";

export default function ThemeInit() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return null;
}
