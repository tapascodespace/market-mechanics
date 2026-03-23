"use client";

import { useState } from "react";
import { useMarketStore } from "@/app/stores/market-store";
import MarketCard from "@/app/components/markets/MarketCard";
import { cn } from "@/app/lib/utils";

const categories = ["Popular", "Rates", "Earnings", "Macro", "Sports", "Crypto"] as const;
const categoryMap: Record<string, string> = {
  Popular: "all",
  Rates: "rates",
  Earnings: "earnings",
  Macro: "macro",
  Sports: "sports",
  Crypto: "crypto",
};

export default function MarketsPage() {
  const markets = useMarketStore((s) => s.markets);
  const [activeTab, setActiveTab] = useState("Popular");

  const filterKey = categoryMap[activeTab];
  const filtered = filterKey === "all"
    ? markets
    : markets.filter((m) => m.category === filterKey);

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "px-4 py-2 text-sm rounded-full transition-all cursor-pointer",
              activeTab === cat
                ? "bg-[var(--amber)] text-black font-semibold"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Market grid — 4 columns like Forum */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>
    </div>
  );
}
