"use client";

import { Market } from "@/app/lib/types";
import Badge from "@/app/components/ui/Badge";
import { formatNumber, formatCompact, daysUntil } from "@/app/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarketHeader({ market }: { market: Market }) {
  const isPositive = market.change24h >= 0;
  const changePct = market.previousClose
    ? ((market.change24h / market.previousClose) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-2">
      {/* Top bar: name + inline stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-lg font-bold mr-1">{market.name}</h1>
        <Badge variant={market.status}>{market.status}</Badge>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--muted)] ml-auto">
          <StatChip label="Volume" value={formatCompact(market.volume24h)} />
          <StatChip label="OI" value={formatCompact(market.openInterest)} />
          <StatChip label="Insurance" value={formatCompact(market.insuranceFund)} />
          <StatChip label="Settlement" value={`${daysUntil(market.settlementDate)}d`} />
          <StatChip label="Margin" value={`${(market.initialMarginRate * 100).toFixed(0)}%`} />
        </div>
      </div>

      {/* Price line */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold font-mono tabular-nums">
          {formatNumber(market.currentPrice, market.decimals)}
        </span>
        <span className="text-sm text-[var(--muted)]">{market.unit}</span>
        <div
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
        >
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {isPositive ? "+" : ""}{formatNumber(market.change24h, market.decimals)} ({isPositive ? "+" : ""}{changePct}%)
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">{market.description}</p>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-md px-2.5 py-1">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="text-[var(--text)] font-mono font-medium">{value}</span>
    </div>
  );
}
