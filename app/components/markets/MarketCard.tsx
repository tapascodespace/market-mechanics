"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Market } from "@/app/lib/types";
import { TrendingUp, TrendingDown } from "lucide-react";
import Sparkline from "./Sparkline";
import { generateSparkline } from "@/app/data/sparkline";
import { GlowingEffect } from "@/app/components/ui/glowing-effect";

export default function MarketCard({ market }: { market: Market }) {
  const isPositive = market.change24h >= 0;
  const sparkData = useMemo(() => generateSparkline(market), [market.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Link href={`/markets/${market.slug}`}>
      <div className="relative group h-full rounded-2xl p-[2px]">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className="relative h-full rounded-2xl glass-card flex flex-col overflow-hidden">
          <div className="p-5 md:p-6 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {market.event}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1.5 truncate">
                  {market.asset} &middot; {market.name}
                </p>
              </div>
              {/* Probability badge */}
              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-[var(--text)]">
                  {market.probability}<span className="text-base text-[var(--muted)]">%</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div
                className="inline-flex items-center gap-1.5 rounded-full py-0.5 pl-2 pr-2.5 text-xs font-medium"
                style={{
                  color: isPositive ? "var(--green)" : "var(--red)",
                  background: isPositive ? "var(--green-bg)" : "var(--red-bg)",
                }}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? "+" : ""}{market.change24h}%
              </div>
              <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                <span className="text-[var(--green)]">{market.yesPrice.toFixed(2)}</span>
                <span className="text-[var(--muted)]">/</span>
                <span className="text-[var(--red)]">{market.noPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-auto">
            <Sparkline data={sparkData} positive={isPositive} width={320} height={56} />
          </div>
        </div>
      </div>
    </Link>
  );
}
