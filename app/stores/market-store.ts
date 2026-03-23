import { create } from "zustand";
import { Market, OrderBookLevel, Trade } from "@/app/lib/types";
import { MOCK_MARKETS } from "@/app/data/markets";
import { generateOrderBook } from "@/app/data/orderbook";
import { generateRecentTrades } from "@/app/data/trades";

interface MarketState {
  markets: Market[];
  selectedMarket: Market | null;
  orderBook: OrderBookLevel[];
  recentTrades: Trade[];
  selectMarket: (slug: string) => void;
  updatePrice: (marketId: string, newPrice: number) => void;
  setOrderBook: (book: OrderBookLevel[]) => void;
  addTrade: (trade: Trade) => void;
}

export const useMarketStore = create<MarketState>()((set, get) => ({
  markets: MOCK_MARKETS,
  selectedMarket: null,
  orderBook: [],
  recentTrades: [],

  selectMarket: (slug) => {
    const market = get().markets.find((m) => m.slug === slug) || null;
    if (market) {
      set({
        selectedMarket: market,
        orderBook: generateOrderBook(market),
        recentTrades: generateRecentTrades(market),
      });
    }
  },

  updatePrice: (marketId, newPrice) => {
    set((state) => ({
      markets: state.markets.map((m) =>
        m.id === marketId
          ? {
              ...m,
              change24h: parseFloat((newPrice - m.previousClose).toFixed(m.decimals)),
              currentPrice: parseFloat(newPrice.toFixed(m.decimals)),
            }
          : m
      ),
      selectedMarket:
        state.selectedMarket?.id === marketId
          ? {
              ...state.selectedMarket,
              change24h: parseFloat(
                (newPrice - state.selectedMarket.previousClose).toFixed(
                  state.selectedMarket.decimals
                )
              ),
              currentPrice: parseFloat(
                newPrice.toFixed(state.selectedMarket.decimals)
              ),
            }
          : state.selectedMarket,
    }));
  },

  setOrderBook: (book) => set({ orderBook: book }),

  addTrade: (trade) => {
    set((state) => ({
      recentTrades: [trade, ...state.recentTrades.slice(0, 49)],
    }));
  },
}));
