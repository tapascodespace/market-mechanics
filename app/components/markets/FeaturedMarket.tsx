"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Market } from "@/app/lib/types";
import { formatCompact, daysUntil } from "@/app/lib/format";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Sparkline from "./Sparkline";
import { generateSparkline } from "@/app/data/sparkline";
import { GlowingEffect } from "@/app/components/ui/glowing-effect";

export default function FeaturedMarket({ market }: { market: Market }) {
  const isPositive = market.change24h >= 0;
  const sparkData = useMemo(() => generateSparkline(market, 48), [market.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Link href={`/markets/${market.slug}`}>
      <div className="relative rounded-2xl p-[2px] group">
        <GlowingEffect
          spread={60}
          glow={true}
          disabled={false}
          proximity={80}
          inactiveZone={0.01}
          borderWidth={2}
          blur={3}
        />
        <div className="relative rounded-2xl glass-card overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Left: Info */}
            <div className="p-6 md:p-8 flex flex-col">
              {/* Badge */}
              <div className="flex items-center gap-2.5 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full py-0.5 pl-2.5 pr-3 text-xs font-semibold text-white bg-[var(--accent)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                  Featured
                </span>
                <span className="text-xs text-[var(--muted)]">{market.asset}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight mb-2">
                {market.event}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-md">
                {market.resolvesYesIf}
              </p>

              {/* Big probability */}
              <div className="mb-6">
                <div className="text-5xl font-bold font-mono tracking-tighter chromatic-text leading-none">
                  {market.probability}<span className="text-2xl">%</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1.5 font-medium uppercase tracking-wider">Implied probability</p>
              </div>

              {/* Stat cards row */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <StatCard label="Yes" value={`$${market.yesPrice.toFixed(2)}`} color="var(--green)" />
                <StatCard label="No" value={`$${market.noPrice.toFixed(2)}`} color="var(--red)" />
                <StatCard label="Volume" value={`$${formatCompact(market.volume24h)}`} />
                <StatCard label="Settles in" value={`${daysUntil(market.settlementDate)} days`} />
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between mt-auto pt-4">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full py-0.5 pl-2 pr-2.5 text-xs font-semibold"
                  style={{
                    color: isPositive ? "var(--green)" : "var(--red)",
                    background: isPositive ? "var(--green-bg)" : "var(--red-bg)",
                  }}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositive ? "+" : ""}{market.change24h}% today
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] group-hover:gap-2 transition-all">
                  Trade <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Right: Chart */}
            <div className="flex items-end p-3 md:p-5">
              <Sparkline data={sparkData} positive={isPositive} width={600} height={280} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl bg-[var(--surface2)] border border-[var(--border)] p-3">
      <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className="text-sm font-bold font-mono tabular-nums" style={color ? { color } : undefined}>{value}</p>
    </div>
  );
}
