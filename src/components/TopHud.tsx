import { Volume2, VolumeX } from "lucide-react";
import { getExplorerRank } from "../engine/economy";
import { PlayMode } from "../types/game";

export type ActiveTab = "atlas" | "grimoire" | "achievements";

interface TopHudProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenCloudModal: () => void;
  activeMode: PlayMode;
  hopsRemaining: number | null;
  coins: number;
  totalEarned: number;
  recipeCount: number;
  legendCount: number;
  unlockedCount: number;
  totalAchievements: number;
  muted: boolean;
  onToggleMute: () => void;
}

export function TopHud({
  activeTab,
  onSelectTab,
  onOpenCloudModal,
  activeMode,
  hopsRemaining,
  coins,
  totalEarned,
  recipeCount,
  legendCount,
  unlockedCount,
  totalAchievements,
  muted,
  onToggleMute,
}: TopHudProps) {
  const rank = getExplorerRank(totalEarned);

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab("atlas")}
          className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
        >
          WanderCraft
        </button>

        {/* Zone 2: Single-line Navigation */}
        <nav className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectTab("atlas")}
            className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              activeTab === "atlas"
                ? "border-emerald-700 text-slate-900 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Atlas &amp; Market
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("grimoire")}
            className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              activeTab === "grimoire"
                ? "border-emerald-700 text-slate-900 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Grimoire ({recipeCount} · {legendCount}/8)
          </button>

          <button
            type="button"
            onClick={() => onSelectTab("achievements")}
            className={`py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
              activeTab === "achievements"
                ? "border-emerald-700 text-slate-900 font-semibold"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Milestones ({unlockedCount}/{totalAchievements})
          </button>

          <button
            type="button"
            onClick={onOpenCloudModal}
            className="py-1.5 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 border-transparent text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Saves &amp; Cloud
          </button>
        </nav>

        {/* Zone 3: Mode, Rank & Purse */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap">
            {activeMode === "expedition" && hopsRemaining !== null ? (
              <span className="font-mono font-semibold text-amber-700 tabular-nums">
                Expedition · {hopsRemaining} hops
              </span>
            ) : (
              <span>{rank.currentTitle}</span>
            )}
            <span aria-hidden="true">·</span>
            <span className="font-mono font-semibold text-sm text-emerald-800 tabular-nums">
              {coins.toLocaleString()}c
            </span>
          </div>
          <div className="sm:hidden font-mono font-semibold text-sm text-emerald-800 tabular-nums whitespace-nowrap">
            {coins.toLocaleString()}c
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
            title={muted ? "Unmute audio" : "Mute audio"}
            className="w-9 h-9 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
