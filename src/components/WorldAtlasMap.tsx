import { Compass, Navigation } from "lucide-react";
import { useMemo, useState } from "react";
import { CITY_BY_ID, TAG_LABELS, WORLD_CITIES } from "../data/worldData";
import { findShortestPath } from "../engine/economy";
import { ChartedCityMemory, GuildBounty } from "../types/game";

interface WorldAtlasMapProps {
  currentCityId: string;
  coins: number;
  chartedCities: Record<string, ChartedCityMemory>;
  activeBounties: GuildBounty[];
  hopsRemaining: number | null;
  onTravel: (targetCityId: string) => void;
}

const CONTINENT_SILHOUETTES = [
  "M 85,105 L 185,82 L 295,95 L 332,148 L 288,212 L 244,242 L 236,288 L 198,282 L 156,228 L 122,188 Z",
  "M 248,295 L 308,298 L 352,338 L 328,412 L 280,432 L 258,365 Z",
  "M 382,78 L 424,74 L 426,96 L 384,98 Z",
  "M 442,96 L 548,88 L 598,132 L 584,198 L 538,205 L 492,196 L 448,186 L 442,140 Z",
  "M 438,220 L 552,216 L 605,256 L 595,332 L 548,402 L 498,392 L 468,314 L 428,266 Z",
  "M 594,104 L 775,92 L 908,138 L 892,226 L 832,262 L 775,342 L 732,326 L 686,294 L 624,254 L 584,194 Z",
  "M 792,354 L 882,350 L 902,402 L 828,418 L 788,390 Z",
];

