"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMarketStore } from "@/app/stores/market-store";
import { useAuthStore } from "@/app/stores/auth-store";
import { useMarketSimulation } from "@/hooks/use-market-simulation";
import { formatCurrency, formatCompact, daysUntil } from "@/app/lib/format";
import PriceChart from "@/app/components/trading/PriceChart";
import { ArrowLeft, User, TrendingUp, TrendingDown, Clock, Info } from "lucide-react";
import ThemeToggle from "@/app/components/ui/ThemeToggle";

export default function MarketPage() {
  const params = useParams();
  const slug = params.slug as string;
  const market = useMarketStore((s) => s.selectedMarket);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateBalance = useAuthStore((s) => s.updateBalance);
  const initialized = useRef(false);

  const [side, setSide] = useState<"yes" | "no">("yes");
  const [stake, setStake] = useState<string>("");

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    useMarketStore.getState().selectMarket(slug);
  }, [slug]);

  useMarketSimulation(market?.id ?? null);

  if (!market) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPositive = market.change24h >= 0;
  const stakeNum = parseFloat(stake) || 0;
  const price = side === "yes" ? market.yesPrice : market.noPrice;
  const payout = stakeNum > 0 ? stakeNum / price : 0;
  const profit = payout - stakeNum;
  const insufficientBalance = user && stakeNum > user.balance;

  const handlePlaceBet = () => {
    if (!user || stakeNum <= 0 || insufficientBalance) return;
    updateBalance(-stakeNum);
    setStake("");
  };

  return (
    <div>
      {/* ── Top nav ── */}
      <div className="flex items-center justify-between py-4 mb-2">
        <div className="flex items-center gap-6">
          <Link href="/markets" className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Markets
          </Link>
          <Link href="/portfolio" className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            Portfolio
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-5 text-sm">
            <div className="text-right">
              <div className="text-[var(--muted)] text-xs">Portfolio</div>
              <div className="font-semibold font-mono tabular-nums text-sm">
                {user ? formatCurrency(Math.round(user.totalEquity)) : "$0"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[var(--muted)] text-xs">Cash</div>
              <div className="font-semibold font-mono tabular-nums text-sm">
                {user ? formatCurrency(Math.round(user.balance)) : "$0"}
              </div>
            </div>
          </div>
          <ThemeToggle />
          <button
            onClick={logout}
            className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm cursor-pointer"
            title="Logout"
          >
            {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Market Header ── */}
      <div className="mb-8">
        <div className="flex items-start gap-3 mb-1">
          <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {market.asset}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--muted)] mt-1">
            <span>Probability <strong className="text-[var(--text)]">{market.probability}%</strong></span>
            <span>Yes <strong className="text-[var(--green)]">${market.yesPrice.toFixed(2)}</strong></span>
            <span>No <strong className="text-[var(--red)]">${market.noPrice.toFixed(2)}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-4xl font-black font-mono">
            {market.probability}%
          </span>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold"
            style={{
              color: isPositive ? "var(--green)" : "var(--red)",
              background: isPositive ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
            }}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? "+" : ""}{market.change24h}%
          </div>
          <span className="text-sm text-[var(--green)]">
            {isPositive ? "+" : ""}{market.change24h.toFixed(1)} today
          </span>
        </div>
      </div>

      {/* ── Main: Chart (left) + Trade Panel (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

        {/* LEFT: Chart + Info */}
        <div className="space-y-6">
          <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
            <PriceChart market={market} />
          </div>

          {/* Resolution box */}
          <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--surface2)]">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-semibold">Resolution Criteria</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              <strong>Resolves YES if:</strong> {market.resolvesYesIf}
            </p>
            <div className="flex items-center gap-6 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Settles {market.settlementDate} ({daysUntil(market.settlementDate)}d)
              </span>
              <span>Source: {market.resolutionSource}</span>
            </div>
          </div>

          {/* Collapsible sections (like Forum) */}
          <div className="border border-[var(--border)] rounded-xl divide-y divide-[var(--border)] bg-[var(--surface)]">
            <CollapsibleRow title="Stats" defaultOpen>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[var(--muted)]">Volume (24h)</span><div className="font-mono font-medium">${formatCompact(market.volume24h)}</div></div>
                <div><span className="text-[var(--muted)]">Open Interest</span><div className="font-mono font-medium">${formatCompact(market.openInterest)}</div></div>
                <div><span className="text-[var(--muted)]">Yes Price</span><div className="font-mono font-medium text-[var(--green)]">${market.yesPrice.toFixed(2)}</div></div>
                <div><span className="text-[var(--muted)]">No Price</span><div className="font-mono font-medium text-[var(--red)]">${market.noPrice.toFixed(2)}</div></div>
              </div>
            </CollapsibleRow>
            <CollapsibleRow title="More info">
              <p className="text-sm text-[var(--text-secondary)]">{market.description}</p>
            </CollapsibleRow>
          </div>
        </div>

        {/* RIGHT: Trade Panel */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
            {/* Yes / No toggle */}
            <div className="grid grid-cols-2 p-1.5 border-b border-[var(--border)]">
              {(["yes", "no"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`py-3 text-sm font-bold rounded-lg transition-all capitalize cursor-pointer ${
                    side === s
                      ? s === "yes"
                        ? "bg-[var(--green)] text-white"
                        : "bg-[var(--red)] text-white"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {s === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">
              {/* Stake input */}
              <div>
                <label className="text-xs text-[var(--muted)] mb-2 block uppercase tracking-wider font-medium">
                  Stake Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-mono text-lg">$</span>
                  <input
                    type="number"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-4 py-4 text-2xl font-mono font-bold bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                  />
                </div>
                {/* Quick amounts */}
                <div className="flex gap-2 mt-3">
                  {[10, 25, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setStake(String(amt))}
                      className="flex-1 text-xs py-1.5 rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer font-mono"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payoff preview */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Available funds</span>
                  <span className="font-mono">{user ? formatCurrency(Math.round(user.balance)) : "$0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Price per share</span>
                  <span className="font-mono">${price.toFixed(2)}</span>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex justify-between font-medium">
                  <span>If correct</span>
                  <span className="font-mono text-[var(--green)]">
                    {stakeNum > 0 ? `$${payout.toFixed(2)}` : "--"}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Profit</span>
                  <span className="font-mono text-[var(--green)]">
                    {stakeNum > 0 ? `+$${profit.toFixed(2)}` : "--"}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>If wrong</span>
                  <span className="font-mono text-[var(--red)]">
                    {stakeNum > 0 ? `-$${stakeNum.toFixed(2)}` : "--"}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handlePlaceBet}
                disabled={!user || stakeNum <= 0 || !!insufficientBalance}
                className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  side === "yes"
                    ? "bg-[var(--green)] hover:brightness-110"
                    : "bg-[var(--red)] hover:brightness-110"
                }`}
              >
                {side === "yes" ? "Buy Yes" : "Buy No"}
                {stakeNum > 0 && ` — $${stakeNum.toFixed(0)}`}
              </button>

              {insufficientBalance && (
                <p className="text-xs text-[var(--red)] text-center">Insufficient balance</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer nav (like Forum) ── */}
      <div className="flex items-center justify-between py-6 mt-12 border-t border-[var(--border)]">
        <Link href="/markets" className="text-xl font-black text-[var(--accent)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Reeshaw
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--muted)]">
          <span>Leaderboard</span>
          <span>API</span>
          <span>About</span>
        </div>
        <div className="hidden sm:flex items-center gap-5 text-sm">
          <div className="text-right">
            <div className="text-[var(--muted)] text-xs">Portfolio</div>
            <div className="font-semibold font-mono">{user ? formatCurrency(Math.round(user.totalEquity)) : "$0"}</div>
          </div>
          <div className="text-right">
            <div className="text-[var(--muted)] text-xs">Cash</div>
            <div className="font-semibold font-mono">{user ? formatCurrency(Math.round(user.balance)) : "$0"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Collapsible section (like Forum's Stats/Funding/Orderbook/More info) ── */
function CollapsibleRow({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-6 py-4 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface2)] transition-colors cursor-pointer"
      >
        {title}
        <svg className={`w-4 h-4 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}
