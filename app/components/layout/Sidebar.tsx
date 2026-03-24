"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { BarChart3, Briefcase, LineChart, LogOut } from "lucide-react";
import { useAuthStore } from "@/app/stores/auth-store";

const navItems = [
  { href: "/markets", label: "Markets", icon: BarChart3 },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="w-16 lg:w-56 h-screen fixed left-0 top-0 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-40">
      <div className="p-4 lg:px-5 flex items-center gap-2 border-b border-[var(--border)] h-14">
        <LineChart className="w-6 h-6 text-[var(--accent)] shrink-0" />
        <span className="hidden lg:block font-bold text-lg tracking-tight">REESHAW</span>
      </div>

      <nav className="flex-1 p-2 lg:p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 lg:p-3 border-t border-[var(--border)]">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--surface2)] transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </aside>
  );
}
