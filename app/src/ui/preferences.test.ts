import { describe, expect, it, vi } from "vitest";
import { createPreferenceStore, DEFAULT_PREFERENCES, PREFERENCES_KEY, PROFILE_STORAGE_KEY, validPreferences } from "./preferences.ts";

const memory = () => {
  const data = new Map<string, string>();
  return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
};

describe("préférences de marche mémorisées", () => {
  it("APP-006 APP-011: première marche équilibrée, seule l'ancienne qualité migre", () => {
    const storage = memory(), notice = vi.fn();
    expect(createPreferenceStore(storage, notice).read()).toEqual(DEFAULT_PREFERENCES);
    storage.data.set("drwil_walk.cote-panneau", "left");
    storage.data.set("drwil_walk.poids-kg", "90");
    storage.data.set(PROFILE_STORAGE_KEY, "qualite");
    expect(createPreferenceStore(storage, notice).read()).toEqual({ ...DEFAULT_PREFERENCES, profile: "qualite" });
    storage.data.set(PROFILE_STORAGE_KEY, "inconnu");
    expect(createPreferenceStore(storage, notice).read().profile).toBe("equilibre");
    expect(notice).toHaveBeenLastCalledWith(expect.stringContaining("illisible"));
  });

  it("APP-006 APP-011 APP-013 APP-014: dernier choix relu et appliqué aux abonnés ; retrait de l'abonnement à la fin", () => {
    const storage = memory(), notice = vi.fn();
    const store = createPreferenceStore(storage, notice), listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    const chosen = { ...DEFAULT_PREFERENCES, traffic: true, lamps: false, fog: true, soundPct: 50, side: "left" as const, profile: "performance" as const };
    store.change(chosen);
    expect(listener).toHaveBeenLastCalledWith(chosen);
    expect(createPreferenceStore(storage, notice).read()).toEqual(chosen);
    chosen.soundPct = 0;
    expect(store.read().soundPct).toBe(50);
    unsubscribe();
    store.change(DEFAULT_PREFERENCES);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(notice).toHaveBeenLastCalledWith("");
  });

  it("QUA-002: mémoire illisible ou indisponible dite, sans bloquer la préférence pour cette marche", () => {
    const notice = vi.fn(), storage = memory();
    for (const raw of ["{}", "{", "null"]) {
      storage.data.set(PREFERENCES_KEY, raw);
      expect(createPreferenceStore(storage, notice).read()).toEqual(DEFAULT_PREFERENCES);
      expect(notice).toHaveBeenLastCalledWith(expect.stringMatching(/illisibles|relues/));
    }
    const bad = { getItem: () => { throw new Error("interdit"); }, setItem: () => { throw new Error("plein"); } };
    const store = createPreferenceStore(bad, notice);
    store.change({ ...DEFAULT_PREFERENCES, trees: false });
    expect(store.read().trees).toBe(false);
    expect(notice).toHaveBeenLastCalledWith(expect.stringContaining("seulement pour cette séance"));
    createPreferenceStore(undefined, notice).change(DEFAULT_PREFERENCES);
    expect(notice).toHaveBeenLastCalledWith(expect.stringContaining("seulement pour cette séance"));
  });

  it("APP-001: refuse valeurs étrangères, volume non fini et opacité qui rendrait le panneau illisible", () => {
    for (const value of [null, "x", {}, { ...DEFAULT_PREFERENCES, profile: "x" }, { ...DEFAULT_PREFERENCES, traffic: 1 },
      { ...DEFAULT_PREFERENCES, side: "center" }, { ...DEFAULT_PREFERENCES, soundPct: "50" },
      ...[-1, 101, NaN].map((soundPct) => ({ ...DEFAULT_PREFERENCES, soundPct })),
      ...[undefined, NaN, 69, 101].map((panelOpacityPct) => ({ ...DEFAULT_PREFERENCES, panelOpacityPct }))]) {
      expect(validPreferences(value)).toBe(false);
    }
    expect(() => { createPreferenceStore(undefined, vi.fn()).change({ ...DEFAULT_PREFERENCES, soundPct: -1 }); }).toThrow("invalides");
  });
});
