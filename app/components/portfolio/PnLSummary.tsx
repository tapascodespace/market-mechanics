"use client";

import { useAuthStore } from "@/app/stores/auth-store";
import { useTradingStore } from "@/app/stores/trading-store";
import Card from "@/app/components/ui/Card";
import { formatCurrency } from "@/app/lib/format";
import { Wallet, TrendingUp, BarChart3, DollarSign, Lock } from "lucide-react";

export default function PnLSummary() {
  const user = useAuthStore((s) => s.user);
  const positions = useTradingStore((s) => s.positions);
  const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const totalLockedMargin = positions.reduce((sum, p) => sum + p.initialMargin, 0);
  const totalEquity = (user?.balance || 0) + totalLockedMargin + totalUnrealizedPnl;

  const stats = [
    {
      label: "Total Equity",
      value: formatCurrency(Math.round(totalEquity)),
      icon: DollarSign,
      color: "var(--accent)",
    },
    {
      label: "Available Balance",
      value: formatCurrency(user?.balance || 0),
      icon: Wallet,
      color: "var(--text)",
    },
    {
      label: "Locked Margin",
      value: formatCurrency(Math.round(totalLockedMargin)),
      icon: Lock,
      color: "var(--muted)",
    },
    {
      label: "Unrealized P&L",
      value: `${totalUnrealizedPnl >= 0 ? "+" : ""}${formatCurrency(Math.round(totalUnrealizedPnl))}`,
      icon: TrendingUp,
      color: totalUnrealizedPnl >= 0 ? "var(--green)" : "var(--red)",
    },
    {
      label: "Open Positions",
      value: positions.length.toString(),
      icon: BarChart3,
      color: "var(--muted)",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${stat.color}15` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-xs text-[var(--muted)]">{stat.label}</div>
              <div className="text-lg font-bold font-mono" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
