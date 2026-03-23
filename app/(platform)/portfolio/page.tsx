"use client";

import PnLSummary from "@/app/components/portfolio/PnLSummary";
import PositionsTable from "@/app/components/portfolio/PositionsTable";
import OrderHistory from "@/app/components/portfolio/OrderHistory";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Portfolio</h1>
        <p className="text-sm text-[var(--muted)]">
          Track your positions and performance.
        </p>
      </div>

      <PnLSummary />
      <PositionsTable />
      <OrderHistory />
    </div>
  );
}
