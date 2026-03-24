import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, Position, Market } from "@/app/lib/types";
import {
  calculatePnl,
  calculateInitialMargin,
  calculateMaintenanceMargin,
  calculateNotional,
  calculateMarginRatio,
  calculateFee,
} from "@/app/lib/payoff";

interface TradingState {
  positions: Position[];
  orders: Order[];
  placeOrder: (
    order: {
      marketId: string;
      marketName: string;
      side: "yes" | "no";
      price: number;
      contracts: number;
    },
    market: Market
  ) => { notionalValue: number; marginRequired: number; fee: number };
  cancelOrder: (orderId: string) => void;
  closePosition: (positionId: string, market: Market) => number;
  updateUnrealizedPnl: (marketId: string, currentPrice: number, multiplier: number) => void;
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      positions: [],
      orders: [],

      placeOrder: (orderData, market) => {
        const id = `order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const notionalValue = calculateNotional(
          orderData.price,
          orderData.contracts,
          market.notionalMultiplier
        );
        const marginRequired = calculateInitialMargin(
          orderData.price,
          orderData.contracts,
          market.notionalMultiplier,
          market.initialMarginRate
        );
        const fee = calculateFee(notionalValue, market.feeRate);

        const order: Order = {
          id,
          marketId: orderData.marketId,
          marketName: orderData.marketName,
          side: orderData.side,
          stake: marginRequired,
          payout: notionalValue,
          probability: orderData.price * 100,
          status: "filled",
          createdAt: new Date().toISOString(),
          filledAt: new Date().toISOString(),
        };

        const maintenanceMargin = calculateMaintenanceMargin(
          orderData.price,
          orderData.contracts,
          market.notionalMultiplier,
          market.maintenanceMarginRate
        );

        const position: Position = {
          id: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          marketId: orderData.marketId,
          marketName: orderData.marketName,
          side: orderData.side,
          stake: marginRequired,
          potentialPayout: notionalValue,
          entryProbability: orderData.price * 100,
          currentProbability: orderData.price * 100,
          unrealizedPnl: 0,
          entryPrice: orderData.price,
          contracts: orderData.contracts,
          notionalValue,
          initialMargin: marginRequired,
          maintenanceMargin,
          marginRatio: 1,
          openedAt: new Date().toISOString(),
        };

        set((state) => ({
          orders: [order, ...state.orders],
          positions: [position, ...state.positions],
        }));

        return { notionalValue, marginRequired, fee };
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" as const } : o
          ),
        }));
      },

      closePosition: (positionId, market) => {
        const position = get().positions.find((p) => p.id === positionId);
        if (!position) return 0;

        const notionalValue = calculateNotional(
          market.currentPrice,
          position.contracts,
          market.notionalMultiplier
        );
        const fee = calculateFee(notionalValue, market.feeRate);
        const returnAmount = position.initialMargin + position.unrealizedPnl - fee;

        set((state) => ({
          positions: state.positions.filter((p) => p.id !== positionId),
        }));

        return Math.max(0, returnAmount);
      },

      updateUnrealizedPnl: (marketId, currentPrice, multiplier) => {
        set((state) => ({
          positions: state.positions.map((p) => {
            if (p.marketId !== marketId) return p;
            const unrealizedPnl = calculatePnl(
              p.side,
              p.entryPrice,
              currentPrice,
              p.contracts,
              multiplier
            );
            const marginRatio = calculateMarginRatio(
              p.initialMargin,
              unrealizedPnl,
              p.notionalValue
            );
            return {
              ...p,
              unrealizedPnl,
              marginRatio,
            };
          }),
        }));
      },
    }),
    { name: "reeshaw-trading" }
  )
);
