import { Window } from "happy-dom";
import { describe, expect, it, vi } from "vitest";
import { createPreferenceStore, DEFAULT_PREFERENCES } from "./preferences.ts";
import { cyclePreference, PREFERENCE_ROWS, renderWalkPreferences, rowText, type PreferenceRow } from "./walk-preferences.ts";

describe("commandes des préférences sur écran", () => {
  it("APP-006 APP-007 APP-011 APP-013 APP-014: les huit commandes sont appliquées et reflétées sans fermer la marche", () => {
    const doc = new Window().document as unknown as Document;
    const store = createPreferenceStore(undefined, vi.fn());
    const ui = renderWalkPreferences(doc, doc.body, store);
    expect(doc.querySelector("summary")?.textContent).toBe("Préférences de marche");
    const buttons = [...doc.querySelectorAll<HTMLButtonElement>("button")];
    expect(buttons).toHaveLength(8);
    buttons.forEach((button) => { button.click(); });
    expect(store.read()).toEqual({ profile: "qualite", traffic: true, lamps: false, trees: false, fog: true, soundPct: 25, side: "left", panelOpacityPct: 80 });
    expect(buttons[1]?.textContent).toContain("piétons et circulation) : Oui");
    for (let i = 0; i < 4; i++) cyclePreference(store, PREFERENCE_ROWS[5] as PreferenceRow);
    expect(store.read().soundPct).toBe(0);
    expect(rowText(PREFERENCE_ROWS[5] as PreferenceRow, { ...DEFAULT_PREFERENCES, soundPct: 33 })).toContain("33");
    ui.remove();
    expect(doc.querySelector("details")).toBeNull();
    store.change(DEFAULT_PREFERENCES);
  });
});
