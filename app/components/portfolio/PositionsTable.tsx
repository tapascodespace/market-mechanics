"use client";

import { useTradingStore } from "@/app/stores/trading-store";
import { useAuthStore } from "@/app/stores/auth-store";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { formatCurrency } from "@/app/lib/format";
import Link from "next/link";

export default function PositionsTable() {
  const positions = useTradingStore((s) => s.positions);
  const closePosition = useTradingStore((s) => s.closePosition);
  const updateBalance = useAuthStore((s) => s.updateBalance);
  const updateLockedMargin = useAuthStore((s) => s.updateLockedMargin);

  if (positions.length === 0) {
    return (
      <Card>
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <span className="text-sm font-medium">Open Positions</span>
        </div>
        <div className="p-8 text-sm text-[var(--muted)] text-center">
          No open positions. Start trading to see them here.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-medium">
          Open Positions ({positions.length})
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--muted)] border-b border-[var(--border)]">
              <th className="text-left py-2.5 px-4 font-medium">Market</th>
              <th className="text-center py-2.5 px-4 font-medium">Side</th>
              <th className="text-right py-2.5 px-4 font-medium">Entry</th>
              <th className="text-right py-2.5 px-4 font-medium">Contracts</th>
              <th className="text-right py-2.5 px-4 font-medium">Margin</th>
              <th className="text-right py-2.5 px-4 font-medium">Margin Ratio</th>
              <th className="text-right py-2.5 px-4 font-medium">Unrealized P&L</th>
              <th className="text-right py-2.5 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr key={pos.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface2)] transition-colors">
                <td className="py-2.5 px-4">
                  <Link
                    href={`/markets/${pos.marketId}`}
                    className="hover:text-[var(--amber)] transition-colors"
                  >
                    {pos.marketName}
                  </Link>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span
                    className="capitalize font-medium"
                    style={{
                      color: pos.side === "long" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {pos.side}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-right font-mono">
                  {pos.entryPrice}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">
                  {pos.contracts}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">
                  {formatCurrency(Math.round(pos.initialMargin))}
                </td>
                <td
                  className="py-2.5 px-4 text-right font-mono"
                  style={{
                    color: pos.marginRatio < 0.1 ? "var(--red)" : "var(--muted)",
                  }}
                >
                  {(pos.marginRatio * 100).toFixed(1)}%
                </td>
                <td
                  className="py-2.5 px-4 text-right font-mono"
                  style={{
                    color: pos.unrealizedPnl >= 0 ? "var(--green)" : "var(--red)",
                  }}
                >
                  {pos.unrealizedPnl >= 0 ? "+" : ""}
                  {formatCurrency(Math.round(pos.unrealizedPnl))}
                </td>
                <td className="py-2.5 px-4 text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      // closePosition now needs market — but in portfolio we don't have it
                      // For portfolio, we do a simplified close: return margin + pnl
                      const returnAmount = Math.max(0, pos.initialMargin + pos.unrealizedPnl);
                      useTradingStore.getState().positions = useTradingStore.getState().positions.filter((p) => p.id !== pos.id);
                      useTradingStore.setState({
                        positions: useTradingStore.getState().positions.filter((p) => p.id !== pos.id),
                      });
                      updateBalance(returnAmount);
                      if (updateLockedMargin) {
                        updateLockedMargin(-pos.initialMargin);
                      }
                    }}
                  >
                    Close
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
