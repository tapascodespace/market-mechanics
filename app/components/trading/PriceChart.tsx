"use client";

import { useEffect, useRef, useState } from "react";
import { Market, OHLCData } from "@/app/lib/types";
import { generatePriceHistory, generateNextCandle } from "@/app/data/prices";
import Card from "@/app/components/ui/Card";

export default function PriceChart({ market }: { market: Market }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const seriesRef = useRef<ReturnType<ReturnType<typeof import("lightweight-charts").createChart>["addCandlestickSeries"]> | null>(null);
  const dataRef = useRef<OHLCData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    import("lightweight-charts").then(({ createChart, ColorType }) => {
      if (cancelled || !containerRef.current) return;

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#0f0f0f" },
          textColor: "#555555",
          fontSize: 11,
        },
        grid: {
          vertLines: { color: "#1e1e1e" },
          horzLines: { color: "#1e1e1e" },
        },
        width: containerRef.current.clientWidth,
        height: 350,
        timeScale: {
          borderColor: "#1e1e1e",
          timeVisible: true,
        },
        rightPriceScale: {
          borderColor: "#1e1e1e",
        },
        crosshair: {
          horzLine: { color: "#d4972a44" },
          vertLine: { color: "#d4972a44" },
        },
      });

      const series = chart.addCandlestickSeries({
        upColor: "#2aad6e",
        downColor: "#c0392b",
        borderUpColor: "#2aad6e",
        borderDownColor: "#c0392b",
        wickUpColor: "#2aad6e",
        wickDownColor: "#c0392b",
      });

      const data = generatePriceHistory(market);
      series.setData(data.map((d) => ({
        time: d.time as import("lightweight-charts").UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })));

      dataRef.current = data;
      chartRef.current = chart;
      seriesRef.current = series;
      setLoaded(true);

      chart.timeScale().fitContent();

      const handleResize = () => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth });
        }
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    });

    return () => {
      cancelled = true;
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, [market.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live update candles
  useEffect(() => {
    if (!loaded) return;

    const interval = setInterval(() => {
      if (!seriesRef.current || dataRef.current.length === 0) return;

      const lastCandle = dataRef.current[dataRef.current.length - 1];
      const newCandle = generateNextCandle(lastCandle, market);
      dataRef.current.push(newCandle);

      seriesRef.current.update({
        time: newCandle.time as import("lightweight-charts").UTCTimestamp,
        open: newCandle.open,
        high: newCandle.high,
        low: newCandle.low,
        close: newCandle.close,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [loaded, market.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-sm font-medium">Price Chart</span>
        <span className="text-xs text-[var(--muted)]">1H candles</span>
      </div>
      <div ref={containerRef} className="w-full" />
    </Card>
  );
}
