import { OrderBookLevel, Market } from "@/app/lib/types";

export function generateOrderBook(market: Market, levels: number = 5): OrderBookLevel[] {
  const book: OrderBookLevel[] = [];
  const center = market.currentPrice;
  const tick = market.tickSize;

  for (let i = -levels; i <= levels; i++) {
    const price = center + i * tick;
    const distance = Math.abs(i);
    const baseVolume = Math.max(50000, 500000 * Math.exp(-0.3 * distance));
    book.push({
      price: parseFloat(price.toFixed(market.decimals)),
      bidSize: Math.round(baseVolume * (0.7 + Math.random() * 0.6)),
      askSize: Math.round(baseVolume * (0.7 + Math.random() * 0.6)),
    });
  }

  return book;
}

export function perturbOrderBook(book: OrderBookLevel[]): OrderBookLevel[] {
  return book.map((level) => ({
    ...level,
    bidSize: Math.max(10000, level.bidSize + Math.round((Math.random() - 0.5) * 40000)),
    askSize: Math.max(10000, level.askSize + Math.round((Math.random() - 0.5) * 40000)),
  }));
}
