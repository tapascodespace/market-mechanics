"use client";

import { useThemeStore } from "@/app/stores/theme-store";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] cursor-pointer hover:shadow-[var(--shadow-sm)] transition shadow-[var(--shadow-xs)] group"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      <div className="relative w-8 h-5 rounded-full bg-[var(--surface3)] border border-[var(--border)] transition">
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
          style={{
            left: isDark ? "calc(100% - 18px)" : "2px",
            background: isDark ? "var(--accent)" : "var(--text)",
          }}
        />
      </div>
      <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text)] transition hidden sm:block">
        {isDark ? (
          <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Light</span>
        ) : (
          <span className="flex items-center gap-1"><Moon className="w-3 h-3" /> Dark</span>
        )}
      </span>
    </button>
  );
}
