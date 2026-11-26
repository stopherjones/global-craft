import { ArrowUpRight, Backpack, FlaskConical, Loader2, Plus, Sparkles, X } from "lucide-react";
import { makeRecipeKey, SATCHEL_UPGRADE_TIERS, SEEDED_RECIPES, TAG_LABELS } from "../data/worldData";
import { LockedRecipe, SatchelItem } from "../types/game";

interface SatchelAndBenchProps {
  satchel: SatchelItem[];
  satchelCapacity: number;
  coins: number;
  selectedSlotIds: string[];
  useThirdSlot: boolean;
  isCrafting: boolean;
  craftError: string | null;
  latestCraft: { recipe: LockedRecipe; fromCache: boolean } | null;
  discoveredRecipes: Record<string, LockedRecipe>;
  onToggleItemInBench: (instanceId: string) => void;
  onRemoveFromBench: (slotIndex: number) => void;
  onClearBench: () => void;
  onToggleThirdSlot: () => void;
  onDiscardSatchelItem: (instanceId: string) => void;
  onUpgradeSatchel: () => void;
  onCombine: () => void;
}

export function SatchelAndBench({
  satchel,
  satchelCapacity,
  coins,
  selectedSlotIds,
  useThirdSlot,
  isCrafting,
  craftError,
  latestCraft,
  discoveredRecipes,
  onToggleItemInBench,
  onRemoveFromBench,
  onClearBench,
  onToggleThirdSlot,
  onDiscardSatchelItem,
  onUpgradeSatchel,
  onCombine,
}: SatchelAndBenchProps) {
  const nextUpgrade = SATCHEL_UPGRADE_TIERS.find((t) => t.capacity > satchelCapacity) || null;
  const maxSlots = useThirdSlot ? 3 : 2;
  const benchItems = selectedSlotIds
    .slice(0, maxSlots)
    .map((id) => satchel.find((item) => item.instanceId === id))
    .filter((item): item is SatchelItem => Boolean(item));

  const readyToCombine = benchItems.length >= 2 && (useThirdSlot ? benchItems.length === 3 : benchItems.length === 2);

  const knownMatch = (() => {
    if (benchItems.length < 2) return null;
    const key = makeRecipeKey(benchItems.map((b) => b.name));
    return discoveredRecipes[key] || SEEDED_RECIPES[key] || null;
  })();

  return (
    <aside className="flex flex-col gap-5">
      {/* Expandable Travel Satchel */}
      <section className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Backpack className="w-4 h-4 text-slate-700" />
              <span>Travel Satchel</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap carried items to place them on the Crafting Bench
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
            {satchel.length} / {satchelCapacity} slots
          </span>
        </div>

        {/* Satchel Slots Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: satchelCapacity }).map((_, idx) => {
            const item = satchel[idx];
            if (!item) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-14 rounded-lg border border-dashed border-stone-200 bg-stone-50/70 flex items-center justify-center text-[11px] text-slate-400"
                >
                  Empty
                </div>
              );
            }

            const slotPos = selectedSlotIds.indexOf(item.instanceId);
            const isSelected = slotPos !== -1 && slotPos < maxSlots;

            return (
              <div
                key={item.instanceId}
                onClick={() => onToggleItemInBench(item.instanceId)}
                className={`relative h-14 px-2.5 rounded-lg border flex items-center gap-2.5 transition-colors cursor-pointer select-none ${
                  isSelected
                    ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500"
                    : "bg-white border-stone-200 hover:border-slate-400"
                }`}
              >
                <span className="text-xl leading-none shrink-0" aria-hidden="true">
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1 pr-4">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {isSelected
                      ? `Slot ${String.fromCharCode(65 + slotPos)}`
                      : item.isCrafted
                      ? `Tier ${item.tier} · ${item.baseValue}c`
                      : item.origin}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDiscardSatchelItem(item.instanceId);
                  }}
                  aria-label={`Discard ${item.name}`}
                  title="Discard item"
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Satchel Upgrade Bar */}
        {nextUpgrade && (
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-800">{nextUpgrade.label}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="font-mono tabular-nums">{nextUpgrade.capacity} slots</span>
            </div>
            <button
              type="button"
              disabled={coins < nextUpgrade.cost}
              onClick={onUpgradeSatchel}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-emerald-800 disabled:bg-stone-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 font-mono tabular-nums"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Expand ({nextUpgrade.cost}c)</span>
            </button>
          </div>
        )}
      </section>

      {/* Portable Lateral Crafting Bench */}
      <section className="bg-[#162130] text-slate-100 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>Crafting Bench</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Combine 2 or 3 carried items anywhere — inputs are consumed
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleThirdSlot}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                useThirdSlot
                  ? "bg-amber-600/20 border-amber-500 text-amber-300"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              {useThirdSlot ? "3-Item Mode" : "+ 3rd Slot"}
            </button>
            {benchItems.length > 0 && (
              <button
                type="button"
                onClick={onClearBench}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-2 whitespace-nowrap cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Bench Input Slots */}
        <div className={`grid gap-2.5 ${useThirdSlot ? "grid-cols-3" : "grid-cols-2"}`}>
          {Array.from({ length: maxSlots }).map((_, idx) => {
            const item = benchItems[idx];
            const slotLabel = `Slot ${String.fromCharCode(65 + idx)}`;

            if (!item) {
              return (
                <div
                  key={slotLabel}
                  className="h-24 rounded-lg border border-dashed border-slate-700 bg-slate-900/60 flex flex-col items-center justify-center p-2 text-center"
                >
                  <Plus className="w-4 h-4 text-slate-500 mb-1" />
                  <span className="text-xs font-medium text-slate-300">{slotLabel}</span>
                  <span className="text-[11px] text-slate-500">Tap satchel</span>
                </div>
              );
            }

            return (
              <button
                key={item.instanceId}
                type="button"
                onClick={() => onRemoveFromBench(idx)}
                className="h-24 rounded-lg border border-amber-500 bg-slate-800 hover:bg-slate-700/80 transition-colors flex flex-col items-center justify-center p-2 text-center cursor-pointer"
              >
                <span className="text-2xl leading-none" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="text-xs font-semibold text-white mt-1.5 line-clamp-1">
                  {item.name}
                </span>
                <span className="text-[10px] text-amber-300 mt-0.5">Tap to remove</span>
              </button>
            );
          })}
        </div>

        {/* Known Recipe Preview or Uncharted Notice */}
        {benchItems.length >= 2 && (
          <div className="px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs flex items-center justify-between gap-2">
            {knownMatch ? (
              <>
                <span className="text-emerald-300 font-medium">
                  Locked Recipe: {knownMatch.resultEmoji} {knownMatch.resultName}
                </span>
                <span className="font-mono tabular-nums text-slate-300">
                  ~{knownMatch.baseValue}c value
                </span>
              </>
            ) : (
              <span className="text-amber-200/90">
                Uncharted combination — discovering locks it into your Grimoire
              </span>
            )}
          </div>
        )}

        {/* Combine CTA */}
        <button
          type="button"
          disabled={!readyToCombine || isCrafting}
          onClick={onCombine}
          className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
        >
          {isCrafting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Discovery...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Combine {useThirdSlot ? "3 Items" : "2 Items"}</span>
            </>
          )}
        </button>

        {craftError && (
          <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-xs text-rose-200">
            {craftError}
          </div>
        )}

        {/* Latest Crafted Output */}
        {latestCraft && (
          <div className="pt-3 border-t border-slate-800 animate-card-enter">
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-700 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none shrink-0" aria-hidden="true">
                    {latestCraft.recipe.resultEmoji}
                  </span>
                  <div>
                    <div className="text-[11px] text-amber-300 font-medium">
                      {latestCraft.fromCache ? "Recalled Locked Recipe" : "New Recipe Locked"} · Tier {latestCraft.recipe.tier}
                    </div>
                    <h3 className="font-display text-base font-bold text-white">
                      {latestCraft.recipe.resultName}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {latestCraft.recipe.resultDescription}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-300 tabular-nums shrink-0">
                  {latestCraft.recipe.baseValue}c base
                </span>
              </div>

              <div className="text-xs text-slate-400 italic pt-1 border-t border-slate-800">
                Spark: {latestCraft.recipe.lateralSpark}
              </div>
              <div className="text-[11px] text-slate-400">
                Tags: {latestCraft.recipe.tags.map((t) => TAG_LABELS[t]).join(" · ")}
              </div>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}
