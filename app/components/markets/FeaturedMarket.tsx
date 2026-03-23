"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Market } from "@/app/lib/types";
import { formatNumber } from "@/app/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import Sparkline from "./Sparkline";
import { generateSparkline } from "@/app/data/sparkline";

export default function FeaturedMarket({ market }: { market: Market }) {
  const isPositive = market.change24h >= 0;
  const sparkData = useMemo(() => generateSparkline(market, 48), [market.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const changePercent = market.previousClose
    ? ((market.change24h / market.previousClose) * 100).toFixed(2)
    : "0.00";

  return (
    <Link href={`/markets/${market.slug}`}>
      <div className="border border-[var(--border)] rounded-xl bg-[var(--surface)] hover:border-[var(--amber)]/30 transition-all cursor-pointer group">
        <div className="p-6">
          <div className="text-xs text-[var(--amber)] font-semibold uppercase tracking-wider mb-3">
            Featured Market
          </div>

          <div className="flex items-start justify-between gap-8">
            {/* Left side - info */}
            <div className="flex-shrink-0">
              <h2 className="text-xl font-bold mb-1 group-hover:text-[var(--amber)] transition-colors">
                {market.name}
              </h2>
              <div className="text-3xl font-bold font-mono tracking-tight mb-2">
                {formatNumber(market.currentPrice, market.decimals)}
                <span className="text-base text-[var(--muted)] font-normal ml-1">{market.unit}</span>
              </div>
              <div
                className="flex items-center gap-1.5 text-sm font-medium mb-4"
                style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? "+" : ""}{changePercent}% today
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-[var(--muted)]">Market Price</span>
                  <span className="font-mono">{formatNumber(market.currentPrice, market.decimals)} {market.unit}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[var(--muted)]">Settlement</span>
                  <span className="font-mono">{market.settlementDate}</span>
                </div>
              </div>

              <p className="text-xs text-[var(--muted)] mt-3 max-w-xs">
                {market.description}. Linear payoff: profit = (V - P) x N per contract.
              </p>
            </div>

            {/* Right side - chart */}
            <div className="flex-1 min-w-0 flex items-end justify-end">
              <Sparkline data={sparkData} positive={isPositive} width={320} height={100} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
