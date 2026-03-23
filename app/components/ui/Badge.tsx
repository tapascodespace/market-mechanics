"use client";

import { cn } from "@/app/lib/utils";

interface BadgeProps {
  variant?: "live" | "settled" | "halted" | "category";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "category", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full uppercase tracking-wider",
        {
          "bg-[var(--green)]/15 text-[var(--green)]": variant === "live",
          "bg-[var(--muted)]/15 text-[var(--muted)]": variant === "settled",
          "bg-[var(--red)]/15 text-[var(--red)]": variant === "halted",
          "bg-[var(--amber)]/10 text-[var(--amber)]": variant === "category",
        },
        className
      )}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
      )}
      {children}
    </span>
  );
}
