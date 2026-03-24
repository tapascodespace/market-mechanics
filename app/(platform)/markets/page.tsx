"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useMarketStore } from "@/app/stores/market-store";
import { useAuthStore } from "@/app/stores/auth-store";
import MarketCard from "@/app/components/markets/MarketCard";
import FeaturedMarket from "@/app/components/markets/FeaturedMarket";
import { cn } from "@/app/lib/utils";
import { formatCurrency } from "@/app/lib/format";
import { Search, User, Wallet } from "lucide-react";
import ThemeToggle from "@/app/components/ui/ThemeToggle";

const categories = ["Popular", "Equity", "Earnings", "FX", "Commodities", "Rates", "Macro", "Crypto", "Sports"] as const;
const categoryMap: Record<string, string> = {
  Popular: "all",
  Equity: "equity",
  Earnings: "earnings",
  FX: "fx",
  Commodities: "commodities",
  Rates: "rates",
  Macro: "macro",
  Crypto: "crypto",
  Sports: "sports",
};

export default function MarketsPage() {
  const markets = useMarketStore((s) => s.markets);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [activeTab, setActiveTab] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");

  const filterKey = categoryMap[activeTab];
  const filtered = useMemo(() => {
    let result = filterKey === "all" ? markets : markets.filter((m) => m.category === filterKey);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.shortName.toLowerCase().includes(q) || m.asset.toLowerCase().includes(q)
      );
    }
    return result;
  }, [markets, filterKey, searchQuery]);

  const featured = useMemo(() => {
    const pool = filterKey === "all" ? markets : filtered;
    return pool.length > 0
      ? pool.reduce((best, m) => (m.volume24h > best.volume24h ? m : best), pool[0])
      : null;
  }, [markets, filtered, filterKey]);

  const gridMarkets = featured
    ? filtered.filter((m) => m.id !== featured.id)
    : filtered;

  return (
    <div>

      {/* ━━━━ NAVBAR ━━━━ */}
      <nav className="flex items-center justify-between py-4">
        <div className="flex items-center gap-8">
          <Link href="/markets" className="flex items-center gap-2.5">
            <svg viewBox="0 0 64 64" className="w-8 h-8">
              <path d="M12 18 L20 4 L28 18 Z" fill="var(--text)" />
              <path d="M36 18 L44 4 L52 18 Z" fill="var(--text)" />
              <ellipse cx="32" cy="36" rx="22" ry="24" fill="var(--text)" />
              <circle cx="24" cy="32" r="3.5" fill="var(--bg)" />
              <circle cx="40" cy="32" r="3.5" fill="var(--bg)" />
            </svg>
            <span className="text-lg font-bold">
              Ree<span className="text-[var(--muted)]">shaw</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {["Markets", "Leaderboard", "API", "About"].map((item) => (
              <Link
                key={item}
                href={item === "Markets" ? "/markets" : item === "Leaderboard" ? "/portfolio" : "#"}
                className="px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface2)] rounded-lg transition"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-glow)] focus:border-[var(--accent)]/40 w-52 lg:w-64 transition shadow-[var(--shadow-xs)]"
            />
          </div>

          {/* Balance */}
          <Link
            href="/portfolio"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] transition"
          >
            <Wallet className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-semibold font-mono tabular-nums">
              {user ? formatCurrency(Math.round(user.balance)) : "$0"}
            </span>
          </Link>

          <ThemeToggle />

          <button
            onClick={logout}
            className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:brightness-110 transition shrink-0 shadow-[var(--shadow-sm)]"
            title="Logout"
          >
            {user?.name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
          </button>
        </div>
      </nav>

      {/* ━━━━ HERO ━━━━ */}
      <div className="pt-8 pb-8">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
          Trade the <span className="chromatic-text">outcome</span>.
        </h1>
        <p className="text-base text-[var(--text-secondary)] mt-3 max-w-lg leading-relaxed">
          Asset-centric prediction markets. Take a position on real financial events.
        </p>
      </div>

      {/* ━━━━ CATEGORY TABS ━━━━ */}
      <div className="flex items-center gap-2 pb-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition cursor-pointer whitespace-nowrap",
              activeTab === cat
                ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ━━━━ FEATURED ━━━━ */}
      <div className="pt-4">
        {featured && <FeaturedMarket market={featured} />}
      </div>

      {/* ━━━━ ALL MARKETS ━━━━ */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">
            All Markets
          </h2>
          <span className="text-sm text-[var(--muted)]">
            {gridMarkets.length} market{gridMarkets.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {gridMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>

        {gridMarkets.length === 0 && (
          <div className="text-center py-20 text-[var(--muted)] text-sm">
            No markets found.
          </div>
        )}
      </div>

      {/* ━━━━ FOOTER ━━━━ */}
      <footer className="flex items-center justify-between mt-16 pt-6 pb-8 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 64 64" className="w-4 h-4 opacity-40">
            <path d="M12 18 L20 4 L28 18 Z" fill="var(--text)" />
            <path d="M36 18 L44 4 L52 18 Z" fill="var(--text)" />
            <ellipse cx="32" cy="36" rx="22" ry="24" fill="var(--text)" />
            <circle cx="24" cy="32" r="3.5" fill="var(--bg)" />
            <circle cx="40" cy="32" r="3.5" fill="var(--bg)" />
          </svg>
          <span className="text-xs text-[var(--muted)]">Reeshaw &copy; 2026</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-[var(--muted)]">
          <span className="hover:text-[var(--text)] cursor-pointer transition">Privacy</span>
          <span className="hover:text-[var(--text)] cursor-pointer transition">Terms</span>
          <span className="hover:text-[var(--text)] cursor-pointer transition">API</span>
        </div>
      </footer>
    </div>
  );
}
