import { CheckCircle2, Coins, Store, TrendingUp } from "lucide-react";
import { ODD_JOB_REWARD, TAG_LABELS } from "../data/worldData";
import { calculateBuyPrice, calculateSellQuote } from "../engine/economy";
import { CityNode, CityVisitState, GuildBounty, SatchelItem } from "../types/game";

interface MarketLedgerProps {
  city: CityNode;
  visitState: CityVisitState;
  coins: number;
  satchel: SatchelItem[];
  satchelCapacity: number;
  cheapestFare: number;
  activeBounties: GuildBounty[];
  onBuyItem: (itemId: string) => void;
  onSellItem: (instanceId: string) => void;
  onFulfillBounty: (bountyId: string) => void;
  onDoOddJob: () => void;
}

export function MarketLedger({
  city,
  visitState,
  coins,
  satchel,
  satchelCapacity,
  cheapestFare,
  activeBounties,
  onBuyItem,
  onSellItem,
  onFulfillBounty,
  onDoOddJob,
}: MarketLedgerProps) {
  const isSatchelFull = satchel.length >= satchelCapacity;
  const needsEmergencyFare = coins < cheapestFare;

  const localBounties = activeBounties.filter((b) => b.targetCityId === city.id);

  return (
    <section className="bg-white rounded-xl border border-stone-200 p-5 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span>{city.region}</span>
            <span aria-hidden="true">·</span>
            <span>Local Supply: {city.producerTags.map((t) => TAG_LABELS[t]).join(" · ")}</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
            {city.name} Market
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">{city.demandBlurb}</p>
          <div className="text-xs font-medium text-emerald-800 mt-1.5">
            High Demand: {city.highDemandTags.map((t) => TAG_LABELS[t]).join(" · ")}
          </div>
        </div>

        {needsEmergencyFare && (
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className="text-xs text-rose-700 font-medium">
              Short on ticket fare ({cheapestFare}c min)
            </span>
            <button
              type="button"
              onClick={onDoOddJob}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Run Local Errand (+{ODD_JOB_REWARD}c)</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-600" />
              <span>Today&apos;s Stalls</span>
            </h3>
            <span className="text-xs text-slate-500">Restocks 2 hops away</span>
          </div>

          <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg bg-stone-50/40">
            {visitState.activeShelf.map((entry) => {
              const item = city.catalog.find((c) => c.id === entry.itemId);
              if (!item) return null;
              const buyPrice = calculateBuyPrice(item, city);
              const outOfStock = entry.stockLeft <= 0;
              const cannotAfford = coins < buyPrice;
              const disabled = outOfStock || cannotAfford || isSatchelFull;

              return (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-2xl leading-none mt-0.5 shrink-0" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate">
                        {item.name}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{item.tags.map((t) => TAG_LABELS[t]).join(" · ")}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-mono tabular-nums ${outOfStock ? "text-rose-700 font-medium" : ""}`}>
                          {outOfStock ? "Sold out" : `${entry.stockLeft} in stock`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onBuyItem(item.id)}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-emerald-800 disabled:bg-stone-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed font-mono tabular-nums"
                  >
                    {outOfStock
                      ? "Out"
                      : isSatchelFull
                      ? "Full"
                      : `Buy ${buyPrice}c`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Sell or Deliver</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {satchel.length} carried
            </span>
          </div>

          {satchel.length === 0 ? (
            <div className="border border-dashed border-stone-300 rounded-lg p-6 text-center text-xs text-slate-500">
              Your satchel is empty. Buy local goods on the left to trade in distant cities, fulfill bounties, or combine them on the Crafting Bench.
            </div>
          ) : (
            <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg bg-white">
              {satchel.map((item) => {
                const soldCount = visitState.salesCountByItemName[item.name.toLowerCase()] || 0;
                const quote = calculateSellQuote(item, city, soldCount);
                const isProfit = quote.profitDelta > 0;
                const isLoss = quote.profitDelta < 0;
                const matchingLocalBounty = localBounties.find(
                  (b) => b.targetItemName.toLowerCase() === item.name.toLowerCase()
                );

                return (
                  <div
                    key={item.instanceId}
                    className="p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl leading-none mt-0.5 shrink-0" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span>From {item.origin}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              quote.demandTier === "high"
                                ? "text-emerald-700 font-semibold"
                                : quote.demandTier === "surplus"
                                ? "text-rose-700 font-medium"
                                : "text-slate-600"
                            }
                          >
                            {quote.demandLabel}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono tabular-nums mt-0.5">
                          <span className="text-slate-500">Cost {item.paidPrice}c</span>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <span
                            className={
                              isProfit
                                ? "text-emerald-700 font-semibold"
                                : isLoss
                                ? "text-rose-700 font-medium"
                                : "text-slate-600"
                            }
                          >
                            {isProfit ? `+${quote.profitDelta}c` : `${quote.profitDelta}c`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {matchingLocalBounty && (
                        <button
                          type="button"
                          onClick={() => onFulfillBounty(matchingLocalBounty.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-mono tabular-nums"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Bounty +{matchingLocalBounty.rewardCoins}c</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onSellItem(item.instanceId)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer font-mono tabular-nums ${
                          quote.demandTier === "high"
                            ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                            : "bg-stone-100 hover:bg-stone-200 text-slate-900 border border-stone-300"
                        }`}
                      >
                        Sell {quote.sellPrice}c
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
