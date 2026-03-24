/**
 * Reeshaw Linear Payoff Engine
 *
 * Based on Section 3.1 of the paper:
 * "If you enter a long position at price P and the contract settles at value V,
 *  your profit is (V − P) × N, where N is the notional multiplier.
 *  A short position profits by (P − V) × N."
 *
 * This is structurally identical to a futures contract.
 */

// ── Core P&L ──

/** Calculate unrealized P&L for a position */
export function calculatePnl(
  side: "long" | "short" | "yes" | "no",
  entryPrice: number,
  currentPrice: number,
  contracts: number,
  multiplier: number
): number {
  const diff = currentPrice - entryPrice;
  return (side === "long" || side === "yes" ? diff : -diff) * contracts * multiplier;
}

/** Calculate P&L at settlement */
export function calculateSettlementPnl(
  side: "long" | "short" | "yes" | "no",
  entryPrice: number,
  outcomeValue: number,
  contracts: number,
  multiplier: number
): number {
  return calculatePnl(side, entryPrice, outcomeValue, contracts, multiplier);
}

// ── Margin System (Paper Section 3.3) ──

/** Calculate initial margin required to open a position */
export function calculateInitialMargin(
  price: number,
  contracts: number,
  multiplier: number,
  initialMarginRate: number
): number {
  const notional = price * contracts * multiplier;
  return notional * initialMarginRate;
}

/** Calculate maintenance margin (liquidation trigger) */
export function calculateMaintenanceMargin(
  price: number,
  contracts: number,
  multiplier: number,
  maintenanceMarginRate: number
): number {
  const notional = price * contracts * multiplier;
  return notional * maintenanceMarginRate;
}

/** Calculate notional value of a position */
export function calculateNotional(
  price: number,
  contracts: number,
  multiplier: number
): number {
  return price * contracts * multiplier;
}

/** Calculate margin ratio: (margin + unrealizedPnl) / notional */
export function calculateMarginRatio(
  initialMargin: number,
  unrealizedPnl: number,
  notionalValue: number
): number {
  if (notionalValue === 0) return 1;
  return (initialMargin + unrealizedPnl) / notionalValue;
}

/** Check if position should be liquidated */
export function shouldLiquidate(
  marginRatio: number,
  maintenanceMarginRate: number
): boolean {
  return marginRatio < maintenanceMarginRate;
}

/** Calculate liquidation price for a position */
export function calculateLiquidationPrice(
  side: "long" | "short" | "yes" | "no",
  entryPrice: number,
  initialMargin: number,
  contracts: number,
  multiplier: number,
  maintenanceMarginRate: number
): number {
  const notional = entryPrice * contracts * multiplier;
  const maintenanceMargin = notional * maintenanceMarginRate;
  const maxLoss = initialMargin - maintenanceMargin;
  const priceMove = maxLoss / (contracts * multiplier);

  return side === "long" || side === "yes"
    ? entryPrice - priceMove
    : entryPrice + priceMove;
}

// ── Variation Margin (Paper Section 3.3) ──
// "Every trading day, the clearinghouse marks every open position to the
//  current market-implied forward price and transfers the daily gain or
//  loss between counterparties."

export function calculateVariationMargin(
  side: "long" | "short" | "yes" | "no",
  previousPrice: number,
  currentPrice: number,
  contracts: number,
  multiplier: number
): number {
  const diff = currentPrice - previousPrice;
  return (side === "long" || side === "yes" ? diff : -diff) * contracts * multiplier;
}

// ── Fee Calculation ──

/** Transaction fee: 2-5 bps of notional (Paper Section 3.3) */
export function calculateFee(
  notionalValue: number,
  feeRate: number
): number {
  return notionalValue * feeRate;
}

// ── Payoff Curve for Visualization ──

export function calculatePayoffCurve(
  side: "long" | "short" | "yes" | "no",
  entryPrice: number,
  contracts: number,
  multiplier: number,
  rangeMin: number,
  rangeMax: number,
  steps: number = 100
): { outcome: number; pnl: number }[] {
  const result: { outcome: number; pnl: number }[] = [];
  const step = (rangeMax - rangeMin) / steps;
  for (let i = 0; i <= steps; i++) {
    const outcome = rangeMin + i * step;
    result.push({
      outcome,
      pnl: calculatePnl(side, entryPrice, outcome, contracts, multiplier),
    });
  }
  return result;
}
