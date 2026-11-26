import { Cloud, Download, RotateCcw, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { CloudBackendConfig, StorageAdapter } from "../services/storageAdapter";
import { SaveState } from "../types/game";

interface CloudSaveModalProps {
  isOpen: boolean;
  saveState: SaveState;
  onClose: () => void;
  onReplaceSave: (nextState: SaveState) => void;
  onResetRun: () => void;
  onNotify: (msg: string, tone: "success" | "error" | "info") => void;
}

export function CloudSaveModal({
  isOpen,
  saveState,
  onClose,
  onReplaceSave,
  onResetRun,
  onNotify,
}: CloudSaveModalProps) {
  const [config, setConfig] = useState<CloudBackendConfig>(() =>
    StorageAdapter.getCloudConfig()
  );
  const [syncBusy, setSyncBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    StorageAdapter.saveCloudConfig(config);
    onNotify("Backend endpoints saved locally.", "info");
  };

  const handlePushCloud = async () => {
    setSyncBusy(true);
    try {
      StorageAdapter.saveCloudConfig(config);
      await StorageAdapter.pushToCloud(saveState, config);
      onNotify("Progress uploaded to Cloudflare save store.", "success");
    } catch (err) {
      onNotify(err instanceof Error ? err.message : "Cloud upload failed.", "error");
    } finally {
      setSyncBusy(false);
    }
  };

  const handlePullCloud = async () => {
    setSyncBusy(true);
    try {
      StorageAdapter.saveCloudConfig(config);
      const loaded = await StorageAdapter.pullFromCloud(config);
      onReplaceSave(loaded);
      onNotify("Progress restored from Cloudflare save store.", "success");
      onClose();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : "Cloud restore failed.", "error");
    } finally {
      setSyncBusy(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(saveState, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wandercraft-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify("Exported save file.", "success");
  };

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text();
      const migrated = StorageAdapter.parseImportedSave(text);
      StorageAdapter.saveLocal(migrated);
      onReplaceSave(migrated);
      onNotify("Imported save file successfully.", "success");
      onClose();
    } catch (err) {
      onNotify(err instanceof Error ? err.message : "Failed to import save.", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white text-slate-900 rounded-xl border border-stone-200 max-w-lg w-full shadow-2xl overflow-hidden animate-card-enter">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Saves &amp; Cloudflare Sync
            </h2>
            <p className="text-xs text-slate-500">
              Auto-saved in browser storage · Portable JSON &amp; Worker hooks
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg hover:bg-stone-100 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-700">Local File Backup</h3>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExportJson}
                className="px-3.5 py-2 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportJson(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-slate-600" />
                <span>Cloudflare Worker Endpoints (Optional)</span>
              </h3>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer"
              >
                Save Settings
              </button>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs text-slate-600">
                Save Endpoint URL (GET/PUT /:playerId)
                <input
                  type="url"
                  value={config.saveEndpoint}
                  onChange={(e) => setConfig({ ...config, saveEndpoint: e.target.value })}
                  placeholder="https://wandercraft-saves.your-subdomain.workers.dev/saves"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </label>

              <label className="block text-xs text-slate-600">
                Player Sync ID
                <input
                  type="text"
                  value={config.playerSyncId}
                  onChange={(e) => setConfig({ ...config, playerSyncId: e.target.value })}
                  placeholder="e.g. captain-atlas-01"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </label>

              <label className="block text-xs text-slate-600">
                Crafting Worker Base URL (leave blank for same-origin /api/craft)
                <input
                  type="url"
                  value={config.apiBaseUrl}
                  onChange={(e) => setConfig({ ...config, apiBaseUrl: e.target.value })}
                  placeholder="https://wandercraft-ai.your-subdomain.workers.dev"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                disabled={syncBusy}
                onClick={handlePushCloud}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                Upload Save
              </button>
              <button
                type="button"
                disabled={syncBusy}
                onClick={handlePullCloud}
                className="px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-50 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Restore from Cloud
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Fresh Expedition (Reset Save)</span>
              </button>
            ) : (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-rose-900 font-medium">
                  Erase coins, satchel, legends, and locked Grimoire?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-md bg-white border border-stone-300 text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmReset(false);
                      onResetRun();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-xs font-semibold text-white cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
