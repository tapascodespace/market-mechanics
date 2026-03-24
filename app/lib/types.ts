/**
 * Types for Reeshaw — Asset-Centric Prediction Markets
 *
 * Security-based swaps: trade probabilities tied to real financial assets.
 * Core mechanic: Stake amount → Payout if outcome is correct, else £0.
 */

export interface Market {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: "rates" | "earnings" | "macro" | "sports" | "crypto" | "equity" | "fx" | "commodities";
  description: string;

  // ── Asset context ──
  asset: string;                      // e.g., "NVIDIA", "Bitcoin", "EUR/USD"
  event: string;                      // e.g., "Q2 Revenue > $32B"
  resolutionSource: string;           // e.g., "Official earnings release"
  resolvesYesIf: string;             // e.g., "NVIDIA Q2 2026 revenue exceeds $32B"

  // ── Probability (the core number) ──
  probability: number;                // 0-100, market-implied probability
  previousProbability: number;        // previous close probability
  change24h: number;                  // probability change (e.g., +3.2)

  // ── Payoff ──
  yesPrice: number;                   // cost of YES share (0.01 - 0.99)
  noPrice: number;                    // cost of NO share (1 - yesPrice)

  // ── Market stats ──
  volume24h: number;
  openInterest: number;
  settlementDate: string;
  status: "live" | "halted" | "settled";
  outcome?: "yes" | "no";            // set at resolution

  // ── Legacy fields (kept for chart/sparkline compat) ──
  unit: string;
  decimals: number;
  tickSize: number;
  currentPrice: number;               // = probability / 100 for chart
  previousClose: number;
  notionalMultiplier: number;
  initialMarginRate: number;
  maintenanceMarginRate: number;
  maxLeverage: number;
  insuranceFund: number;
  feeRate: number;
}

export interface Bet {
  id: string;
  marketId: string;
  marketName: string;
  side: "yes" | "no";
  stake: number;                      // amount risked
  payout: number;                     // amount if correct
  probability: number;                // probability at time of bet
  createdAt: string;
  status: "open" | "won" | "lost" | "cancelled";
}

export interface Position {
  id: string;
  marketId: string;
  marketName: string;
  side: "yes" | "no";
  stake: number;
  potentialPayout: number;
  entryProbability: number;
  currentProbability: number;
  unrealizedPnl: number;
  openedAt: string;

  // Legacy compat
  entryPrice: number;
  contracts: number;
  notionalValue: number;
  initialMargin: number;
  maintenanceMargin: number;
  marginRatio: number;
}

export interface OrderBookLevel {
  price: number;
  bidSize: number;
  askSize: number;
}

export interface Order {
  id: string;
  marketId: string;
  marketName: string;
  side: "yes" | "no";
  stake: number;
  payout: number;
  probability: number;
  status: "open" | "filled" | "cancelled";
  createdAt: string;
  filledAt?: string;
}

export interface Trade {
  id: string;
  marketId: string;
  price: number;
  contracts: number;
  side: "yes" | "no";
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  balance: number;
  lockedMargin: number;
  totalEquity: number;
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
