import { makeRecipeKey, SEEDED_RECIPES } from "../data/worldData";
import { findMatchingLegendByName } from "../engine/economy";
import { CraftApiResponse, LockedRecipe, SatchelItem } from "../types/game";
import { StorageAdapter } from "./storageAdapter";

export interface CraftResolution {
  recipe: LockedRecipe;
  fromCache: boolean;
}

export async function resolveCraftCombination(
  inputs: SatchelItem[],
  discoveredRecipes: Record<string, LockedRecipe>
): Promise<CraftResolution> {
  const ingredientNames = inputs.map((i) => i.name);
  const key = makeRecipeKey(ingredientNames);

  // 1. Check player's already locked recipes first
  const existing = discoveredRecipes[key];
  if (existing) {
    return { recipe: existing, fromCache: true };
  }

  // 2. Check pre-seeded classic & legendary recipes (zero API latency / quota)
  const seeded = SEEDED_RECIPES[key];
  if (seeded) {
    return {
      recipe: {
        ...seeded,
        ingredients: ingredientNames,
        discoveredAt: Date.now(),
        craftCount: 1,
      },
      fromCache: false,
    };
  }

  // 3. Call server-side Gemini Flash-Lite endpoint (or Cloudflare Worker when configured)
  const { apiBaseUrl } = StorageAdapter.getCloudConfig();
  const base = apiBaseUrl ? apiBaseUrl.replace(/\/$/, "") : "";
  const response = await fetch(`${base}/api/craft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ingredients: inputs.map((item) => ({
        name: item.name,
        emoji: item.emoji,
        baseValue: item.baseValue,
        tier: item.tier,
        tags: item.tags,
      })),
    }),
  });

  const data = (await response.json()) as CraftApiResponse & { error?: string };
  if (!response.ok || !data.name) {
    throw new Error(data.error || `Crafting request failed (HTTP ${response.status}).`);
  }

  const matchedLegendId = findMatchingLegendByName(data.name);

  const locked: LockedRecipe = {
    sortedKey: key,
    ingredients: ingredientNames,
    resultName: data.name,
    resultEmoji: data.emoji,
    resultDescription: data.description,
    lateralSpark: data.connection,
    tags: data.tags,
    tier: data.tier,
    baseValue: data.baseValue,
    discoveredAt: Date.now(),
    craftCount: 1,
    legendaryId: matchedLegendId,
  };

  return { recipe: locked, fromCache: false };
}
