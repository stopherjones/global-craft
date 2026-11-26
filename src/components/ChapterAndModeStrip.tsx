import { Check, Compass, Flag, Timer } from "lucide-react";
import { CHAPTER_OBJECTIVES, EXPEDITION_TOTAL_HOPS } from "../data/worldData";
import { computeExpeditionScore, getChapterProgress } from "../engine/economy";
import { SaveState } from "../types/game";

interface ChapterAndModeStripProps {
  saveState: SaveState;
  onClaimChapter: (chapterId: string, rewardCoins: number) => void;
  onStartExpedition: () => void;
  onFinishExpedition: () => void;
  onReturnToSandbox: () => void;
}

export function ChapterAndModeStrip({
  saveState,
  onClaimChapter,
  onStartExpedition,
  onFinishExpedition,
  onReturnToSandbox,
}: ChapterAndModeStripProps) {
  const activeChapter =
    CHAPTER_OBJECTIVES.find((ch) => !saveState.claimedChapters[ch.id]) || null;

  const chapterProgress = activeChapter
    ? Math.min(activeChapter.target, getChapterProgress(activeChapter.id, saveState))
    : 0;
  const chapterReady = activeChapter ? chapterProgress >= activeChapter.target : false;

  const isExpedition = saveState.activeMode === "expedition" && saveState.expedition;
  const expPreview = isExpedition ? computeExpeditionScore(isExpedition) : null;

  return (
    <section className="bg-white rounded-xl border border-stone-200 px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Left: Active Chapter Objective */}
      <div className="flex flex-wrap items-center gap-3 min-w-0">
        {activeChapter ? (
          <>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  Chapter {activeChapter.chapterNumber} of {CHAPTER_OBJECTIVES.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeChapter.title}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-emerald-800">
                  {chapterProgress}/{activeChapter.target}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-0.5">{activeChapter.description}</p>
            </div>

            {chapterReady && (
              <button
                type="button"
                onClick={() => onClaimChapter(activeChapter.id, activeChapter.rewardCoins)}
                className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer font-mono tabular-nums"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Claim +{activeChapter.rewardCoins}c</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-emerald-800 font-medium">
            <Compass className="w-4 h-4 shrink-0" />
            <span>
              All {CHAPTER_OBJECTIVES.length} Guild Chapters completed — continue exploring or chase a Gold Expedition score.
            </span>
          </div>
        )}
      </div>

      {/* Right: Mode Switcher (Sandbox <-> 20-Hop Timed Expedition) */}
      <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-stone-200 shrink-0">
        {isExpedition && expPreview ? (
          <>
            <div className="text-xs text-slate-700 flex items-center gap-2.5 font-mono tabular-nums">
              <span
                className={`font-semibold ${
                  isExpedition.hopsRemaining <= 3 ? "text-rose-700" : "text-amber-700"
                }`}
              >
                {isExpedition.hopsRemaining} / {isExpedition.startingHops} hops left
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span>Score {expPreview.score.toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={onFinishExpedition}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>End Run</span>
            </button>
            <button
              type="button"
              onClick={onReturnToSandbox}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-slate-800 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
            >
              Sandbox
            </button>
          </>
        ) : (
          <>
            {saveState.bestExpeditionScore > 0 && (
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Best Run: {saveState.bestExpeditionScore.toLocaleString()} ({saveState.bestExpeditionMedal})
              </span>
            )}
            <button
              type="button"
              onClick={onStartExpedition}
              className="px-3.5 py-2 rounded-lg bg-[#162130] hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5 text-amber-300" />
              <span>Start {EXPEDITION_TOTAL_HOPS}-Hop Expedition</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
