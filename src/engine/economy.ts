import {
  ACHIEVEMENTS,
  CITY_BY_ID,
  EXPEDITION_MEDAL_THRESHOLDS,
  EXPEDITION_TOTAL_HOPS,
  EXPLORER_RANKS,
  LEGENDARY_DISCOVERIES,
  SEEDED_BOUNTY_BLUEPRINTS,
  STARTING_CITY_ID,
  STARTING_COINS,
  WORLD_CITIES,
} from "../data/worldData";
import {
  CatalogItem,
  CityNode,
  CityVisitState,
  ExpeditionRun,
  GuildBounty,
  ItemTag,
  LockedRecipe,
  MarketShelfEntry,
  RunState,
  SatchelItem,
  SaveState,
} from "../types/game";

export interface SellQuote {
  sellPrice: number;
  demandTier: "high" | "standard" | "surplus";
  demandLabel: string;
  profitDelta: number;
}

export interface ShortestPathResult {
  path: string[];
  totalFare: number;
  totalKm: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function rollCityShelf(city: CityNode): MarketShelfEntry[] {
  const count = Math.random() < 0.5 ? 3 : 4;
  const picked = shuffleArray(city.catalog).slice(0, count);
  return picked.map((item) => {
    const stock = 2 + Math.floor(Math.random() * 3);
    return {
      itemId: item.id,
      stockLeft: stock,
      initialStock: stock,
    };
  });
}

export function createInitialCityStates(): Record<string, CityVisitState> {
  const states: Record<string, CityVisitState> = {};
  WORLD_CITIES.forEach((city) => {
    states[city.id] = {
      activeShelf: rollCityShelf(city),
      hopsAwaySinceRefresh: 0,
      salesCountByItemName: {},
    };
  });
  return states;
}

function makeBountyId(): string {
  return `bounty-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function generateSingleBounty(
  currentCityId: string,
  discoveredRecipes: Record<string, LockedRecipe>,
  existingBounties: GuildBounty[],
  guildSeals: number,
  currentHop: number
): GuildBounty {
  const usedNames = new Set(existingBounties.map((b) => b.targetItemName.toLowerCase()));
  const usedCities = new Set(existingBounties.map((b) => b.targetCityId));

  // Prefer destination cities the player isn't standing in and that don't already have a bounty
  const candidateCities = WORLD_CITIES.filter(
    (c) => c.id !== currentCityId && !usedCities.has(c.id)
  );
  const fallbackCities = WORLD_CITIES.filter((c) => c.id !== currentCityId);
  const poolCities = candidateCities.length > 0 ? candidateCities : fallbackCities;
  const targetCity = poolCities[Math.floor(Math.random() * poolCities.length)];

  // Candidate pool: crafted discoveries + seeded blueprints + foreign imports
  interface Candidate {
    itemName: string;
    itemEmoji: string;
    clueText: string;
    difficulty: 1 | 2 | 3;
    baseReward: number;
  }

  const candidates: Candidate[] = [];

  // 1. Unlocked Grimoire recipes (including Gemini creations!)
  Object.values(discoveredRecipes)
    .filter((r) => !r.legendaryId && !usedNames.has(r.resultName.toLowerCase()))
    .forEach((r) => {
      candidates.push({
        itemName: r.resultName,
        itemEmoji: r.resultEmoji,
        clueText: `Known recipe: ${r.ingredients.join(" + ")}`,
        difficulty: r.tier >= 2 ? 3 : 2,
        baseReward: Math.round(r.baseValue * 2.35 + 45),
      });
    });

  // 2. Curated solvable crafted blueprints
  SEEDED_BOUNTY_BLUEPRINTS.filter((bp) => !usedNames.has(bp.itemName.toLowerCase())).forEach(
    (bp) => {
      if (bp.difficulty === 2 && guildSeals < 1) return;
      candidates.push({
        itemName: bp.itemName,
        itemEmoji: bp.itemEmoji,
        clueText: bp.clueText,
        difficulty: bp.difficulty,
        baseReward: bp.difficulty === 2 ? 235 : 145,
      });
    }
  );

  // 3. Foreign catalog import (exclude items produced in targetCity)
  const targetCatalogNames = new Set(targetCity.catalog.map((c) => c.name.toLowerCase()));
  WORLD_CITIES.filter((c) => c.id !== targetCity.id).forEach((originCity) => {
    originCity.catalog.forEach((item) => {
      if (
        !targetCatalogNames.has(item.name.toLowerCase()) &&
        !usedNames.has(item.name.toLowerCase())
      ) {
        candidates.push({
          itemName: item.name,
          itemEmoji: item.emoji,
          clueText: `Imported from ${originCity.name}`,
          difficulty: 1,
          baseReward: Math.round(item.baseValue * 2.5 + 35),
        });
      }
    });
  });

  const chosen =
    candidates[Math.floor(Math.random() * candidates.length)] || {
      itemName: "Earl Grey",
      itemEmoji: "🫖",
      clueText: "Craft 2 items · try London",
      difficulty: 1 as const,
      baseReward: 140,
    };

  const sealBonus = chosen.difficulty === 3 ? 2 : 1;
  const rewardCoins = Math.max(85, chosen.baseReward + guildSeals * 8);

  return {
    id: makeBountyId(),
    targetCityId: targetCity.id,
    targetItemName: chosen.itemName,
    targetItemEmoji: chosen.itemEmoji,
    rewardCoins,
    rewardSeals: sealBonus,
    clueText: chosen.clueText,
    difficulty: chosen.difficulty,
    createdAtHop: currentHop,
  };
}

export function fillBountyBoard(
  currentCityId: string,
  discoveredRecipes: Record<string, LockedRecipe>,
  existingBounties: GuildBounty[],
  guildSeals: number,
  currentHop: number,
  targetCount = 4
): GuildBounty[] {
  const list = [...existingBounties];
  while (list.length < targetCount) {
    list.push(
      generateSingleBounty(
        currentCityId,
        discoveredRecipes,
        list,
        guildSeals,
        currentHop
      )
    );
  }
  return list;
}

export function createInitialRunState(
  discoveredRecipes: Record<string, LockedRecipe> = {}
): RunState {
  const cityStates = createInitialCityStates();
  const activeBounties = fillBountyBoard(
    STARTING_CITY_ID,
    discoveredRecipes,
    [],
    0,
    0,
    4
  );

  return {
    coins: STARTING_COINS,
    totalEarned: 0,
    totalTrades: 0,
    totalCrafts: 0,
    biggestSale: 0,
    currentCityId: STARTING_CITY_ID,
    hopCount: 0,
    satchelCapacity: 8,
    satchel: [],
    cityStates,
    activeBounties,
    guildSeals: 0,
    completedBounties: 0,
  };
}

export function createExpeditionRunState(
  discoveredRecipes: Record<string, LockedRecipe>
): ExpeditionRun {
  const base = createInitialRunState(discoveredRecipes);
  return {
    ...base,
    startingHops: EXPEDITION_TOTAL_HOPS,
    hopsRemaining: EXPEDITION_TOTAL_HOPS,
    isFinished: false,
    legendsFoundInRun: 0,
    finalScore: 0,
    medal: "Chartered",
  };
}

export function computeExpeditionScore(run: ExpeditionRun): {
  score: number;
  satchelValue: number;
  sealsBonus: number;
  legendsBonus: number;
  medal: "Gold" | "Silver" | "Bronze" | "Chartered";
} {
  const satchelValue = run.satchel.reduce((acc, item) => acc + item.baseValue, 0);
  const sealsBonus = run.guildSeals * 150;
  const legendsBonus = run.legendsFoundInRun * 250;
  const score = run.coins + satchelValue + sealsBonus + legendsBonus;

  const medal =
    score >= EXPEDITION_MEDAL_THRESHOLDS.gold
      ? "Gold"
      : score >= EXPEDITION_MEDAL_THRESHOLDS.silver
      ? "Silver"
      : score >= EXPEDITION_MEDAL_THRESHOLDS.bronze
      ? "Bronze"
      : "Chartered";

  return { score, satchelValue, sealsBonus, legendsBonus, medal };
}

export function createInitialSaveState(): SaveState {
  const startCity = CITY_BY_ID[STARTING_CITY_ID];
  const sandbox = createInitialRunState({});
  const observedNames = sandbox.cityStates[startCity.id].activeShelf
    .map((entry) => startCity.catalog.find((c) => c.id === entry.itemId)?.name)
    .filter((n): n is string => Boolean(n));

  return {
    version: 2,
    activeMode: "sandbox",
    sandbox,
    expedition: null,
    chartedCities: {
      [startCity.id]: {
        cityId: startCity.id,
        cityName: startCity.name,
        region: startCity.region,
        visitedAt: Date.now(),
        observedItemNames: observedNames,
        highDemandTags: [...startCity.highDemandTags],
        producerTags: [...startCity.producerTags],
      },
    },
    discoveredRecipes: {},
    unlockedLegends: {},
    unlockedAchievements: {},
    claimedChapters: {},
    bestExpeditionScore: 0,
    bestExpeditionMedal: null,
    expeditionCount: 0,
    threeItemCraftDone: false,
    muted: false,
  };
}

export function getActiveRun(state: SaveState): RunState {
  if (state.activeMode === "expedition" && state.expedition) {
    return state.expedition;
  }
  return state.sandbox;
}

export function calculateBuyPrice(item: CatalogItem, city: CityNode): number {
  const tagOverlap = item.tags.filter((t) => city.producerTags.includes(t)).length;
  const discount = tagOverlap > 0 ? 0.72 : 0.84;
  return Math.max(8, Math.round(item.baseValue * discount));
}

export function calculateSellQuote(
  item: Pick<
    SatchelItem,
    "name" | "baseValue" | "tags" | "paidPrice" | "origin" | "isCrafted" | "tier"
  >,
  city: CityNode,
  salesCountInCity: number
): SellQuote {
  const isProducedHere =
    !item.isCrafted &&
    city.catalog.some((c) => c.name.toLowerCase() === item.name.toLowerCase());

  if (isProducedHere || item.origin.toLowerCase() === city.name.toLowerCase()) {
    const surplusPrice = Math.max(5, Math.round(item.baseValue * 0.45));
    return {
      sellPrice: surplusPrice,
      demandTier: "surplus",
      demandLabel: "Local Surplus",
      profitDelta: surplusPrice - item.paidPrice,
    };
  }

  const demandMatches = item.tags.filter((t: ItemTag) =>
    city.highDemandTags.includes(t)
  ).length;
  const producerPenaltyMatches = item.tags.filter((t: ItemTag) =>
    city.producerTags.includes(t)
  ).length;

  let multiplier = 1.25;
  let demandTier: "high" | "standard" | "surplus" = "standard";
  let demandLabel = "Fair Market";

  if (demandMatches >= 2) {
    multiplier = 2.25;
    demandTier = "high";
    demandLabel = "Peak Demand";
  } else if (demandMatches === 1) {
    multiplier = 1.8;
    demandTier = "high";
    demandLabel = "High Demand";
  } else if (producerPenaltyMatches >= 2 && !item.isCrafted) {
    multiplier = 0.85;
    demandTier = "surplus";
    demandLabel = "Low Demand";
  }

  const saturationFactor = Math.max(0.75, 1 - salesCountInCity * 0.1);
  const craftPremium = item.isCrafted ? 1 + Math.min(item.tier, 3) * 0.08 : 1;

  const sellPrice = Math.max(
    8,
    Math.round(item.baseValue * multiplier * saturationFactor * craftPremium)
  );

  return {
    sellPrice,
    demandTier,
    demandLabel,
    profitDelta: sellPrice - item.paidPrice,
  };
}

export function findShortestPath(
  fromId: string,
  toId: string
): ShortestPathResult | null {
  if (fromId === toId) {
    return { path: [fromId], totalFare: 0, totalKm: 0 };
  }

  const dist: Record<string, number> = {};
  const km: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const unvisited = new Set<string>(WORLD_CITIES.map((c) => c.id));

  WORLD_CITIES.forEach((c) => {
    dist[c.id] = Infinity;
    km[c.id] = Infinity;
    prev[c.id] = null;
  });
  dist[fromId] = 0;
  km[fromId] = 0;

  while (unvisited.size > 0) {
    let current: string | null = null;
    for (const id of unvisited) {
      if (current === null || dist[id] < dist[current]) {
        current = id;
      }
    }

    if (current === null || dist[current] === Infinity) break;
    if (current === toId) break;

    unvisited.delete(current);
    const city = CITY_BY_ID[current];
    for (const edge of city.adjacentRoutes) {
      if (!unvisited.has(edge.targetCityId)) continue;
      const alt = dist[current] + edge.fareCoins;
      if (alt < dist[edge.targetCityId]) {
        dist[edge.targetCityId] = alt;
        km[edge.targetCityId] = km[current] + edge.distanceKm;
        prev[edge.targetCityId] = current;
      }
    }
  }

  if (dist[toId] === Infinity) return null;

  const path: string[] = [];
  let step: string | null = toId;
  while (step !== null) {
    path.unshift(step);
    step = prev[step];
  }

  return {
    path,
    totalFare: dist[toId],
    totalKm: km[toId],
  };
}

export function getExplorerRank(totalEarned: number): {
  currentTitle: string;
  nextTitle: string | null;
  nextThreshold: number | null;
} {
  let current = EXPLORER_RANKS[0];
  let next: (typeof EXPLORER_RANKS)[number] | null = EXPLORER_RANKS[1];

  for (let i = 0; i < EXPLORER_RANKS.length; i++) {
    if (totalEarned >= EXPLORER_RANKS[i].minEarned) {
      current = EXPLORER_RANKS[i];
      next = EXPLORER_RANKS[i + 1] ?? null;
    }
  }

  return {
    currentTitle: current.title,
    nextTitle: next ? next.title : null,
    nextThreshold: next ? next.minEarned : null,
  };
}

export function getChapterProgress(chapterId: string, state: SaveState): number {
  const run = getActiveRun(state);
  switch (chapterId) {
    case "ch_1_trade":
      return Math.max(run.totalTrades, state.sandbox.totalTrades);
    case "ch_2_bounty":
      return Math.max(run.completedBounties, state.sandbox.completedBounties);
    case "ch_3_satchel":
      return Math.max(run.satchelCapacity, state.sandbox.satchelCapacity);
    case "ch_4_triad":
      return state.threeItemCraftDone ? 1 : 0;
    case "ch_5_legend":
      return Object.keys(state.unlockedLegends).length;
    case "ch_6_atlas":
      return Object.keys(state.chartedCities).length;
    default:
      return 0;
  }
}

export function getAchievementProgress(achievementId: string, state: SaveState): number {
  const run = getActiveRun(state);
  const recipeCount = Object.keys(state.discoveredRecipes).length;
  const chartedCount = Object.keys(state.chartedCities).length;
  const legendCount = Object.keys(state.unlockedLegends).length;
  const bestTrades = Math.max(run.totalTrades, state.sandbox.totalTrades);
  const bestBounties = Math.max(run.completedBounties, state.sandbox.completedBounties);
  const bestSale = Math.max(run.biggestSale, state.sandbox.biggestSale);
  const bestCoins = Math.max(run.coins, state.sandbox.coins);
  const bestEarned = Math.max(run.totalEarned, state.sandbox.totalEarned);
  const bestCrafts = Math.max(run.totalCrafts, state.sandbox.totalCrafts);
  const bestSatchel = Math.max(run.satchelCapacity, state.sandbox.satchelCapacity);

  switch (achievementId) {
    case "first_trade":
      return bestTrades;
    case "bounty_1":
    case "bounty_5":
      return bestBounties;
    case "big_margin":
      return bestSale;
    case "purse_500":
    case "purse_2000":
      return bestCoins;
    case "earned_5000":
      return bestEarned;
    case "first_craft":
      return bestCrafts;
    case "triple_craft":
      return state.threeItemCraftDone ? 1 : 0;
    case "recipes_5":
    case "recipes_20":
      return recipeCount;
    case "legend_1":
    case "legend_8":
      return legendCount;
    case "satchel_12":
      return bestSatchel;
    case "visit_8":
    case "visit_16":
      return chartedCount;
    default:
      return 0;
  }
}

export function evaluateNewAchievements(state: SaveState): string[] {
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (state.unlockedAchievements[ach.id]) continue;
    const progress = getAchievementProgress(ach.id, state);
    if (progress >= ach.target) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

export function findMatchingLegendByName(name: string): string | undefined {
  const normalized = name.trim().toLowerCase();
  const match = LEGENDARY_DISCOVERIES.find(
    (leg) => leg.name.toLowerCase() === normalized
  );
  return match?.id;
}
