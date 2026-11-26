import { Award, RotateCcw } from "lucide-react";
import { EXPEDITION_MEDAL_THRESHOLDS } from "../data/worldData";
import { computeExpeditionScore } from "../engine/economy";
import { ExpeditionRun } from "../types/game";

interface ExpeditionSummaryModalProps {
  expedition: ExpeditionRun | null;
  bestScore: number;
  onPlayAgain: () => void;
  onReturnToSandbox: () => void;
}

export function ExpeditionSummaryModal({
  expedition,
  bestScore,
  onPlayAgain,
  onReturnToSandbox,
}: ExpeditionSummaryModalProps) {
  if (!expedition || !expedition.isFinished) return null;

  const breakdown = computeExpeditionScore(expedition);
  const isNewRecord = breakdown.score >= bestScore && breakdown.score > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-xl border border-stone-200 max-w-md w-full shadow-2xl overflow-hidden animate-card-enter">
        <div className="px-6 py-5 bg-[#162130] text-white flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-300 font-medium">
              {expedition.startingHops}-Hop Expedition Complete
            </div>
            <h2 className="font-display text-2xl font-bold mt-0.5">
              {breakdown.medal} Charter
            </h2>
          </div>
          <Award
            className={`w-9 h-9 shrink-0 ${
              breakdown.medal === "Gold"
                ? "text-amber-400"
                : breakdown.medal === "Silver"
                ? "text-slate-300"
                : breakdown.medal === "Bronze"
                ? "text-amber-600"
                : "text-emerald-400"
            }`}
          />
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center py-3 rounded-lg bg-stone-50 border border-stone-200">
            <div className="text-xs text-slate-500">Final Expedition Score</div>
            <div className="font-mono text-3xl font-bold text-slate-900 tabular-nums mt-0.5">
              {breakdown.score.toLocaleString()}
            </div>
            {isNewRecord && (
              <div className="text-xs font-semibold text-emerald-700 mt-1">
                New Personal Best
              </div>
            )}
          </div>

          <div className="divide-y divide-stone-200 text-xs font-mono tabular-nums">
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-600">Purse Balance</span>
              <span className="font-semibold text-slate-900">{expedition.coins}c</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-600">
                Remaining Satchel Goods ({expedition.satchel.length})
              </span>
              <span className="font-semibold text-slate-900">+{breakdown.satchelValue}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-600">
                Guild Seals Earned ({expedition.guildSeals} × 150)
              </span>
              <span className="font-semibold text-emerald-700">+{breakdown.sealsBonus}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="font-sans text-slate-600">
                Legends Discovered ({expedition.legendsFoundInRun} × 250)
              </span>
              <span className="font-semibold text-amber-700">+{breakdown.legendsBonus}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center font-mono tabular-nums">
            Bronze {EXPEDITION_MEDAL_THRESHOLDS.bronze} · Silver {EXPEDITION_MEDAL_THRESHOLDS.silver} · Gold {EXPEDITION_MEDAL_THRESHOLDS.gold}
          </div>

          <p className="text-xs text-slate-600 text-center">
            All recipes and Legendary Discoveries unlocked during this run are permanently saved in your shared Explorer&apos;s Grimoire.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              type="button"
              onClick={onReturnToSandbox}
              className="flex-1 py-2.5 px-4 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Return to Sandbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
