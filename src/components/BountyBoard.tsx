import { CheckCircle2, ScrollText } from "lucide-react";
import { CITY_BY_ID } from "../data/worldData";
import { GuildBounty, SatchelItem } from "../types/game";

interface BountyBoardProps {
  bounties: GuildBounty[];
  currentCityId: string;
  guildSeals: number;
  satchel: SatchelItem[];
  onFulfillBounty: (bountyId: string) => void;
}

export function BountyBoard({
  bounties,
  currentCityId,
  guildSeals,
  satchel,
  onFulfillBounty,
}: BountyBoardProps) {
  const carriedNames = new Set(satchel.map((s) => s.name.trim().toLowerCase()));

  return (
    <section className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-amber-700" />
            <span>Guild Bounty Board</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Craft or source exact requested items and deliver them to the posting city
          </p>
        </div>

        <div className="text-xs text-slate-600 font-mono tabular-nums">
          Guild Seals: <span className="font-semibold text-slate-900">{guildSeals}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {bounties.map((bounty) => {
          const targetCity = CITY_BY_ID[bounty.targetCityId];
          const hasItem = carriedNames.has(bounty.targetItemName.trim().toLowerCase());
          const isAtDestination = bounty.targetCityId === currentCityId;
          const canDeliverNow = hasItem && isAtDestination;

          return (
            <div
              key={bounty.id}
              className={`p-3.5 rounded-lg border flex flex-col justify-between gap-3 ${
                canDeliverNow
                  ? "bg-emerald-50/70 border-emerald-400"
                  : hasItem
                  ? "bg-amber-50/60 border-amber-300"
                  : "bg-stone-50/60 border-stone-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-2xl leading-none shrink-0" aria-hidden="true">
                    {bounty.targetItemEmoji}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {bounty.targetItemName}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Deliver to{" "}
                      <span className="font-semibold text-slate-900">
                        {targetCity ? targetCity.name : bounty.targetCityId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {bounty.clueText}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="text-xs font-semibold text-emerald-800">
                    +{bounty.rewardCoins}c
                  </div>
                  <div className="text-[11px] text-amber-700">
                    +{bounty.rewardSeals} {bounty.rewardSeals === 1 ? "Seal" : "Seals"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/80 text-xs">
                {canDeliverNow ? (
                  <button
                    type="button"
                    onClick={() => onFulfillBounty(bounty.id)}
                    className="w-full py-1.5 px-3 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Deliver Bounty (+{bounty.rewardCoins}c)</span>
                  </button>
                ) : hasItem ? (
                  <span className="text-amber-800 font-medium">
                    In satchel — travel to {targetCity?.name} to deliver
                  </span>
                ) : isAtDestination ? (
                  <span className="text-slate-600">
                    Posted here — source or craft item
                  </span>
                ) : (
                  <span className="text-slate-500">Contract open</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
