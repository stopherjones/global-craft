import { createInitialRunState, createInitialSaveState, fillBountyBoard } from "../engine/economy";
import { RunState, SaveState } from "../types/game";

const SAVE_KEY = "wandercraft_save_v2";
const LEGACY_V1_KEY = "wandercraft_save_v1";
const CLOUD_CONFIG_KEY = "wandercraft_cloud_config_v1";

export interface CloudBackendConfig {
  saveEndpoint: string;
  apiBaseUrl: string;
  playerSyncId: string;
}

const DEFAULT_SAVE_ENDPOINT = import.meta.env.VITE_SAVE_ENDPOINT || "";
const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function migratePayload(rawObj: Record<string, unknown>): SaveState {
  const base = createInitialSaveState();

  // If v2 payload already has sandbox
  if (rawObj.version === 2 && rawObj.sandbox && typeof rawObj.sandbox === "object") {
    const partial = rawObj as Partial<SaveState>;
    const sandboxRun = {
      ...base.sandbox,
      ...(partial.sandbox as Partial<RunState>),
    };
    sandboxRun.activeBounties = fillBountyBoard(
      sandboxRun.currentCityId,
      partial.discoveredRecipes || {},
      Array.isArray(sandboxRun.activeBounties) ? sandboxRun.activeBounties : [],
      sandboxRun.guildSeals || 0,
      sandboxRun.hopCount || 0,
      4
    );

    return {
      ...base,
      ...partial,
      version: 2,
      sandbox: sandboxRun,
      expedition: partial.expedition || null,
      chartedCities: partial.chartedCities || base.chartedCities,
      discoveredRecipes: partial.discoveredRecipes || {},
      unlockedLegends: partial.unlockedLegends || {},
      unlockedAchievements: partial.unlockedAchievements || {},
      claimedChapters: partial.claimedChapters || {},
    };
  }

  // Migrate v1 save cleanly into v2.sandbox
  if (typeof rawObj.coins === "number" && typeof rawObj.currentCityId === "string") {
    const legacy = rawObj as Partial<RunState> & Partial<SaveState>;
    const freshRun = createInitialRunState(legacy.discoveredRecipes || {});
    const migratedRun: RunState = {
      ...freshRun,
      coins: typeof legacy.coins === "number" ? legacy.coins : freshRun.coins,
      totalEarned: typeof legacy.totalEarned === "number" ? legacy.totalEarned : 0,
      totalTrades: typeof legacy.totalTrades === "number" ? legacy.totalTrades : 0,
      totalCrafts: typeof legacy.totalCrafts === "number" ? legacy.totalCrafts : 0,
      biggestSale: typeof legacy.biggestSale === "number" ? legacy.biggestSale : 0,
      currentCityId: legacy.currentCityId || freshRun.currentCityId,
      hopCount: typeof legacy.hopCount === "number" ? legacy.hopCount : 0,
      satchelCapacity:
        typeof legacy.satchelCapacity === "number" ? legacy.satchelCapacity : 8,
      satchel: Array.isArray(legacy.satchel) ? legacy.satchel : [],
      cityStates: legacy.cityStates || freshRun.cityStates,
    };

    return {
      ...base,
      version: 2,
      activeMode: "sandbox",
      sandbox: migratedRun,
      chartedCities: legacy.chartedCities || base.chartedCities,
      discoveredRecipes: legacy.discoveredRecipes || {},
      unlockedAchievements: legacy.unlockedAchievements || {},
      threeItemCraftDone: Boolean(legacy.threeItemCraftDone),
      muted: Boolean(legacy.muted),
    };
  }

  return base;
}

export const StorageAdapter = {
  loadLocalSave(): SaveState {
    try {
      const rawV2 = localStorage.getItem(SAVE_KEY);
      if (rawV2) {
        return migratePayload(JSON.parse(rawV2) as Record<string, unknown>);
      }
      const rawV1 = localStorage.getItem(LEGACY_V1_KEY);
      if (rawV1) {
        const migrated = migratePayload(JSON.parse(rawV1) as Record<string, unknown>);
        this.saveLocal(migrated);
        return migrated;
      }
      return createInitialSaveState();
    } catch {
      return createInitialSaveState();
    }
  },

  saveLocal(state: SaveState): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to save state to localStorage:", err);
    }
  },

  parseImportedSave(jsonText: string): SaveState {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid WanderCraft save file.");
    }
    const isV2 = parsed.version === 2 && Boolean(parsed.sandbox);
    const isV1 = typeof parsed.coins === "number" && typeof parsed.currentCityId === "string";
    if (!isV2 && !isV1) {
      throw new Error("Save file does not match WanderCraft format.");
    }
    return migratePayload(parsed);
  },

  resetLocal(): SaveState {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_V1_KEY);
    const fresh = createInitialSaveState();
    this.saveLocal(fresh);
    return fresh;
  },

  getCloudConfig(): CloudBackendConfig {
    try {
      const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<CloudBackendConfig>) : {};
      return {
        saveEndpoint: String(parsed.saveEndpoint ?? DEFAULT_SAVE_ENDPOINT).trim(),
        apiBaseUrl: String(parsed.apiBaseUrl ?? DEFAULT_API_BASE_URL).trim(),
        playerSyncId: String(parsed.playerSyncId ?? "").trim(),
      };
    } catch {
      return {
        saveEndpoint: DEFAULT_SAVE_ENDPOINT,
        apiBaseUrl: DEFAULT_API_BASE_URL,
        playerSyncId: "",
      };
    }
  },

  saveCloudConfig(config: CloudBackendConfig): void {
    try {
      localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
    } catch (err) {
      console.error("Failed to store cloud backend config:", err);
    }
  },

  async pushToCloud(state: SaveState, config: CloudBackendConfig): Promise<void> {
    if (!config.saveEndpoint || !config.playerSyncId) {
      throw new Error("Configure both a Cloudflare Save Endpoint URL and a Player Sync ID.");
    }
    const url = `${config.saveEndpoint.replace(/\/$/, "")}/${encodeURIComponent(config.playerSyncId)}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    if (!response.ok) {
      throw new Error(`Cloud save failed (HTTP ${response.status}).`);
    }
  },

  async pullFromCloud(config: CloudBackendConfig): Promise<SaveState> {
    if (!config.saveEndpoint || !config.playerSyncId) {
      throw new Error("Configure both a Cloudflare Save Endpoint URL and a Player Sync ID.");
    }
    const url = `${config.saveEndpoint.replace(/\/$/, "")}/${encodeURIComponent(config.playerSyncId)}`;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Cloud load failed (HTTP ${response.status}).`);
    }
    const text = await response.text();
    const migrated = this.parseImportedSave(text);
    this.saveLocal(migrated);
    return migrated;
  },
};
