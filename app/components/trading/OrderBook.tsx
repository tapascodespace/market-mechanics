"use client";

import { useMemo } from "react";
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
  const asks = levels
    .filter((l) => l.askSize > 0 && l.price >= currentPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);

  const bids = levels
    .filter((l) => l.bidSize > 0 && l.price <= currentPrice)
    .sort((a, b) => b.price - a.price)
    .slice(0, 8);

  // Cumulative depth for the depth chart
  const askDepth = useMemo(() => {
    let cum = 0;
    return asks.map((level) => {
      cum += level.askSize;
      return { price: level.price, cumSize: cum };
    });
  }, [asks]);

  const bidDepth = useMemo(() => {
    let cum = 0;
    return bids.map((level) => {
      cum += level.bidSize;
      return { price: level.price, cumSize: cum };
    });
  }, [bids]);

  // Compute cumulative totals for the table
  const askRows = asks.map((level, i) => {
    const cumContracts = asks.slice(0, i + 1).reduce((s, l) => s + l.askSize, 0);
    return { price: level.price, contracts: level.askSize, total: cumContracts * level.price };
  });

  const bidRows = bids.map((level, i) => {
    const cumContracts = bids.slice(0, i + 1).reduce((s, l) => s + l.bidSize, 0);
    return { price: level.price, contracts: level.bidSize, total: cumContracts * level.price };
  });

  const maxAskTotal = askRows.length > 0 ? askRows[askRows.length - 1].total : 1;
  const maxBidTotal = bidRows.length > 0 ? bidRows[bidRows.length - 1].total : 1;
  const maxTotal = Math.max(maxAskTotal, maxBidTotal);

  // Depth chart SVG dimensions
  const maxCumSize = Math.max(
    ...askDepth.map((d) => d.cumSize),
    ...bidDepth.map((d) => d.cumSize),
    1
  );

  return (
    <Card className="flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-medium">Orderbook</span>
      </div>

      {/* Depth Chart Visualization */}
      <div className="px-4 pt-3 pb-1">
        <DepthChart
          bidDepth={bidDepth}
          askDepth={askDepth}
          currentPrice={currentPrice}
          maxCumSize={maxCumSize}
        />
      </div>

      <div className="flex-1">
        {/* Column headers */}
        <div className="grid grid-cols-[60px_1fr_1fr_1fr] text-[10px] text-[var(--muted)] uppercase tracking-wider px-4 py-2 border-b border-[var(--border)]">
          <span></span>
          <span>Price</span>
          <span className="text-right">Size</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks — reversed so lowest ask is near spread */}
        <div>
          {[...askRows].reverse().slice(0, 5).map((row, i) => {
            const cumTotal = askRows.slice(0, askRows.length - i).reduce((s, r) => s + r.total, 0);
            const depthPct = (cumTotal / maxTotal) * 100;
            return (
              <div
                key={`ask-${row.price}`}
                className="grid grid-cols-[60px_1fr_1fr_1fr] items-center h-7 px-4 text-xs font-mono relative"
              >
                <div className="absolute left-0 top-0 h-full" style={{
                  width: `${Math.min(depthPct, 100) * 0.3}%`,
                  background: "rgba(192, 57, 43, 0.15)",
                }} />
                <div className="relative">
                  <span className="text-[10px] text-[var(--red)]">Ask</span>
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
          <span className="text-sm font-bold font-mono text-[var(--accent)] tabular-nums">
            {formatNumber(currentPrice, decimals)} {unit}
          </span>
        </div>

        {/* Bids */}
        <div>
          {bidRows.slice(0, 5).map((row, i) => {
            const cumTotal = bidRows.slice(0, i + 1).reduce((s, r) => s + r.total, 0);
            const depthPct = (cumTotal / maxTotal) * 100;
            return (
              <div
                key={`bid-${row.price}`}
                className="grid grid-cols-[60px_1fr_1fr_1fr] items-center h-7 px-4 text-xs font-mono relative"
              >
                <div className="absolute left-0 top-0 h-full" style={{
                  width: `${Math.min(depthPct, 100) * 0.3}%`,
                  background: "rgba(42, 173, 110, 0.15)",
                }} />
                <div className="relative">
                  <span className="text-[10px] text-[var(--green)]">Bid</span>
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

/* ── Depth Chart (staircase SVG) ── */
function DepthChart({
  bidDepth,
  askDepth,
  currentPrice,
  maxCumSize,
}: {
  bidDepth: { price: number; cumSize: number }[];
  askDepth: { price: number; cumSize: number }[];
  currentPrice: number;
  maxCumSize: number;
}) {
  const W = 400;
  const H = 100;
  const PADDING = 4;

  // Price range
  const allPrices = [
    ...bidDepth.map((d) => d.price),
    ...askDepth.map((d) => d.price),
    currentPrice,
  ];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  const toX = (price: number) => PADDING + ((price - minPrice) / priceRange) * (W - 2 * PADDING);
  const toY = (cumSize: number) => H - PADDING - (cumSize / maxCumSize) * (H - 2 * PADDING);

  // Build staircase path for bids (right to left, cumulative grows as price decreases)
  const bidPoints = [...bidDepth].reverse();
  let bidPath = "";
  let bidFill = "";
  if (bidPoints.length > 0) {
    const startX = toX(currentPrice);
    bidPath = `M ${startX} ${H - PADDING}`;
    bidFill = `M ${startX} ${H - PADDING}`;
    for (const pt of bidPoints) {
      const x = toX(pt.price);
      const y = toY(pt.cumSize);
      bidPath += ` L ${x} ${y}`;
      bidFill += ` L ${x} ${y}`;
    }
    const lastX = toX(bidPoints[bidPoints.length - 1].price);
    bidFill += ` L ${lastX} ${H - PADDING} Z`;
  }

  // Build staircase path for asks (left to right, cumulative grows as price increases)
  let askPath = "";
  let askFill = "";
  if (askDepth.length > 0) {
    const startX = toX(currentPrice);
    askPath = `M ${startX} ${H - PADDING}`;
    askFill = `M ${startX} ${H - PADDING}`;
    for (const pt of askDepth) {
      const x = toX(pt.price);
      const y = toY(pt.cumSize);
      askPath += ` L ${x} ${y}`;
      askFill += ` L ${x} ${y}`;
    }
    const lastX = toX(askDepth[askDepth.length - 1].price);
    askFill += ` L ${lastX} ${H - PADDING} Z`;
  }

  const centerX = toX(currentPrice);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
      {/* Bid fill */}
      {bidFill && (
        <path d={bidFill} fill="rgba(42, 173, 110, 0.12)" />
      )}
      {/* Ask fill */}
      {askFill && (
        <path d={askFill} fill="rgba(192, 57, 43, 0.12)" />
      )}
      {/* Bid line */}
      {bidPath && (
        <path d={bidPath} fill="none" stroke="var(--green)" strokeWidth="1.5" />
      )}
      {/* Ask line */}
      {askPath && (
        <path d={askPath} fill="none" stroke="var(--red)" strokeWidth="1.5" />
      )}
      {/* Center line */}
      <line
        x1={centerX}
        y1={PADDING}
        x2={centerX}
        y2={H - PADDING}
        stroke="var(--accent)"
        strokeWidth="0.5"
        strokeDasharray="3 2"
        opacity={0.6}
      />
    </svg>
  );
}
