"use client";

import { useAuthStore } from "@/app/stores/auth-store";
import { formatCurrency } from "@/app/lib/format";
import { User, Wallet } from "lucide-react";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-14 fixed top-0 left-16 lg:left-56 right-0 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-6 z-30">
      <div className="text-sm text-[var(--muted)]">
        Linear Prediction Markets
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[var(--surface2)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
          <Wallet className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-sm font-medium">
            {user ? formatCurrency(user.balance) : "$0"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
            <User className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <span className="hidden sm:block text-sm text-[var(--muted)]">
            {user?.name || "Guest"}
          </span>
        </div>
      </div>
    </header>
  );
}
