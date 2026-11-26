export type ItemTag =
  | "beverage"
  | "culinary"
  | "textile"
  | "fashion"
  | "weather"
  | "heritage"
  | "transport"
  | "tech"
  | "craft"
  | "luxury"
  | "music"
  | "botanical"
  | "romance"
  | "spice"
  | "architecture";

export type PlayMode = "sandbox" | "expedition";

export interface CatalogItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  baseValue: number;
  tags: ItemTag[];
}

export interface RouteEdge {
  targetCityId: string;
  distanceKm: number;
  fareCoins: number;
}

export interface CityNode {
  id: string;
  name: string;
  region: string;
  mapCoords: { x: number; y: number };
  producerTags: ItemTag[];
  highDemandTags: ItemTag[];
  demandBlurb: string;
  adjacentRoutes: RouteEdge[];
  catalog: CatalogItem[];
}

export interface SatchelItem {
  instanceId: string;
  name: string;
  emoji: string;
  description: string;
  origin: string;
  baseValue: number;
  paidPrice: number;
  tags: ItemTag[];
  tier: number;
  isCrafted: boolean;
}

export interface MarketShelfEntry {
  itemId: string;
  stockLeft: number;
  initialStock: number;
}

export interface CityVisitState {
  activeShelf: MarketShelfEntry[];
  hopsAwaySinceRefresh: number;
  salesCountByItemName: Record<string, number>;
}

export interface LockedRecipe {
  sortedKey: string;
  ingredients: string[];
  resultName: string;
  resultEmoji: string;
  resultDescription: string;
  lateralSpark: string;
  tags: ItemTag[];
  tier: number;
  baseValue: number;
  discoveredAt: number;
  craftCount: number;
  isSeeded?: boolean;
  legendaryId?: string;
}

export interface LegendaryDef {
  id: string;
  name: string;
  emoji: string;
  riddle: string;
  description: string;
  lateralSpark: string;
  canonicalIngredients: string[];
  tags: ItemTag[];
  baseValue: number;
  bonusCoins: number;
}

export interface GuildBounty {
  id: string;
  targetCityId: string;
  targetItemName: string;
  targetItemEmoji: string;
  rewardCoins: number;
  rewardSeals: number;
  clueText: string;
  difficulty: 1 | 2 | 3;
  createdAtHop: number;
}

export interface ChapterObjectiveDef {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  rewardCoins: number;
  target: number;
}

export interface ChartedCityMemory {
  cityId: string;
  cityName: string;
  region: string;
  visitedAt: number;
  observedItemNames: string[];
  highDemandTags: ItemTag[];
  producerTags: ItemTag[];
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: "wealth" | "alchemy" | "travel" | "trade";
  target: number;
}

export interface RunState {
  coins: number;
  totalEarned: number;
  totalTrades: number;
  totalCrafts: number;
  biggestSale: number;
  currentCityId: string;
  hopCount: number;
  satchelCapacity: number;
  satchel: SatchelItem[];
  cityStates: Record<string, CityVisitState>;
  activeBounties: GuildBounty[];
  guildSeals: number;
  completedBounties: number;
}

export interface ExpeditionRun extends RunState {
  startingHops: number;
  hopsRemaining: number;
  isFinished: boolean;
  legendsFoundInRun: number;
  finalScore: number;
  medal: "Gold" | "Silver" | "Bronze" | "Chartered";
}

export interface SaveState {
  version: number;
  activeMode: PlayMode;
  sandbox: RunState;
  expedition: ExpeditionRun | null;
  chartedCities: Record<string, ChartedCityMemory>;
  discoveredRecipes: Record<string, LockedRecipe>;
  unlockedLegends: Record<string, number>;
  unlockedAchievements: Record<string, number>;
  claimedChapters: Record<string, number>;
  bestExpeditionScore: number;
  bestExpeditionMedal: string | null;
  expeditionCount: number;
  threeItemCraftDone: boolean;
  muted: boolean;
}

export interface CraftApiResponse {
  name: string;
  emoji: string;
  description: string;
  connection: string;
  tags: ItemTag[];
  tier: number;
  baseValue: number;
}
