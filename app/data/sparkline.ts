import { Market } from "@/app/lib/types";

export function generateSparkline(market: Market, points: number = 24): number[] {
  const data: number[] = [];
  let price = market.currentPrice - market.change24h * 1.5;
  const volatility = market.tickSize * 0.8;

  for (let i = 0; i < points; i++) {
    const drift = (market.change24h / points) * 0.5;
    price += drift + (Math.random() - 0.48) * volatility;
    data.push(parseFloat(price.toFixed(market.decimals)));
  }

  // Ensure the last point matches current consensus
  data[data.length - 1] = market.currentPrice;
  return data;
}
