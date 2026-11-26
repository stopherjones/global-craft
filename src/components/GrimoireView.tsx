import { BookOpen, Lock, MapPin, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CITY_BY_ID,
  LEGENDARY_DISCOVERIES,
  TAG_LABELS,
  WORLD_CITIES,
} from "../data/worldData";
import { ChartedCityMemory, LockedRecipe } from "../types/game";

interface GrimoireViewProps {
  discoveredRecipes: Record<string, LockedRecipe>;
  unlockedLegends: Record<string, number>;
  chartedCities: Record<string, ChartedCityMemory>;
}

export function GrimoireView({
  discoveredRecipes,
  unlockedLegends,
  chartedCities,
}: GrimoireViewProps) {
  const [subTab, setSubTab] = useState<"legends" | "recipes" | "cities">("legends");
  const [query, setQuery] = useState("");

  const recipes = useMemo(() => {
    const list = Object.values(discoveredRecipes).sort(
      (a, b) => b.discoveredAt - a.discoveredAt
    );
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.resultName.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.toLowerCase().includes(q)) ||
        r.tags.some((t) => TAG_LABELS[t].toLowerCase().includes(q))
    );
  }, [discoveredRecipes, query]);

  const cities = useMemo(() => {
    const list = Object.values(chartedCities).sort((a, b) => b.visitedAt - a.visitedAt);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.cityName.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.highDemandTags.some((t) => TAG_LABELS[t].toLowerCase().includes(q)) ||
        c.observedItemNames.some((n) => n.toLowerCase().includes(q))
    );
  }, [chartedCities, query]);

  const legends = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LEGENDARY_DISCOVERIES;
    return LEGENDARY_DISCOVERIES.filter(
      (leg) =>
        leg.riddle.toLowerCase().includes(q) ||
        (unlockedLegends[leg.id] &&
          (leg.name.toLowerCase().includes(q) ||
            leg.canonicalIngredients.some((ing) => ing.toLowerCase().includes(q))))
    );
  }, [query, unlockedLegends]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Explorer&apos;s Grimoire
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Shared across Sandbox &amp; Expedition runs: Legendary Masterworks, locked recipes, and city demand logs.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSubTab("legends")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                subTab === "legends"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hall of Legends ({Object.keys(unlockedLegends).length}/{LEGENDARY_DISCOVERIES.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("recipes")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                subTab === "recipes"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Locked Recipes ({Object.keys(discoveredRecipes).length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab("cities")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                subTab === "cities"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Charted Cities ({Object.keys(chartedCities).length}/{WORLD_CITIES.length})
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              subTab === "legends"
                ? "Search legendary riddles or unlocked masterworks..."
                : subTab === "recipes"
                ? "Filter by result, ingredient, or demand tag..."
                : "Filter charted cities, regions, or desired tags..."
            }
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {subTab === "legends" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {legends.map((legend) => {
            const isUnlocked = Boolean(unlockedLegends[legend.id]);

            if (!isUnlocked) {
              return (
                <article
                  key={legend.id}
                  className="bg-[#162130] text-slate-100 rounded-xl border border-slate-800 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[11px] text-amber-300 font-medium">
                          Uncharted Legend · 3-Item Synthesis
                        </div>
                        <h3 className="font-display text-lg font-bold text-white mt-0.5">
                          Shrouded Masterwork
                        </h3>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-emerald-300 tabular-nums shrink-0">
                      +{legend.bonusCoins}c bonus
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{legend.riddle}&rdquo;
                  </p>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    Hint: Switch the Crafting Bench to 3-Item Mode and combine matching world treasures.
                  </div>
                </article>
              );
            }

            return (
              <article
                key={legend.id}
                className="bg-white rounded-xl border border-amber-300 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                      {legend.emoji}
                    </div>
                    <div>
                      <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Legendary Discovery Unlocked</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                        {legend.name}
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-emerald-800 tabular-nums shrink-0">
                    {legend.baseValue}c base
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{legend.description}</p>
                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Formula: </span>
                  {legend.canonicalIngredients.join(" + ")}
                </div>
                <div className="text-[11px] text-slate-500 italic pt-2 border-t border-stone-100">
                  Spark: {legend.lateralSpark}
                </div>
              </article>
            );
          })}
        </div>
      ) : subTab === "recipes" ? (
        recipes.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-900">
              {Object.keys(discoveredRecipes).length === 0
                ? "No locked recipes yet"
                : "No recipes match your filter"}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Combine 2 or 3 ingredients on the Crafting Bench to lock new discoveries into your Grimoire.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
              <article
                key={recipe.sortedKey}
                className={`bg-white rounded-xl border p-4 space-y-2.5 ${
                  recipe.legendaryId ? "border-amber-300" : "border-stone-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-3xl leading-none shrink-0" aria-hidden="true">
                      {recipe.resultEmoji}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-slate-900 truncate">
                        {recipe.resultName}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {recipe.ingredients.join(" + ")}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-emerald-800 tabular-nums shrink-0">
                    {recipe.baseValue}c
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {recipe.resultDescription}
                </p>

                <div className="text-[11px] text-slate-500 italic pt-2 border-t border-stone-100">
                  Spark: {recipe.lateralSpark}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2">
                  <span>{recipe.tags.map((t) => TAG_LABELS[t]).join(" · ")}</span>
                  <span className="font-mono tabular-nums">Tier {recipe.tier}</span>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cities.map((city) => {
            const fullCity = CITY_BY_ID[city.cityId];
            return (
              <article
                key={city.cityId}
                className="bg-white rounded-xl border border-stone-200 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-slate-500">{city.region}</div>
                    <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-700" />
                      <span>{city.cityName}</span>
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {fullCity ? `${fullCity.catalog.length} catalog items` : ""}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div>
                    <span className="font-semibold text-emerald-800">High Demand: </span>
                    <span className="text-slate-700">
                      {city.highDemandTags.map((t) => TAG_LABELS[t]).join(" · ")}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Produces: </span>
                    <span className="text-slate-600">
                      {city.producerTags.map((t) => TAG_LABELS[t]).join(" · ")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 text-xs text-slate-600">
                  <span className="font-medium text-slate-800">Last observed stalls: </span>
                  {city.observedItemNames.join(" · ")}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
