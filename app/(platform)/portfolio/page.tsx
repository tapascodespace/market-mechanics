"use client";

import Link from "next/link";
import { useAuthStore } from "@/app/stores/auth-store";
import { formatCurrency } from "@/app/lib/format";
import PnLSummary from "@/app/components/portfolio/PnLSummary";
import PositionsTable from "@/app/components/portfolio/PositionsTable";
import OrderHistory from "@/app/components/portfolio/OrderHistory";
import { ArrowLeft, User } from "lucide-react";
import ThemeToggle from "@/app/components/ui/ThemeToggle";

export default function PortfolioPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="space-y-6">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/markets"
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Markets
          </Link>
          <span className="text-sm font-bold text-[var(--text)]">Portfolio</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden text-sm">
            <div className="px-3 py-1.5 border-r border-[var(--border)]">
              <span className="text-[var(--muted)] text-[10px]">Portfolio</span>
              <div className="font-medium font-mono tabular-nums text-xs">
                {user ? formatCurrency(Math.round(user.totalEquity)) : "$0"}
              </div>
            </div>
            <div className="px-3 py-1.5">
              <span className="text-[var(--muted)] text-[10px]">Cash</span>
              <div className="font-medium font-mono tabular-nums text-xs">
                {user ? formatCurrency(Math.round(user.balance)) : "$0"}
              </div>
            </div>
          </div>
          <ThemeToggle />
          <button
            onClick={logout}
            className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:brightness-110 transition-all"
            title="Logout"
          >
            {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-1">Portfolio</h1>
        <p className="text-sm text-[var(--muted)]">
          Track your positions and performance.
        </p>
      </div>

      <PnLSummary />
      <PositionsTable />
      <OrderHistory />
    </div>
  );
}
