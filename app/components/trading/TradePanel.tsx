"use client";

import { useMemo } from "react";
import { Market } from "@/app/lib/types";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import { cn } from "@/app/lib/utils";
import { useTradingStore } from "@/app/stores/trading-store";
import { useAuthStore } from "@/app/stores/auth-store";
import {
  calculateNotional,
  calculateInitialMargin,
  calculateFee,
  calculateLiquidationPrice,
} from "@/app/lib/payoff";
import { formatCurrency, formatNumber } from "@/app/lib/format";
import { Minus, Plus } from "lucide-react";
import { ParticleButton } from "@/app/components/ui/particle-button";

interface TradePanelProps {
  market: Market;
  side: "long" | "short";
  onSideChange: (side: "long" | "short") => void;
  price: number;
  onPriceChange: (price: number) => void;
  contracts: number;
  onContractsChange: (contracts: number) => void;
}

export default function TradePanel({
  market,
  side,
  onSideChange,
  price,
  onPriceChange,
  contracts,
  onContractsChange,
}: TradePanelProps) {
  const placeOrder = useTradingStore((s) => s.placeOrder);
  const updateBalance = useAuthStore((s) => s.updateBalance);
  const updateLockedMargin = useAuthStore((s) => s.updateLockedMargin);
  const user = useAuthStore((s) => s.user);

  const notionalValue = useMemo(
    () => calculateNotional(price, contracts, market.notionalMultiplier),
    [price, contracts, market.notionalMultiplier]
  );

  const marginRequired = useMemo(
    () =>
      calculateInitialMargin(
        price,
        contracts,
        market.notionalMultiplier,
        market.initialMarginRate
      ),
    [price, contracts, market.notionalMultiplier, market.initialMarginRate]
  );

  const fee = useMemo(
    () => calculateFee(notionalValue, market.feeRate),
    [notionalValue, market.feeRate]
  );

  const totalCost = marginRequired + fee;

  const liquidationPrice = useMemo(
    () =>
      calculateLiquidationPrice(
        side,
        price,
        marginRequired,
        contracts,
        market.notionalMultiplier,
        market.maintenanceMarginRate
      ),
    [side, price, marginRequired, contracts, market.notionalMultiplier, market.maintenanceMarginRate]
  );

  const handlePlaceOrder = () => {
    if (!user || totalCost > user.balance) return;

    const result = placeOrder(
      {
        marketId: market.id,
        marketName: market.shortName,
        side,
        price,
        contracts,
      },
      market
    );

    updateBalance(-(result.marginRequired + result.fee));
    if (updateLockedMargin) {
      updateLockedMargin(result.marginRequired);
    }
  };

  const adjustPrice = (direction: number) => {
    onPriceChange(
      parseFloat((price + direction * market.tickSize).toFixed(market.decimals))
    );
  };

  const insufficientBalance = user && totalCost > user.balance;

  return (
    <Card className="flex flex-col h-full">
      {/* Side toggle */}
      <div className="grid grid-cols-2 p-1.5 border-b border-[var(--border)]">
        {(["long", "short"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onSideChange(s)}
            className={cn(
              "py-2.5 text-sm font-bold rounded-md transition-all capitalize cursor-pointer",
              side === s
                ? s === "long"
                  ? "bg-[var(--green)] text-white"
                  : "bg-[var(--red)] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5 flex-1 flex flex-col">
        {/* Contracts - large display */}
        <div className="text-center">
          <div className="text-4xl font-bold font-mono tabular-nums mb-1">
            {contracts}
          </div>
          <div className="text-xs text-[var(--muted)]">contracts</div>
          <div className="flex justify-center gap-1.5 mt-3">
            {[1, 5, 10, 25, 50].map((c) => (
              <button
                key={c}
                onClick={() => onContractsChange(c)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer font-mono",
                  contracts === c
                    ? "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30"
                    : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)] border border-transparent"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Price stepper */}
        <div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => adjustPrice(-1)}
              className="p-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
            >
              <Minus className="w-4 h-4" />
            </button>
            <Input
              type="number"
              value={price}
              onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
              step={market.tickSize}
              className="text-center font-mono text-xl tabular-nums"
            />
            <button
              onClick={() => adjustPrice(1)}
              className="p-2 rounded-lg bg-[var(--surface2)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => onPriceChange(market.currentPrice)}
            className="text-xs text-[var(--accent)] mt-1.5 hover:underline cursor-pointer w-full text-center"
          >
            Use market price ({formatNumber(market.currentPrice, market.decimals)})
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-1.5 text-sm flex-1">
          <SummaryRow label="1 contract" value={`= ${formatNumber(price, market.decimals)} ${market.unit}`} />
          <SummaryRow label="Available funds" value={user ? formatCurrency(Math.round(user.balance)) : "$0"} />
          <SummaryRow label="Margin required" value={formatCurrency(Math.round(marginRequired))} highlight />
          <SummaryRow label={`Fee (${(market.feeRate * 10000).toFixed(0)} bps)`} value={formatCurrency(Math.round(fee))} />
          <SummaryRow label="Total" value={formatCurrency(Math.round(totalCost))} bold />
          <SummaryRow label="Est. liquidation" value={`${formatNumber(liquidationPrice, market.decimals)} ${market.unit}`} danger />
        </div>

        {/* CTA */}
        <ParticleButton
          onClick={handlePlaceOrder}
          disabled={!user || !!insufficientBalance || contracts < 1}
          particleColor={side === "long" ? "#2aad6e" : "#c0392b"}
          variant={side === "long" ? "green" : "red"}
          size="lg"
          className="w-full py-3.5 font-bold text-base"
        >
          {side === "long" ? "Long" : "Short"} {contracts} @ {formatNumber(price, market.decimals)}{" "}
          {market.unit}
        </ParticleButton>

        {insufficientBalance && (
          <p className="text-xs text-[var(--red)] text-center">Insufficient balance</p>
        )}
      </div>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn("text-[var(--muted)]", bold && "text-[var(--text)] font-medium")}>{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums",
          bold && "font-medium",
          highlight && "text-[var(--accent)]",
          danger && "text-[var(--red)]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
