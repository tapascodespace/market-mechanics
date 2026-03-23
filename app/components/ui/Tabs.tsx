"use client";

import { cn } from "@/app/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 bg-[var(--surface2)] p-1 rounded-lg", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer",
            activeTab === tab.id
              ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
