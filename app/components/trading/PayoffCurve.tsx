"use client";

import { useMemo } from "react";
import { Market } from "@/app/lib/types";
import { calculatePayoffCurve } from "@/app/lib/payoff";
import Card from "@/app/components/ui/Card";
import { formatNumber, formatCurrency } from "@/app/lib/format";

interface PayoffCurveProps {
  market: Market;
  entryPrice: number;
  contracts: number;
  side: "yes" | "no";
}

export default function PayoffCurve({ market, entryPrice, contracts, side }: PayoffCurveProps) {
  const range = market.tickSize * 20;
  const rangeMin = entryPrice - range;
  const rangeMax = entryPrice + range;

  const curveData = useMemo(
    () => calculatePayoffCurve(side, entryPrice, contracts, market.notionalMultiplier, rangeMin, rangeMax, 80),
    [side, entryPrice, contracts, market.notionalMultiplier, rangeMin, rangeMax]
  );

  const svgWidth = 320;
  const svgHeight = 160;
  const padding = { top: 20, right: 15, bottom: 28, left: 15 };
  const plotW = svgWidth - padding.left - padding.right;
  const plotH = svgHeight - padding.top - padding.bottom;

  const maxPnl = Math.max(...curveData.map((d) => Math.abs(d.pnl)), 1);

  const toX = (outcome: number) =>
    padding.left + ((outcome - rangeMin) / (rangeMax - rangeMin)) * plotW;
  const toY = (pnl: number) =>
    padding.top + plotH / 2 - (pnl / maxPnl) * (plotH / 2);

  const pathD = curveData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.outcome).toFixed(1)} ${toY(d.pnl).toFixed(1)}`)
    .join(" ");

  // Create fill area - path from line down to zero
  const fillD = pathD +
    ` L ${toX(curveData[curveData.length - 1].outcome).toFixed(1)} ${toY(0).toFixed(1)}` +
    ` L ${toX(curveData[0].outcome).toFixed(1)} ${toY(0).toFixed(1)} Z`;

  const zeroY = toY(0);
  const maxProfit = curveData[curveData.length - 1].pnl;
  const maxLoss = curveData[0].pnl;

  return (
    <Card className="flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-medium">Payoff Curve</span>
        <span
          className="text-xs font-bold uppercase px-2 py-0.5 rounded"
          style={{
            background: side === "yes" ? "rgba(42,173,110,0.15)" : "rgba(192,57,43,0.15)",
            color: side === "yes" ? "var(--green)" : "var(--red)",
          }}
        >
          {side}
        </span>
      </div>
      <div className="p-4 flex justify-center flex-1">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[320px]">
          <defs>
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--green)" stopOpacity="0.15" />
              <stop offset="50%" stopColor="var(--green)" stopOpacity="0.02" />
              <stop offset="50%" stopColor="var(--red)" stopOpacity="0.02" />
              <stop offset="100%" stopColor="var(--red)" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Background gradient fill */}
          <path d={fillD} fill="url(#profitGrad)" />

          {/* Zero line */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={svgWidth - padding.right}
            y2={zeroY}
            stroke="var(--border2)"
            strokeWidth="1"
          />

          {/* Grid lines */}
          <line x1={padding.left} y1={padding.top} x2={svgWidth - padding.right} y2={padding.top} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={padding.left} y1={padding.top + plotH} x2={svgWidth - padding.right} y2={padding.top + plotH} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* P&L line */}
          <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />

          {/* Entry price line */}
          <line
            x1={toX(entryPrice)}
            y1={padding.top}
            x2={toX(entryPrice)}
            y2={padding.top + plotH}
            stroke="var(--accent)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />

          {/* Break-even dot */}
          <circle cx={toX(entryPrice)} cy={zeroY} r="4" fill="var(--accent)" />
          <circle cx={toX(entryPrice)} cy={zeroY} r="6" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />

          {/* Labels */}
          <text x={toX(entryPrice)} y={zeroY - 10} textAnchor="middle" fill="var(--accent)" fontSize="9" fontWeight="600">
            ENTRY
          </text>

          {/* Max profit label */}
          <text x={svgWidth - padding.right - 2} y={padding.top + 10} textAnchor="end" fill="var(--green)" fontSize="8" fontWeight="500">
            +{formatCurrency(Math.round(Math.abs(maxProfit)))}
          </text>

          {/* Max loss label */}
          <text x={padding.left + 2} y={padding.top + plotH - 4} textAnchor="start" fill="var(--red)" fontSize="8" fontWeight="500">
            -{formatCurrency(Math.round(Math.abs(maxLoss)))}
          </text>

          {/* X axis labels */}
          <text x={padding.left} y={svgHeight - 6} fill="var(--muted)" fontSize="8">
            {formatNumber(rangeMin, market.decimals)}
          </text>
          <text x={svgWidth - padding.right} y={svgHeight - 6} fill="var(--muted)" fontSize="8" textAnchor="end">
            {formatNumber(rangeMax, market.decimals)}
          </text>
          <text x={svgWidth / 2} y={svgHeight - 6} fill="var(--muted)" fontSize="8" textAnchor="middle">
            Settlement Value ({market.unit})
          </text>
        </svg>
      </div>
      <div className="px-4 pb-3 text-[11px] text-[var(--muted)] text-center font-mono">
        P&L = ({side === "yes" ? "V − P" : "P − V"}) × {contracts} × {market.notionalMultiplier}
      </div>
    </Card>
  );
}
