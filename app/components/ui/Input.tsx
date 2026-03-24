"use client";

import { cn } from "@/app/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/40 focus:ring-2 focus:ring-[var(--accent-glow)] transition shadow-[var(--shadow-xs)]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
