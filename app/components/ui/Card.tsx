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
        "glass-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
