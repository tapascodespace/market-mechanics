"use client";

import { cn } from "@/app/lib/utils";
import { HTMLAttributes } from "react";

export default function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-[var(--surface)] border border-[var(--border)] rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
