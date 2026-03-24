"use client";

import { Trade } from "@/app/lib/types";
import Card from "@/app/components/ui/Card";
import { formatNumber, formatTimeAgo } from "@/app/lib/format";

interface RecentTradesProps {
  trades: Trade[];
  decimals: number;
  unit: string;
}

export default function RecentTrades({ trades, decimals, unit }: RecentTradesProps) {
  return (
    <Card className="flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <span className="text-sm font-medium">Recent Trades</span>
      </div>
      <div className="overflow-y-auto max-h-[340px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[var(--surface)] z-10">
            <tr className="text-[var(--muted)] border-b border-[var(--border)]">
              <th className="text-left py-2 px-4 font-medium text-[10px] uppercase tracking-wider w-1/4">Time</th>
              <th className="text-left py-2 px-4 font-medium text-[10px] uppercase tracking-wider w-1/4">Price ({unit})</th>
              <th className="text-right py-2 px-4 font-medium text-[10px] uppercase tracking-wider w-1/4">Size</th>
              <th className="text-right py-2 px-4 font-medium text-[10px] uppercase tracking-wider w-1/4">Side</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 20).map((trade) => (
              <tr key={trade.id} className="border-b border-[var(--border)]/20 hover:bg-[var(--surface2)]/50 transition-colors">
                <td className="py-1.5 px-4 text-[var(--muted)] font-mono tabular-nums">
                  {formatTimeAgo(trade.timestamp)}
                </td>
                <td className="py-1.5 px-4 font-mono tabular-nums" style={{
                  color: trade.side === "long" ? "var(--green)" : "var(--red)",
                }}>
                  {formatNumber(trade.price, decimals)}
                </td>
                <td className="py-1.5 px-4 text-right font-mono tabular-nums">
                  {trade.contracts}
                </td>
                <td className="py-1.5 px-4 text-right">
                  <span
                    className="text-[10px] font-bold uppercase inline-block w-5 text-center py-0.5 rounded"
                    style={{
                      background: trade.side === "long" ? "rgba(42,173,110,0.12)" : "rgba(192,57,43,0.12)",
                      color: trade.side === "long" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {trade.side === "long" ? "B" : "S"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
