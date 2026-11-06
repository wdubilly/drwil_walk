import { FALLBACK_PROFILE, isProfileId, type ProfileId } from "../render/profiles.ts";
import { DEFAULT_PANEL_SIDE, type PanelSide } from "./panel-side.ts";

export interface Preferences {
  profile: ProfileId;
  traffic: boolean;
  lamps: boolean;
  trees: boolean;
  fog: boolean;
  soundPct: number;
  side: PanelSide;
  panelOpacityPct: number;
}

export const PREFERENCES_KEY = "drwil_walk.preferences-v1";
export const PROFILE_STORAGE_KEY = "drwil_walk.profil-graphique";
export type ProfileStorage = Pick<Storage, "getItem" | "setItem">;
export const DEFAULT_PREFERENCES: Preferences = {
  profile: FALLBACK_PROFILE, traffic: false, lamps: true, trees: true, fog: false,
  soundPct: 0, side: DEFAULT_PANEL_SIDE, panelOpacityPct: 70,
};

export function validPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return isProfileId(v.profile) && ["traffic", "lamps", "trees", "fog"].every((k) => typeof v[k] === "boolean")
    && (v.side === "left" || v.side === "right")
    && typeof v.soundPct === "number" && Number.isFinite(v.soundPct) && v.soundPct >= 0 && v.soundPct <= 100
    && typeof v.panelOpacityPct === "number" && Number.isFinite(v.panelOpacityPct) && v.panelOpacityPct >= 70 && v.panelOpacityPct <= 100;
}

export interface PreferenceStore {
  read(): Preferences;
  change(next: Preferences): void;
  subscribe(listener: (value: Preferences) => void): () => void;
}

export function createPreferenceStore(storage: ProfileStorage | undefined, notice: (text: string) => void): PreferenceStore {
  let current = { ...DEFAULT_PREFERENCES };
  try {
    const raw = storage?.getItem(PREFERENCES_KEY);
    if (raw) {
      const value: unknown = JSON.parse(raw);
      if (validPreferences(value)) current = { ...value };
      else notice("Les préférences gardées sont illisibles : valeurs par défaut.");
    } else {
      const profile = storage?.getItem(PROFILE_STORAGE_KEY);
      if (isProfileId(profile)) current.profile = profile;
      else if (profile) notice("Le profil gardé est illisible : Équilibré s'applique.");
    }
  } catch {
    notice("Les préférences ne peuvent pas être relues : valeurs par défaut.");
  }
  const listeners = new Set<(value: Preferences) => void>();
  return {
    read: () => ({ ...current }),
    change: (next) => {
      if (!validPreferences(next)) throw new Error("Préférences invalides");
      current = { ...next };
      try {
        if (!storage) throw new Error("stockage absent");
        storage.setItem(PREFERENCES_KEY, JSON.stringify(current));
        notice("");
      } catch {
        notice("Les préférences ne peuvent pas être gardées : elles servent seulement pour cette séance.");
      }
      for (const listener of listeners) listener({ ...current });
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}
