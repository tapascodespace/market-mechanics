"use client";

import { OrderBookLevel } from "@/app/lib/types";
import Card from "@/app/components/ui/Card";
import { formatNumber, formatCompact } from "@/app/lib/format";

interface OrderBookProps {
  levels: OrderBookLevel[];
  currentPrice: number;
  decimals: number;
  unit: string;
}

export default function OrderBook({ levels, currentPrice, decimals, unit }: OrderBookProps) {
  // Split into asks (above) and bids (below)
  const asks = levels
    .filter((l) => l.askSize > 0 && l.price >= currentPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 5);

  const bids = levels
    .filter((l) => l.bidSize > 0 && l.price <= currentPrice)
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);

  // Compute cumulative totals
  const askRows = asks.map((level, i) => {
    const cumContracts = asks.slice(0, i + 1).reduce((s, l) => s + l.askSize, 0);
    return { price: level.price, contracts: level.askSize, total: cumContracts * level.price };
  });

  const bidRows = bids.map((level, i) => {
    const cumContracts = bids.slice(0, i + 1).reduce((s, l) => s + l.bidSize, 0);
    return { price: level.price, contracts: level.bidSize, total: cumContracts * level.price };
  });

  // Max cumulative for depth bar scaling
  const maxAskTotal = askRows.length > 0 ? askRows[askRows.length - 1].total : 1;
  const maxBidTotal = bidRows.length > 0 ? bidRows[bidRows.length - 1].total : 1;
  const maxTotal = Math.max(maxAskTotal, maxBidTotal);

  return (
    <Card className="flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-medium">Orderbook</span>
      </div>

      <div className="flex-1">
        {/* Column headers */}
        <div className="grid grid-cols-[80px_1fr_1fr_1fr] text-[10px] text-[var(--muted)] uppercase tracking-wider px-4 py-2 border-b border-[var(--border)]">
          <span></span>
          <span>Price</span>
          <span className="text-right">Contracts</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks — reversed so lowest ask is near spread */}
        <div>
          {[...askRows].reverse().map((row, i) => {
            const cumTotal = askRows.slice(0, askRows.length - i).reduce((s, r) => s + r.total, 0);
            const depthPct = (cumTotal / maxTotal) * 100;
            return (
              <div
                key={`ask-${row.price}`}
                className="grid grid-cols-[80px_1fr_1fr_1fr] items-center h-7 px-4 text-xs font-mono relative"
              >
                {/* Depth bar - grows from left */}
                <div className="absolute left-0 top-0 h-full" style={{
                  width: `${Math.min(depthPct, 100) * 0.3}%`,
                  background: "rgba(192, 57, 43, 0.15)",
                }} />
                <div className="relative">
                  <span className="text-[10px] text-[var(--red)]">Asks</span>
                </div>
                <span className="relative text-[var(--red)]">
                  {formatNumber(row.price, decimals)}
                </span>
                <span className="relative text-right tabular-nums">
                  {row.contracts}
                </span>
                <span className="relative text-right tabular-nums text-[var(--muted)]">
                  {formatCompact(Math.round(row.total))}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spread / Last price */}
        <div className="flex items-center gap-2 px-4 py-2 border-y border-[var(--border)] bg-[var(--surface2)]">
          <span className="text-xs text-[var(--muted)]">Last</span>
          <span className="text-sm font-bold font-mono text-[var(--amber)] tabular-nums">
            {formatNumber(currentPrice, decimals)} {unit}
          </span>
        </div>

        {/* Bids */}
        <div>
          {bidRows.map((row, i) => {
            const cumTotal = bidRows.slice(0, i + 1).reduce((s, r) => s + r.total, 0);
            const depthPct = (cumTotal / maxTotal) * 100;
            return (
              <div
                key={`bid-${row.price}`}
                className="grid grid-cols-[80px_1fr_1fr_1fr] items-center h-7 px-4 text-xs font-mono relative"
              >
                {/* Depth bar - grows from left */}
                <div className="absolute left-0 top-0 h-full" style={{
                  width: `${Math.min(depthPct, 100) * 0.3}%`,
                  background: "rgba(42, 173, 110, 0.15)",
                }} />
                <div className="relative">
                  <span className="text-[10px] text-[var(--green)]">Bids</span>
                </div>
                <span className="relative text-[var(--green)]">
                  {formatNumber(row.price, decimals)}
                </span>
                <span className="relative text-right tabular-nums">
                  {row.contracts}
                </span>
                <span className="relative text-right tabular-nums text-[var(--muted)]">
                  {formatCompact(Math.round(row.total))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
