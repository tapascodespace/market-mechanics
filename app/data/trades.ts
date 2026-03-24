import { Trade, Market } from "@/app/lib/types";

let tradeCounter = 0;

export function generateRecentTrades(market: Market, count: number = 20): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const offset = (Math.random() - 0.5) * market.tickSize * 3;
    trades.push({
      id: `trade-${++tradeCounter}`,
      marketId: market.id,
      price: parseFloat((market.currentPrice + offset).toFixed(market.decimals)),
      contracts: Math.round(1 + Math.random() * 50),
      side: Math.random() > 0.5 ? "yes" : "no",
      timestamp: new Date(now - i * (5000 + Math.random() * 30000)).toISOString(),
    });
  }

  return trades;
}

export function generateSingleTrade(market: Market): Trade {
  const offset = (Math.random() - 0.5) * market.tickSize * 2;
  return {
    id: `trade-${++tradeCounter}`,
    marketId: market.id,
    price: parseFloat((market.currentPrice + offset).toFixed(market.decimals)),
    contracts: Math.round(1 + Math.random() * 30),
    side: Math.random() > 0.5 ? "yes" : "no",
    timestamp: new Date().toISOString(),
  };
}
