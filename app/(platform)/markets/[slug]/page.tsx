"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useMarketStore } from "@/app/stores/market-store";
import { useMarketSimulation } from "@/hooks/use-market-simulation";
import MarketHeader from "@/app/components/trading/MarketHeader";
import PriceChart from "@/app/components/trading/PriceChart";
import OrderBook from "@/app/components/trading/OrderBook";
import TradePanel from "@/app/components/trading/TradePanel";
import PayoffCurve from "@/app/components/trading/PayoffCurve";
import PositionSummary from "@/app/components/trading/PositionSummary";
import RecentTrades from "@/app/components/trading/RecentTrades";

export default function MarketPage() {
  const params = useParams();
  const slug = params.slug as string;
  const market = useMarketStore((s) => s.selectedMarket);
  const orderBook = useMarketStore((s) => s.orderBook);
  const recentTrades = useMarketStore((s) => s.recentTrades);
  const initialized = useRef(false);

  // Shared trade form state — drives both TradePanel and PayoffCurve
  const [side, setSide] = useState<"long" | "short">("long");
  const [price, setPrice] = useState<number>(0);
  const [contracts, setContracts] = useState(1);
  const priceInitialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    useMarketStore.getState().selectMarket(slug);
  }, [slug]);

  // Initialize price from market once loaded
  useEffect(() => {
    if (market && !priceInitialized.current) {
      setPrice(market.currentPrice);
      priceInitialized.current = true;
    }
  }, [market]);

  useMarketSimulation(market?.id ?? null);

  if (!market) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-6 h-6 border-2 border-[var(--amber)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <MarketHeader market={market} />

      {/* Main: Chart (left) + Trade Panel (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left column: chart + order book + payoff */}
        <div className="space-y-6">
          <PriceChart market={market} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrderBook
              levels={orderBook}
              currentPrice={market.currentPrice}
              decimals={market.decimals}
              unit={market.unit}
            />
            <PayoffCurve
              market={market}
              entryPrice={price}
              contracts={contracts}
              side={side}
            />
          </div>
        </div>

        {/* Right column: trade panel + positions */}
        <div className="space-y-6">
          <TradePanel
            market={market}
            side={side}
            onSideChange={setSide}
            price={price}
            onPriceChange={setPrice}
            contracts={contracts}
            onContractsChange={setContracts}
          />
          <PositionSummary market={market} />
        </div>
      </div>

      {/* Recent trades - full width */}
      <RecentTrades
        trades={recentTrades}
        decimals={market.decimals}
        unit={market.unit}
      />
    </div>
  );
}
