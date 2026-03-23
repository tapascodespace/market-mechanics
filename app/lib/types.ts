/**
 * Types for Reeshaw Linear Prediction Markets
 *
 * Based on the paper: "Linear Payoffs and the Next Architecture of Prediction Markets"
 * by Tapas Banerjee and Rorie Simpson (March 2026)
 *
 * Core mechanic: profit = (V - P) × N for longs, (P - V) × N for shorts
 * where V = settlement value, P = entry price, N = number of contracts
 */

export interface Market {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: "rates" | "earnings" | "macro" | "sports" | "crypto";
  description: string;
  unit: string;
  decimals: number;
  tickSize: number;
  notionalMultiplier: number;      // N — dollar P&L per unit move per contract
  initialMarginRate: number;       // 8-15% of notional (from paper Section 3.3)
  maintenanceMarginRate: number;   // trigger level for liquidation
  maxLeverage: number;             // derived from initial margin
  currentPrice: number;            // market-implied forward price (CLOB mid-price)
  previousClose: number;
  change24h: number;
  volume24h: number;
  openInterest: number;
  insuranceFund: number;           // pooled reserve (paper Section 3.3)
  feeRate: number;                 // 2-5 bps of notional (paper Section 3.3)
  settlementDate: string;
  status: "live" | "halted" | "settled";
  outcome?: number;                // actual observed value (set by oracle at expiry)
}

export interface OrderBookLevel {
  price: number;
  bidSize: number;     // number of contracts
  askSize: number;
}

export interface Order {
  id: string;
  marketId: string;
  marketName: string;
  side: "long" | "short";
  price: number;             // entry price P
  contracts: number;         // number of contracts N
  notionalValue: number;     // price × contracts × multiplier
  marginRequired: number;    // initial margin posted
  status: "open" | "filled" | "cancelled" | "liquidated";
  createdAt: string;
  filledAt?: string;
}

export interface Position {
  id: string;
  marketId: string;
  marketName: string;
  side: "long" | "short";
  entryPrice: number;        // P — the price at which position was opened
  contracts: number;         // N — number of contracts
  notionalValue: number;     // entryPrice × contracts × multiplier
  initialMargin: number;     // margin posted at open
  maintenanceMargin: number; // liquidation trigger level
  unrealizedPnl: number;    // (currentPrice - entryPrice) × contracts × multiplier [for long]
  marginRatio: number;       // (initialMargin + unrealizedPnl) / notionalValue
  openedAt: string;
}

export interface Trade {
  id: string;
  marketId: string;
  price: number;
  contracts: number;
  side: "long" | "short";
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;        // available cash (not locked in margin)
  lockedMargin: number;   // total margin locked in positions
  totalEquity: number;    // balance + lockedMargin + totalUnrealizedPnl
}

export interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VariationMarginEvent {
  positionId: string;
  marketId: string;
  previousPrice: number;
  newPrice: number;
  dailyPnl: number;
  timestamp: string;
}