export function WorldAtlasMap({
  currentCityId,
  coins,
  chartedCities,
  activeBounties,
  hopsRemaining,
  onTravel,
}: WorldAtlasMapProps) {
  const currentCity = CITY_BY_ID[currentCityId];
  const [selectedCityId, setSelectedCityId] = useState<string>(
    currentCity.adjacentRoutes[0]?.targetCityId || currentCityId
  );

  const selectedCity = CITY_BY_ID[selectedCityId] || currentCity;
  const outOfHops = hopsRemaining !== null && hopsRemaining <= 0;

  const bountyCityIds = useMemo(
    () => new Set(activeBounties.map((b) => b.targetCityId)),
    [activeBounties]
  );

  const selectedCityBounties = useMemo(
    () => activeBounties.filter((b) => b.targetCityId === selectedCity.id),
    [activeBounties, selectedCity.id]
  );

  const directEdge = currentCity.adjacentRoutes.find(
    (edge) => edge.targetCityId === selectedCity.id
  );

  const shortestPath = useMemo(
    () => findShortestPath(currentCityId, selectedCity.id),
    [currentCityId, selectedCity.id]
  );

  const uniqueEdges = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ from: string; to: string; fareCoins: number; isTransPacific: boolean }> = [];
    for (const city of WORLD_CITIES) {
      for (const edge of city.adjacentRoutes) {
        const key = [city.id, edge.targetCityId].sort().join("--");
        if (seen.has(key)) continue;
        seen.add(key);
        const isTransPacific =
          (city.id === "tokyo" && edge.targetCityId === "san_francisco") ||
          (city.id === "san_francisco" && edge.targetCityId === "tokyo");
        list.push({
          from: city.id,
          to: edge.targetCityId,
          fareCoins: edge.fareCoins,
          isTransPacific,
        });
      }
    }
    return list;
  }, []);

  const nextHopId =
    shortestPath && shortestPath.path.length > 1 ? shortestPath.path[1] : null;
  const nextHopEdge = nextHopId
    ? currentCity.adjacentRoutes.find((e) => e.targetCityId === nextHopId)
    : null;

  const pathEdgeKeys = useMemo(() => {
    const set = new Set<string>();
    if (!shortestPath || shortestPath.path.length < 2) return set;
    for (let i = 0; i < shortestPath.path.length - 1; i++) {
      set.add([shortestPath.path[i], shortestPath.path[i + 1]].sort().join("--"));
    }
    return set;
  }, [shortestPath]);

  const chartedMemory = chartedCities[selectedCity.id];

  return (
    <section className="bg-[#162130] text-slate-100 rounded-xl border border-slate-800 overflow-hidden">
      {/* Compact Atlas Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-amber-400 shrink-0" />
          <h2 className="font-display text-base sm:text-lg font-semibold text-white">
            World Trade Network
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span>Docked in {currentCity.name}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {Object.keys(chartedCities).length} / {WORLD_CITIES.length} charted
          </span>
        </div>
      </div>

      {/* Interactive SVG Map */}
      <div className="relative bg-[#101925] px-2 pt-2">
        <svg
          viewBox="0 50 1000 390"
          className="w-full h-auto max-h-[340px] select-none"
          role="img"
          aria-label="Interactive world trade route map"
        >
          {[120, 200, 280, 360].map((y) => (
            <line
              key={`lat-${y}`}
              x1={0}
              y1={y}
              x2={1000}
              y2={y}
              stroke="#1e2d42"
              strokeWidth={1}
              strokeDasharray="4 6"
            />
          ))}
          {[150, 300, 450, 600, 750, 900].map((x) => (
            <line
              key={`lon-${x}`}
              x1={x}
              y1={50}
              x2={x}
              y2={440}
              stroke="#1e2d42"
              strokeWidth={1}
              strokeDasharray="4 6"
            />
          ))}

          {CONTINENT_SILHOUETTES.map((d, idx) => (
            <path
              key={idx}
              d={d}
              fill="#1c2a3d"
              stroke="#283b54"
              strokeWidth={1.2}
            />
          ))}

          {uniqueEdges.map((edge) => {
            const cA = CITY_BY_ID[edge.from];
            const cB = CITY_BY_ID[edge.to];
            const key = [edge.from, edge.to].sort().join("--");
            const isHighlightedPath = pathEdgeKeys.has(key);
            const isAdjacentToCurrent =
              edge.from === currentCityId || edge.to === currentCityId;

            const stroke = isHighlightedPath
              ? "#f59e0b"
              : isAdjacentToCurrent
              ? "#10b981"
              : "#334863";
            const strokeWidth = isHighlightedPath ? 2.4 : isAdjacentToCurrent ? 1.8 : 1.1;
            const dash = isAdjacentToCurrent || isHighlightedPath ? undefined : "3 4";

            if (edge.isTransPacific) {
              const sf = cA.id === "san_francisco" ? cA : cB;
              const tok = cA.id === "tokyo" ? cA : cB;
              return (
                <g key={key}>
                  <line
                    x1={sf.mapCoords.x}
                    y1={sf.mapCoords.y}
                    x2={0}
                    y2={sf.mapCoords.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dash}
                  />
                  <line
                    x1={tok.mapCoords.x}
                    y1={tok.mapCoords.y}
                    x2={1000}
                    y2={tok.mapCoords.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dash}
                  />
                </g>
              );
            }

            return (
              <line
                key={key}
                x1={cA.mapCoords.x}
                y1={cA.mapCoords.y}
                x2={cB.mapCoords.x}
                y2={cB.mapCoords.y}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dash}
              />
            );
          })}

          {WORLD_CITIES.map((city) => {
            const isCurrent = city.id === currentCityId;
            const isSelected = city.id === selectedCity.id;
            const isAdjacent = currentCity.adjacentRoutes.some(
              (r) => r.targetCityId === city.id
            );
            const isCharted = Boolean(chartedCities[city.id]);
            const hasBounty = bountyCityIds.has(city.id);

            return (
              <g
                key={city.id}
                onClick={() => setSelectedCityId(city.id)}
                className="cursor-pointer"
              >
                <circle
                  cx={city.mapCoords.x}
                  cy={city.mapCoords.y}
                  r={18}
                  fill="transparent"
                />
                {hasBounty && (
                  <circle
                    cx={city.mapCoords.x}
                    cy={city.mapCoords.y}
                    r={10}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={1.6}
                    strokeDasharray="2 2"
                  />
                )}
                {isSelected && !isCurrent && (
                  <circle
                    cx={city.mapCoords.x}
                    cy={city.mapCoords.y}
                    r={12.5}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={1.8}
                  />
                )}
                {isCurrent && (
                  <circle
                    cx={city.mapCoords.x}
                    cy={city.mapCoords.y}
                    r={13}
                    fill="rgba(16, 185, 129, 0.2)"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                )}
                <circle
                  cx={city.mapCoords.x}
                  cy={city.mapCoords.y}
                  r={isCurrent ? 6.5 : isAdjacent ? 5.5 : 4.2}
                  fill={
                    isCurrent
                      ? "#10b981"
                      : isSelected
                      ? "#f59e0b"
                      : isAdjacent
                      ? "#34d399"
                      : isCharted
                      ? "#94a3b8"
                      : "#475569"
                  }
                  stroke="#0f172a"
                  strokeWidth={1.5}
                />
                <text
                  x={city.mapCoords.x}
                  y={city.mapCoords.y - 13}
                  textAnchor="middle"
                  className="text-[10.5px] font-medium pointer-events-none"
                  fill={
                    isCurrent || isSelected
                      ? "#ffffff"
                      : hasBounty
                      ? "#fde68a"
                      : isAdjacent
                      ? "#d1fae5"
                      : "#94a3b8"
                  }
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="px-3 py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-emerald-400 font-medium">Current / Adjacent Routes</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300 font-medium">Dashed Ring = Active Bounty</span>
          </div>
          <span>Click any city to inspect routes &amp; bounties</span>
        </div>
      </div>

      {/* Selected Destination & Direct Route Quick-List */}
      <div className="p-4 sm:p-5 bg-[#162130] border-t border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              <span>{selectedCity.region}</span>
              <span aria-hidden="true">·</span>
              {selectedCity.id === currentCityId ? (
                <span className="text-emerald-400 font-medium">Current Location</span>
              ) : directEdge ? (
                <span className="font-mono tabular-nums text-emerald-300">
                  Direct Hop · {directEdge.distanceKm.toLocaleString()} km · {directEdge.fareCoins}c
                </span>
              ) : shortestPath ? (
                <span className="font-mono tabular-nums text-amber-300">
                  {shortestPath.path.length - 1} Hops · {shortestPath.totalKm.toLocaleString()} km · {shortestPath.totalFare}c total
                </span>
              ) : null}
            </div>
            <h3 className="font-display text-lg font-bold text-white mt-0.5">
              {selectedCity.name}
            </h3>
            {selectedCityBounties.length > 0 && (
              <p className="text-xs text-amber-300 mt-1 font-medium">
                Active Bounty: {selectedCityBounties[0].targetItemEmoji}{" "}
                {selectedCityBounties[0].targetItemName} (+{selectedCityBounties[0].rewardCoins}c)
              </p>
            )}
            {chartedMemory ? (
              <p className="text-xs text-slate-300 mt-1">
                Charted Demand: {chartedMemory.highDemandTags.map((t) => TAG_LABELS[t]).join(" · ")}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                Uncharted market — visit to record local demand and catalog goods.
              </p>
            )}
            {!directEdge && shortestPath && shortestPath.path.length > 2 && (
              <p className="text-xs text-amber-200/90 mt-1">
                Route: {shortestPath.path.map((id) => CITY_BY_ID[id].name).join(" → ")}
              </p>
            )}
          </div>

          <div className="shrink-0">
            {selectedCity.id === currentCityId ? (
              <span className="inline-block px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium whitespace-nowrap">
                You are here
              </span>
            ) : directEdge ? (
              <button
                type="button"
                disabled={outOfHops || coins < directEdge.fareCoins}
                onClick={() => onTravel(selectedCity.id)}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>
                  Travel to {selectedCity.name} ({directEdge.fareCoins}c)
                </span>
              </button>
            ) : nextHopEdge && nextHopId ? (
              <button
                type="button"
                disabled={outOfHops || coins < nextHopEdge.fareCoins}
                onClick={() => onTravel(nextHopId)}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>
                  Next Hop: {CITY_BY_ID[nextHopId].name} ({nextHopEdge.fareCoins}c)
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/90">
          <div className="text-xs text-slate-400 mb-2">Direct Departures from {currentCity.name}</div>
          <div className="flex flex-wrap gap-2">
            {currentCity.adjacentRoutes.map((edge) => {
              const target = CITY_BY_ID[edge.targetCityId];
              const affordable = !outOfHops && coins >= edge.fareCoins;
              const hasBounty = bountyCityIds.has(target.id);
              return (
                <button
                  key={edge.targetCityId}
                  type="button"
                  onClick={() => {
                    setSelectedCityId(target.id);
                    if (affordable) onTravel(target.id);
                  }}
                  disabled={!affordable}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                    affordable
                      ? hasBounty
                        ? "bg-amber-950/50 hover:bg-amber-800/60 border-amber-600/60 text-amber-100"
                        : "bg-slate-800/80 hover:bg-emerald-800/70 border-slate-700 text-slate-100"
                      : "bg-slate-900 border-slate-800 text-slate-500"
                  }`}
                >
                  <span>{target.name}</span>
                  <span className="font-mono tabular-nums text-amber-300">
                    {edge.fareCoins}c
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
