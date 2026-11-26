import { useCallback, useEffect, useState } from "react";
import { AchievementsView } from "./components/AchievementsView";
import { BountyBoard } from "./components/BountyBoard";
import { ChapterAndModeStrip } from "./components/ChapterAndModeStrip";
import { CloudSaveModal } from "./components/CloudSaveModal";
import { ExpeditionSummaryModal } from "./components/ExpeditionSummaryModal";
import { GrimoireView } from "./components/GrimoireView";
import { MarketLedger } from "./components/MarketLedger";
import { SatchelAndBench } from "./components/SatchelAndBench";
import { ActiveTab, TopHud } from "./components/TopHud";
import { WorldAtlasMap } from "./components/WorldAtlasMap";
import {
  ACHIEVEMENTS,
  CITY_BY_ID,
  LEGENDARY_DISCOVERIES,
  ODD_JOB_REWARD,
  SATCHEL_UPGRADE_TIERS,
} from "./data/worldData";
import {
  calculateBuyPrice,
  calculateSellQuote,
  computeExpeditionScore,
  createExpeditionRunState,
  evaluateNewAchievements,
  fillBountyBoard,
  getActiveRun,
  rollCityShelf,
} from "./engine/economy";
import { soundEngine } from "./engine/sound";
import { resolveCraftCombination } from "./services/craftService";
import { StorageAdapter } from "./services/storageAdapter";
import { LockedRecipe, RunState, SatchelItem, SaveState } from "./types/game";

