"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/app/stores/market-store";
import { useTradingStore } from "@/app/stores/trading-store";
import { perturbOrderBook } from "@/app/data/orderbook";
import { generateSingleTrade } from "@/app/data/trades";

export function useMarketSimulation(marketId: string | null) {
  useEffect(() => {
    if (!marketId) return;

    const interval = setInterval(() => {
      const market = useMarketStore.getState().selectedMarket;
      if (!market) return;

      const { updatePrice, setOrderBook, addTrade, orderBook } =
        useMarketStore.getState();
      const { updateUnrealizedPnl } = useTradingStore.getState();

      // Random walk the price
      const change = (Math.random() - 0.48) * market.tickSize * 1.5;
      const newPrice = market.currentPrice + change;
      updatePrice(market.id, newPrice);

      // Perturb order book
      if (orderBook.length > 0) {
        setOrderBook(perturbOrderBook(orderBook));
      }

      // Generate a trade
      addTrade(generateSingleTrade({ ...market, currentPrice: newPrice }));

      // Update unrealized P&L
      updateUnrealizedPnl(market.id, newPrice, market.notionalMultiplier);
    }, 2000);

    return () => clearInterval(interval);
  }, [marketId]);
}
