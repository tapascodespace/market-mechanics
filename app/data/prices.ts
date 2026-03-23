import { OHLCData, Market } from "@/app/lib/types";

export function generatePriceHistory(market: Market, bars: number = 100): OHLCData[] {
  const data: OHLCData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const interval = 3600; // 1 hour bars
  let price = market.currentPrice - market.change24h * 2;

  for (let i = 0; i < bars; i++) {
    const volatility = market.tickSize * 2;
    const open = price;
    const change1 = (Math.random() - 0.48) * volatility;
    const change2 = (Math.random() - 0.48) * volatility;
    const high = Math.max(open, open + Math.abs(change1) + Math.abs(change2) * 0.5);
    const low = Math.min(open, open - Math.abs(change2) - Math.abs(change1) * 0.5);
    const close = open + change1 + change2 * 0.3;

    data.push({
      time: now - (bars - i) * interval,
      open: parseFloat(open.toFixed(market.decimals)),
      high: parseFloat(high.toFixed(market.decimals)),
      low: parseFloat(low.toFixed(market.decimals)),
      close: parseFloat(close.toFixed(market.decimals)),
    });

    price = close;
  }

  return data;
}

export function generateNextCandle(
  lastCandle: OHLCData,
  market: Market
): OHLCData {
  const volatility = market.tickSize * 1.5;
  const open = lastCandle.close;
  const change = (Math.random() - 0.48) * volatility;
  const close = open + change;
  const high = Math.max(open, close) + Math.random() * volatility * 0.3;
  const low = Math.min(open, close) - Math.random() * volatility * 0.3;

  return {
    time: lastCandle.time + 3600,
    open: parseFloat(open.toFixed(market.decimals)),
    high: parseFloat(high.toFixed(market.decimals)),
    low: parseFloat(low.toFixed(market.decimals)),
    close: parseFloat(close.toFixed(market.decimals)),
  };
}
