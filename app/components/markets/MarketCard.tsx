"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Market } from "@/app/lib/types";
import { formatNumber } from "@/app/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import Sparkline from "./Sparkline";
import { generateSparkline } from "@/app/data/sparkline";

export default function MarketCard({ market }: { market: Market }) {
  const isPositive = market.change24h >= 0;
  const sparkData = useMemo(() => generateSparkline(market), [market.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const changePercent = market.previousClose
    ? ((market.change24h / market.previousClose) * 100).toFixed(2)
    : "0.00";

  return (
    <Link href={`/markets/${market.slug}`}>
      <div className="group bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--amber)]/40 transition-all cursor-pointer h-full">
        <div className="p-5">
          {/* Row 1: Name + Price */}
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-[15px] text-[var(--text)] group-hover:text-[var(--amber)] transition-colors leading-tight">
              {market.shortName}
            </h3>
            <span className="text-sm font-semibold font-mono tabular-nums text-right shrink-0 ml-3">
              {formatNumber(market.currentPrice, market.decimals)}
              <span className="text-xs text-[var(--muted)] font-normal ml-0.5">{market.unit}</span>
            </span>
          </div>

          {/* Row 2: Full name + change% */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[var(--muted)] truncate mr-2">
              {market.name}
            </span>
            <span
              className="text-xs font-medium shrink-0"
              style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
            >
              {isPositive ? "+" : ""}{changePercent}%
            </span>
          </div>

          {/* Row 3: Change + sparkline */}
          <div className="flex items-end justify-between">
            <div
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositive ? "+" : ""}{formatNumber(market.change24h, market.decimals)} ({isPositive ? "+" : ""}{changePercent}%)
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-3">
            <Sparkline data={sparkData} positive={isPositive} width={280} height={48} />
          </div>
        </div>
      </div>
    </Link>
  );
}
