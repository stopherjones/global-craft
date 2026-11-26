import { Award, CheckCircle2 } from "lucide-react";
import { ACHIEVEMENTS, EXPLORER_RANKS } from "../data/worldData";
import { getAchievementProgress, getActiveRun, getExplorerRank } from "../engine/economy";
import { SaveState } from "../types/game";

interface AchievementsViewProps {
  saveState: SaveState;
}

export function AchievementsView({ saveState }: AchievementsViewProps) {
  const activeRun = getActiveRun(saveState);
  const rank = getExplorerRank(saveState.sandbox.totalEarned);
  const unlockedTotal = Object.keys(saveState.unlockedAchievements).length;

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Sandbox Standing · {unlockedTotal} of {ACHIEVEMENTS.length} milestones
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
              Rank: {rank.currentTitle}
            </h1>
            {rank.nextTitle && rank.nextThreshold !== null ? (
              <p className="text-sm text-slate-600 mt-1 font-mono tabular-nums">
                {saveState.sandbox.totalEarned.toLocaleString()} / {rank.nextThreshold.toLocaleString()}c toward {rank.nextTitle}
              </p>
            ) : (
              <p className="text-sm text-emerald-700 font-medium mt-1">
                Highest guild standing achieved.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-right font-mono tabular-nums">
            <div>
              <div className="text-[11px] font-sans text-slate-500">Guild Seals</div>
              <div className="text-lg font-semibold text-amber-700">{activeRun.guildSeals}</div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-slate-500">Bounties</div>
              <div className="text-lg font-semibold text-slate-900">{activeRun.completedBounties}</div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-slate-500">Legends</div>
              <div className="text-lg font-semibold text-emerald-800">
                {Object.keys(saveState.unlockedLegends).length}/8
              </div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-slate-500">Best Expedition</div>
              <div className="text-lg font-semibold text-slate-900">
                {saveState.bestExpeditionScore > 0
                  ? saveState.bestExpeditionScore.toLocaleString()
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {EXPLORER_RANKS.map((tier) => {
            const reached = saveState.sandbox.totalEarned >= tier.minEarned;
            return (
              <div
                key={tier.title}
                className={`p-2.5 rounded-lg border text-xs ${
                  reached
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-stone-50 border-stone-200 text-slate-500"
                }`}
              >
                <div className="font-semibold truncate">{tier.title}</div>
                <div className="font-mono text-[11px] tabular-nums mt-0.5">
                  {tier.minEarned.toLocaleString()}c
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const unlockedAt = saveState.unlockedAchievements[ach.id];
          const progress = Math.min(ach.target, getAchievementProgress(ach.id, saveState));
          const pct = Math.round((progress / ach.target) * 100);

          return (
            <article
              key={ach.id}
              className={`rounded-xl border p-4 space-y-3 bg-white ${
                unlockedAt ? "border-emerald-300" : "border-stone-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {unlockedAt ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <Award className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">{ach.description}</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 capitalize shrink-0">
                  {ach.category}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600">
                  <span>{unlockedAt ? "Unlocked" : "In Progress"}</span>
                  <span>
                    {progress.toLocaleString()} / {ach.target.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      unlockedAt ? "bg-emerald-700" : "bg-amber-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
