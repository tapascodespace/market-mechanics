"use client";

import { useTradingStore } from "@/app/stores/trading-store";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import { formatCurrency, formatTimeAgo } from "@/app/lib/format";

export default function OrderHistory() {
  const orders = useTradingStore((s) => s.orders);

  if (orders.length === 0) {
    return (
      <Card>
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <span className="text-sm font-semibold">Order History</span>
        </div>
        <div className="p-8 text-sm text-[var(--muted)] text-center">
          No orders yet.
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <span className="text-sm font-semibold">Order History ({orders.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--muted)] border-b border-[var(--border)]">
              <th className="text-left py-2.5 px-5 font-medium">Time</th>
              <th className="text-left py-2.5 px-5 font-medium">Market</th>
              <th className="text-center py-2.5 px-5 font-medium">Side</th>
              <th className="text-right py-2.5 px-5 font-medium">Stake</th>
              <th className="text-right py-2.5 px-5 font-medium">Payout</th>
              <th className="text-center py-2.5 px-5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--border)]/50">
                <td className="py-2.5 px-5 text-[var(--muted)]">
                  {formatTimeAgo(order.createdAt)}
                </td>
                <td className="py-2.5 px-5">{order.marketName}</td>
                <td className="py-2.5 px-5 text-center">
                  <span
                    className="capitalize font-medium"
                    style={{
                      color: order.side === "yes" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {order.side}
                  </span>
                </td>
                <td className="py-2.5 px-5 text-right font-mono">
                  {formatCurrency(Math.round(order.stake))}
                </td>
                <td className="py-2.5 px-5 text-right font-mono">
                  {formatCurrency(Math.round(order.payout))}
                </td>
                <td className="py-2.5 px-5 text-center">
                  <Badge
                    variant={
                      order.status === "filled"
                        ? "live"
                        : order.status === "cancelled"
                        ? "halted"
                        : "category"
                    }
                  >
                    {order.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
