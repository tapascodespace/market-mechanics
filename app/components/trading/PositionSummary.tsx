"use client";

import { useMemo } from "react";
import { Market } from "@/app/lib/types";
import { useTradingStore } from "@/app/stores/trading-store";
import { useAuthStore } from "@/app/stores/auth-store";
import { calculateLiquidationPrice } from "@/app/lib/payoff";
import Card from "@/app/components/ui/Card";
import { formatCurrency, formatNumber } from "@/app/lib/format";
import { TrendingUp, TrendingDown, X } from "lucide-react";

export default function PositionSummary({ market }: { market: Market }) {
  const allPositions = useTradingStore((s) => s.positions);
  const closePosition = useTradingStore((s) => s.closePosition);
  const updateBalance = useAuthStore((s) => s.updateBalance);
  const updateLockedMargin = useAuthStore((s) => s.updateLockedMargin);
  const positions = useMemo(
    () => allPositions.filter((p) => p.marketId === market.id),
    [allPositions, market.id]
  );

  return (
    <Card className="flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-medium">Your Positions</span>
        {positions.length > 0 && (
          <span className="text-xs text-[var(--muted)] bg-[var(--surface2)] px-2 py-0.5 rounded-full font-mono">
            {positions.length}
          </span>
        )}
      </div>

      {positions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--surface2)] flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--muted)]" />
            </div>
            <p className="text-sm text-[var(--muted)]">No open positions</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Place an order to get started</p>
          </div>
        </div>
      ) : (
        <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-64">
          {positions.map((pos) => {
            const liqPrice = calculateLiquidationPrice(
              pos.side,
              pos.entryPrice,
              pos.initialMargin,
              pos.contracts,
              market.notionalMultiplier,
              market.maintenanceMarginRate
            );
            const isProfit = pos.unrealizedPnl >= 0;

            return (
              <div
                key={pos.id}
                className="bg-[var(--bg)] rounded-lg p-3 border border-[var(--border)] group"
              >
                {/* Header: side + P&L + close */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                      style={{
                        background: pos.side === "yes" ? "rgba(42,173,110,0.15)" : "rgba(192,57,43,0.15)",
                        color: pos.side === "yes" ? "var(--green)" : "var(--red)",
                      }}
                    >
                      {pos.side}
                    </span>
                    <span className="text-sm font-mono tabular-nums">
                      {pos.contracts} @ {formatNumber(pos.entryPrice, market.decimals)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const returnAmount = closePosition(pos.id, market);
                      updateBalance(returnAmount);
                      if (updateLockedMargin) {
                        updateLockedMargin(-pos.initialMargin);
                      }
                    }}
                    className="p-1 rounded hover:bg-[var(--red)]/10 text-[var(--muted)] hover:text-[var(--red)] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Close position"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* P&L */}
                <div className="flex items-center gap-1 mb-2">
                  {isProfit ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--green)]" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-[var(--red)]" />
                  )}
                  <span
                    className="text-sm font-bold font-mono tabular-nums"
                    style={{ color: isProfit ? "var(--green)" : "var(--red)" }}
                  >
                    {isProfit ? "+" : ""}{formatCurrency(Math.round(pos.unrealizedPnl))}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Margin</span>
                    <span className="font-mono tabular-nums">{formatCurrency(Math.round(pos.initialMargin))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Ratio</span>
                    <span className="font-mono tabular-nums">{(pos.marginRatio * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Notional</span>
                    <span className="font-mono tabular-nums">{formatCurrency(Math.round(pos.notionalValue))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Liq Price</span>
                    <span className="font-mono tabular-nums text-[var(--red)]">
                      {formatNumber(liqPrice, market.decimals)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