interface ToastMessage {
  id: string;
  text: string;
  tone: "success" | "error" | "info";
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [saveState, setSaveState] = useState<SaveState>(() => StorageAdapter.loadLocalSave());
  const [activeTab, setActiveTab] = useState<ActiveTab>("atlas");
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [useThirdSlot, setUseThirdSlot] = useState(false);
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftError, setCraftError] = useState<string | null>(null);
  const [latestCraft, setLatestCraft] = useState<{
    recipe: LockedRecipe;
    fromCache: boolean;
  } | null>(null);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback((text: string, tone: "success" | "error" | "info" = "info") => {
    const id = createId();
    setToasts((prev) => [...prev.slice(-3), { id, text, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  useEffect(() => {
    soundEngine.setMuted(saveState.muted);
  }, [saveState.muted]);

  const commitState = useCallback(
    (updater: (prev: SaveState) => SaveState) => {
      setSaveState((prev) => {
        let next = updater(prev);
        const newlyUnlocked = evaluateNewAchievements(next);
        if (newlyUnlocked.length > 0) {
          const unlockedMap = { ...next.unlockedAchievements };
          newlyUnlocked.forEach((id) => {
            unlockedMap[id] = Date.now();
          });
          next = { ...next, unlockedAchievements: unlockedMap };
          soundEngine.playAchievement();
          newlyUnlocked.forEach((id) => {
            const def = ACHIEVEMENTS.find((a) => a.id === id);
            if (def) notify(`Milestone unlocked: ${def.title}`, "success");
          });
        }
        StorageAdapter.saveLocal(next);
        return next;
      });
    },
    [notify]
  );

  const commitActiveRun = useCallback(
    (
      runUpdater: (run: RunState, state: SaveState) => RunState,
      metaUpdater?: (state: SaveState, updatedRun: RunState) => Partial<SaveState>
    ) => {
      commitState((prev) => {
        const currentRun = getActiveRun(prev);
        const updatedRun = runUpdater(currentRun, prev);
        const extraMeta = metaUpdater ? metaUpdater(prev, updatedRun) : {};

        if (prev.activeMode === "expedition" && prev.expedition) {
          return {
            ...prev,
            ...extraMeta,
            expedition: {
              ...prev.expedition,
              ...updatedRun,
            },
          };
        }

        return {
          ...prev,
          ...extraMeta,
          sandbox: updatedRun,
        };
      });
    },
    [commitState]
  );

  const activeRun = getActiveRun(saveState);
  const currentCity = CITY_BY_ID[activeRun.currentCityId];
  const currentVisit = activeRun.cityStates[currentCity.id];
  const cheapestFare = Math.min(...currentCity.adjacentRoutes.map((r) => r.fareCoins));
  const hopsRemaining =
    saveState.activeMode === "expedition" && saveState.expedition
      ? saveState.expedition.hopsRemaining
      : null;

  const finalizeExpedition = useCallback(
    (state: SaveState): SaveState => {
      if (!state.expedition || state.expedition.isFinished) return state;
      const breakdown = computeExpeditionScore(state.expedition);
      const isBest = breakdown.score > state.bestExpeditionScore;
      soundEngine.playAchievement();
      return {
        ...state,
        bestExpeditionScore: isBest ? breakdown.score : state.bestExpeditionScore,
        bestExpeditionMedal: isBest ? breakdown.medal : state.bestExpeditionMedal,
        expedition: {
          ...state.expedition,
          isFinished: true,
          finalScore: breakdown.score,
          medal: breakdown.medal,
        },
      };
    },
    []
  );

  const handleTravel = (targetCityId: string) => {
    if (hopsRemaining !== null && hopsRemaining <= 0) {
      notify("No hops remaining in this Expedition.", "info");
      return;
    }

    const edge = currentCity.adjacentRoutes.find((r) => r.targetCityId === targetCityId);
    if (!edge) return;
    if (activeRun.coins < edge.fareCoins) {
      notify("Not enough coins for this ticket.", "error");
      return;
    }

    const destination = CITY_BY_ID[targetCityId];
    soundEngine.playTravel();

    commitState((prev) => {
      const run = getActiveRun(prev);
      const nextCityStates = { ...run.cityStates };

      for (const cityId of Object.keys(nextCityStates)) {
        if (cityId !== targetCityId) {
          nextCityStates[cityId] = {
            ...nextCityStates[cityId],
            hopsAwaySinceRefresh: nextCityStates[cityId].hopsAwaySinceRefresh + 1,
          };
        }
      }

      const destState = nextCityStates[targetCityId];
      const shouldRefresh = destState.hopsAwaySinceRefresh >= 2;
      const refreshedShelf = shouldRefresh ? rollCityShelf(destination) : destState.activeShelf;

      nextCityStates[targetCityId] = {
        activeShelf: refreshedShelf,
        hopsAwaySinceRefresh: 0,
        salesCountByItemName: {},
      };

      const observedNames = refreshedShelf
        .map((entry) => destination.catalog.find((c) => c.id === entry.itemId)?.name)
        .filter((n): n is string => Boolean(n));

      const updatedRun: RunState = {
        ...run,
        coins: run.coins - edge.fareCoins,
        currentCityId: targetCityId,
        hopCount: run.hopCount + 1,
        cityStates: nextCityStates,
      };

      const nextCharted = {
        ...prev.chartedCities,
        [destination.id]: {
          cityId: destination.id,
          cityName: destination.name,
          region: destination.region,
          visitedAt: Date.now(),
          observedItemNames: observedNames,
          highDemandTags: [...destination.highDemandTags],
          producerTags: [...destination.producerTags],
        },
      };

      if (prev.activeMode === "expedition" && prev.expedition) {
        const nextHopsLeft = Math.max(0, prev.expedition.hopsRemaining - 1);
        const nextState: SaveState = {
          ...prev,
          chartedCities: nextCharted,
          expedition: {
            ...prev.expedition,
            ...updatedRun,
            hopsRemaining: nextHopsLeft,
          },
        };
        return nextHopsLeft === 0 ? finalizeExpedition(nextState) : nextState;
      }

      return {
        ...prev,
        chartedCities: nextCharted,
        sandbox: updatedRun,
      };
    });

    notify(`Arrived in ${destination.name} (-${edge.fareCoins}c)`, "info");
  };

  const handleBuyItem = (itemId: string) => {
    if (activeRun.satchel.length >= activeRun.satchelCapacity) {
      notify("Your satchel is full. Sell, craft, or upgrade capacity.", "error");
      return;
    }

    const catalogItem = currentCity.catalog.find((c) => c.id === itemId);
    const shelfEntry = currentVisit.activeShelf.find((s) => s.itemId === itemId);
    if (!catalogItem || !shelfEntry || shelfEntry.stockLeft <= 0) return;

    const buyPrice = calculateBuyPrice(catalogItem, currentCity);
    if (activeRun.coins < buyPrice) {
      notify("Insufficient coins for this purchase.", "error");
      return;
    }

    soundEngine.playCoin();

    const newSatchelItem: SatchelItem = {
      instanceId: createId(),
      name: catalogItem.name,
      emoji: catalogItem.emoji,
      description: catalogItem.description,
      origin: currentCity.name,
      baseValue: catalogItem.baseValue,
      paidPrice: buyPrice,
      tags: [...catalogItem.tags],
      tier: 0,
      isCrafted: false,
    };

    commitActiveRun((run) => {
      const prevVisit = run.cityStates[currentCity.id];
      return {
        ...run,
        coins: run.coins - buyPrice,
        satchel: [...run.satchel, newSatchelItem],
        cityStates: {
          ...run.cityStates,
          [currentCity.id]: {
            ...prevVisit,
            activeShelf: prevVisit.activeShelf.map((entry) =>
              entry.itemId === itemId
                ? { ...entry, stockLeft: entry.stockLeft - 1 }
                : entry
            ),
          },
        },
      };
    });
  };

  const handleSellItem = (instanceId: string) => {
    const item = activeRun.satchel.find((s) => s.instanceId === instanceId);
    if (!item) return;

    const itemKey = item.name.toLowerCase();
    const soldCount = currentVisit.salesCountByItemName[itemKey] || 0;
    const quote = calculateSellQuote(item, currentCity, soldCount);

    soundEngine.playCoin();
    setSelectedSlotIds((prev) => prev.filter((id) => id !== instanceId));

    commitActiveRun((run) => {
      const prevVisit = run.cityStates[currentCity.id];
      return {
        ...run,
        coins: run.coins + quote.sellPrice,
        totalEarned: run.totalEarned + quote.sellPrice,
        totalTrades: run.totalTrades + 1,
        biggestSale: Math.max(run.biggestSale, quote.sellPrice),
        satchel: run.satchel.filter((s) => s.instanceId !== instanceId),
        cityStates: {
          ...run.cityStates,
          [currentCity.id]: {
            ...prevVisit,
            salesCountByItemName: {
              ...prevVisit.salesCountByItemName,
              [itemKey]: soldCount + 1,
            },
          },
        },
      };
    });

    notify(
      `Sold ${item.name} for ${quote.sellPrice}c (${quote.profitDelta >= 0 ? "+" : ""}${quote.profitDelta}c)`,
      quote.profitDelta >= 0 ? "success" : "info"
    );
  };

  const handleFulfillBounty = (bountyId: string) => {
    const bounty = activeRun.activeBounties.find((b) => b.id === bountyId);
    if (!bounty || bounty.targetCityId !== currentCity.id) return;

    const matchingItem = activeRun.satchel.find(
      (s) => s.name.trim().toLowerCase() === bounty.targetItemName.trim().toLowerCase()
    );
    if (!matchingItem) {
      notify(`Carry ${bounty.targetItemName} in your satchel to deliver.`, "error");
      return;
    }

    soundEngine.playAchievement();
    setSelectedSlotIds((prev) => prev.filter((id) => id !== matchingItem.instanceId));

    commitActiveRun((run, state) => {
      const remainingBounties = run.activeBounties.filter((b) => b.id !== bountyId);
      const nextSeals = run.guildSeals + bounty.rewardSeals;
      const replenished = fillBountyBoard(
        run.currentCityId,
        state.discoveredRecipes,
        remainingBounties,
        nextSeals,
        run.hopCount,
        4
      );

      return {
        ...run,
        coins: run.coins + bounty.rewardCoins,
        totalEarned: run.totalEarned + bounty.rewardCoins,
        totalTrades: run.totalTrades + 1,
        biggestSale: Math.max(run.biggestSale, bounty.rewardCoins),
        guildSeals: nextSeals,
        completedBounties: run.completedBounties + 1,
        satchel: run.satchel.filter((s) => s.instanceId !== matchingItem.instanceId),
        activeBounties: replenished,
      };
    });

    notify(
      `Bounty fulfilled: ${bounty.targetItemEmoji} ${bounty.targetItemName} (+${bounty.rewardCoins}c, +${bounty.rewardSeals} Seal)`,
      "success"
    );
  };

  const handleDoOddJob = () => {
    soundEngine.playCoin();
    commitActiveRun((run) => ({
      ...run,
      coins: run.coins + ODD_JOB_REWARD,
      totalEarned: run.totalEarned + ODD_JOB_REWARD,
    }));
    notify(`Completed a local errand (+${ODD_JOB_REWARD}c)`, "success");
  };

  const handleUpgradeSatchel = () => {
    const nextTier = SATCHEL_UPGRADE_TIERS.find(
      (t) => t.capacity > activeRun.satchelCapacity
    );
    if (!nextTier || activeRun.coins < nextTier.cost) return;

    soundEngine.playAchievement();
    commitActiveRun((run) => ({
      ...run,
      coins: run.coins - nextTier.cost,
      satchelCapacity: nextTier.capacity,
    }));
    notify(`Satchel upgraded to ${nextTier.capacity} slots!`, "success");
  };

  const handleToggleItemInBench = (instanceId: string) => {
    soundEngine.playClick();
    const maxSlots = useThirdSlot ? 3 : 2;
    setSelectedSlotIds((prev) => {
      if (prev.includes(instanceId)) {
        return prev.filter((id) => id !== instanceId);
      }
      if (prev.length < maxSlots) {
        return [...prev, instanceId];
      }
      return [...prev.slice(0, maxSlots - 1), instanceId];
    });
  };

  const handleRemoveFromBench = (slotIndex: number) => {
    soundEngine.playClick();
    setSelectedSlotIds((prev) => prev.filter((_, idx) => idx !== slotIndex));
  };

  const handleDiscardSatchelItem = (instanceId: string) => {
    setSelectedSlotIds((prev) => prev.filter((id) => id !== instanceId));
    commitActiveRun((run) => ({
      ...run,
      satchel: run.satchel.filter((item) => item.instanceId !== instanceId),
    }));
  };

  const handleCombine = async () => {
    if (isCrafting) return;
    const requiredCount = useThirdSlot ? 3 : 2;
    const inputs = selectedSlotIds
      .slice(0, requiredCount)
      .map((id) => activeRun.satchel.find((item) => item.instanceId === id))
      .filter((item): item is SatchelItem => Boolean(item));

    if (inputs.length !== requiredCount) return;

    setIsCrafting(true);
    setCraftError(null);

    try {
      const resolution = await resolveCraftCombination(inputs, saveState.discoveredRecipes);
      const { recipe, fromCache } = resolution;

      const legendDef = recipe.legendaryId
        ? LEGENDARY_DISCOVERIES.find((l) => l.id === recipe.legendaryId)
        : undefined;
      const isNewLegend = Boolean(
        legendDef && !saveState.unlockedLegends[legendDef.id]
      );

      if (isNewLegend) {
        soundEngine.playAchievement();
      } else {
        soundEngine.playCraft();
      }

      const totalPaidCost = inputs.reduce((acc, i) => acc + i.paidPrice, 0);
      const craftedSatchelItem: SatchelItem = {
        instanceId: createId(),
        name: recipe.resultName,
        emoji: recipe.resultEmoji,
        description: recipe.resultDescription,
        origin: inputs.map((i) => i.name).join(" + "),
        baseValue: recipe.baseValue,
        paidPrice: totalPaidCost,
        tags: [...recipe.tags],
        tier: recipe.tier,
        isCrafted: true,
      };

      const consumedIds = new Set(inputs.map((i) => i.instanceId));
      setSelectedSlotIds([]);
      setLatestCraft(resolution);

      commitState((prev) => {
        const run = getActiveRun(prev);
        const existingLocked = prev.discoveredRecipes[recipe.sortedKey];
        const updatedRecipe: LockedRecipe = existingLocked
          ? { ...existingLocked, craftCount: existingLocked.craftCount + 1 }
          : recipe;

        const legendBonus = isNewLegend && legendDef ? legendDef.bonusCoins : 0;

        const updatedRun: RunState = {
          ...run,
          coins: run.coins + legendBonus,
          totalEarned: run.totalEarned + legendBonus,
          totalCrafts: run.totalCrafts + 1,
          satchel: [
            ...run.satchel.filter((item) => !consumedIds.has(item.instanceId)),
            craftedSatchelItem,
          ],
        };

        const nextLegends =
          isNewLegend && legendDef
            ? { ...prev.unlockedLegends, [legendDef.id]: Date.now() }
            : prev.unlockedLegends;

        const nextRecipes = {
          ...prev.discoveredRecipes,
          [recipe.sortedKey]: updatedRecipe,
        };

        const threeCraftFlag = prev.threeItemCraftDone || inputs.length === 3;

        if (prev.activeMode === "expedition" && prev.expedition) {
          return {
            ...prev,
            threeItemCraftDone: threeCraftFlag,
            discoveredRecipes: nextRecipes,
            unlockedLegends: nextLegends,
            expedition: {
              ...prev.expedition,
              ...updatedRun,
              legendsFoundInRun:
                prev.expedition.legendsFoundInRun + (isNewLegend ? 1 : 0),
            },
          };
        }

        return {
          ...prev,
          threeItemCraftDone: threeCraftFlag,
          discoveredRecipes: nextRecipes,
          unlockedLegends: nextLegends,
          sandbox: updatedRun,
        };
      });

      if (isNewLegend && legendDef) {
        notify(
          `Legendary Discovery unlocked: ${legendDef.emoji} ${legendDef.name} (+${legendDef.bonusCoins}c bonus)!`,
          "success"
        );
      } else {
        notify(
          fromCache
            ? `Crafted ${recipe.resultEmoji} ${recipe.resultName}`
            : `Locked new recipe: ${recipe.resultEmoji} ${recipe.resultName}!`,
          "success"
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Crafting failed.";
      setCraftError(message);
      notify(message, "error");
    } finally {
      setIsCrafting(false);
    }
  };

  const handleClaimChapter = (chapterId: string, rewardCoins: number) => {
    soundEngine.playAchievement();
    commitState((prev) => {
      if (prev.claimedChapters[chapterId]) return prev;
      const run = getActiveRun(prev);
      const updatedRun: RunState = {
        ...run,
        coins: run.coins + rewardCoins,
        totalEarned: run.totalEarned + rewardCoins,
      };
      const nextClaimed = { ...prev.claimedChapters, [chapterId]: Date.now() };
      if (prev.activeMode === "expedition" && prev.expedition) {
        return {
          ...prev,
          claimedChapters: nextClaimed,
          expedition: { ...prev.expedition, ...updatedRun },
        };
      }
      return {
        ...prev,
        claimedChapters: nextClaimed,
        sandbox: updatedRun,
      };
    });
    notify(`Chapter complete! Received +${rewardCoins}c`, "success");
  };

  const handleStartExpedition = () => {
    soundEngine.playTravel();
    setSelectedSlotIds([]);
    setLatestCraft(null);
    setCraftError(null);
    commitState((prev) => ({
      ...prev,
      activeMode: "expedition",
      expeditionCount: prev.expeditionCount + 1,
      expedition: createExpeditionRunState(prev.discoveredRecipes),
    }));
    notify("Started a 20-Hop Timed Expedition from London!", "info");
  };

  const handleFinishExpedition = () => {
    commitState((prev) => finalizeExpedition(prev));
  };

  const handleReturnToSandbox = () => {
    setSelectedSlotIds([]);
    setLatestCraft(null);
    setCraftError(null);
    commitState((prev) => ({
      ...prev,
      activeMode: "sandbox",
      expedition: null,
    }));
    notify("Returned to Relaxed Sandbox mode.", "info");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f5] text-slate-900">
      <TopHud
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCloudModal={() => setCloudModalOpen(true)}
        activeMode={saveState.activeMode}
        hopsRemaining={hopsRemaining}
        coins={activeRun.coins}
        totalEarned={saveState.sandbox.totalEarned}
        recipeCount={Object.keys(saveState.discoveredRecipes).length}
        legendCount={Object.keys(saveState.unlockedLegends).length}
        unlockedCount={Object.keys(saveState.unlockedAchievements).length}
        totalAchievements={ACHIEVEMENTS.length}
        muted={saveState.muted}
        onToggleMute={() =>
          commitState((prev) => ({ ...prev, muted: !prev.muted }))
        }
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {activeTab === "atlas" && (
          <>
            <ChapterAndModeStrip
              saveState={saveState}
              onClaimChapter={handleClaimChapter}
              onStartExpedition={handleStartExpedition}
              onFinishExpedition={handleFinishExpedition}
              onReturnToSandbox={handleReturnToSandbox}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-6">
                <WorldAtlasMap
                  currentCityId={activeRun.currentCityId}
                  coins={activeRun.coins}
                  chartedCities={saveState.chartedCities}
                  activeBounties={activeRun.activeBounties}
                  hopsRemaining={hopsRemaining}
                  onTravel={handleTravel}
                />

                <BountyBoard
                  bounties={activeRun.activeBounties}
                  currentCityId={activeRun.currentCityId}
                  guildSeals={activeRun.guildSeals}
                  satchel={activeRun.satchel}
                  onFulfillBounty={handleFulfillBounty}
                />

                <MarketLedger
                  city={currentCity}
                  visitState={currentVisit}
                  coins={activeRun.coins}
                  satchel={activeRun.satchel}
                  satchelCapacity={activeRun.satchelCapacity}
                  cheapestFare={cheapestFare}
                  activeBounties={activeRun.activeBounties}
                  onBuyItem={handleBuyItem}
                  onSellItem={handleSellItem}
                  onFulfillBounty={handleFulfillBounty}
                  onDoOddJob={handleDoOddJob}
                />
              </div>

              <div className="lg:col-span-5">
                <SatchelAndBench
                  satchel={activeRun.satchel}
                  satchelCapacity={activeRun.satchelCapacity}
                  coins={activeRun.coins}
                  selectedSlotIds={selectedSlotIds}
                  useThirdSlot={useThirdSlot}
                  isCrafting={isCrafting}
                  craftError={craftError}
                  latestCraft={latestCraft}
                  discoveredRecipes={saveState.discoveredRecipes}
                  onToggleItemInBench={handleToggleItemInBench}
                  onRemoveFromBench={handleRemoveFromBench}
                  onClearBench={() => setSelectedSlotIds([])}
                  onToggleThirdSlot={() => {
                    setUseThirdSlot((prev) => {
                      const next = !prev;
                      if (!next) {
                        setSelectedSlotIds((ids) => ids.slice(0, 2));
                      }
                      return next;
                    });
                  }}
                  onDiscardSatchelItem={handleDiscardSatchelItem}
                  onUpgradeSatchel={handleUpgradeSatchel}
                  onCombine={handleCombine}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === "grimoire" && (
          <GrimoireView
            discoveredRecipes={saveState.discoveredRecipes}
            unlockedLegends={saveState.unlockedLegends}
            chartedCities={saveState.chartedCities}
          />
        )}

        {activeTab === "achievements" && (
          <AchievementsView saveState={saveState} />
        )}
      </main>

      <ExpeditionSummaryModal
        expedition={saveState.activeMode === "expedition" ? saveState.expedition : null}
        bestScore={saveState.bestExpeditionScore}
        onPlayAgain={handleStartExpedition}
        onReturnToSandbox={handleReturnToSandbox}
      />

      <CloudSaveModal
        isOpen={cloudModalOpen}
        saveState={saveState}
        onClose={() => setCloudModalOpen(false)}
        onReplaceSave={(nextState) => {
          setSaveState(nextState);
          setSelectedSlotIds([]);
          setLatestCraft(null);
        }}
        onResetRun={() => {
          const fresh = StorageAdapter.resetLocal();
          setSaveState(fresh);
          setSelectedSlotIds([]);
          setLatestCraft(null);
          setCraftError(null);
          notify("Expedition reset to London.", "info");
        }}
        onNotify={notify}
      />

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-lg border shadow-lg text-xs font-medium animate-card-enter ${
              toast.tone === "success"
                ? "bg-slate-900 text-white border-emerald-500"
                : toast.tone === "error"
                ? "bg-rose-950 text-rose-100 border-rose-500"
                : "bg-slate-900 text-slate-100 border-slate-700"
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}
