import { PROFILES } from "../render/profiles.ts";
import type { Preferences, PreferenceStore } from "./preferences.ts";

export interface PreferenceRow {
  key: keyof Preferences;
  label: string;
  values: readonly (string | number | boolean)[];
  labels: readonly string[];
}

export const PREFERENCE_ROWS: readonly PreferenceRow[] = [
  { key: "profile", label: "Qualité", values: PROFILES.map((p) => p.id), labels: PROFILES.map((p) => p.label) },
  ...([["traffic", "Ville vivante (piétons et circulation)"], ["lamps", "Lampadaires"], ["trees", "Arbres"], ["fog", "Brouillard"]] as const)
    .map(([key, label]) => ({ key, label, values: [false, true], labels: ["Non", "Oui"] })),
  { key: "soundPct", label: "Sons d'ambiance (%)", values: [0, 25, 50, 75, 100], labels: ["Coupés", "25", "50", "75", "100"] },
  { key: "side", label: "Côté du panneau", values: ["left", "right"], labels: ["À gauche", "À droite"] },
  { key: "panelOpacityPct", label: "Opacité du panneau (%)", values: [70, 80, 90, 100], labels: ["70", "80", "90", "100"] },
];

export function rowText(row: PreferenceRow, prefs: Preferences): string {
  return `${row.label} : ${row.labels[row.values.indexOf(prefs[row.key])] ?? String(prefs[row.key])}`;
}

export function cyclePreference(store: PreferenceStore, row: PreferenceRow): void {
  const prefs = store.read();
  const index = (row.values.indexOf(prefs[row.key]) + 1) % row.values.length;
  store.change({ ...prefs, [row.key]: row.values[index] });
}

export function renderWalkPreferences(doc: Document, root: HTMLElement, store: PreferenceStore): { remove(): void } {
  const element = doc.createElement("details");
  element.className = "walk-preferences";
  const summary = Object.assign(doc.createElement("summary"), { textContent: "Préférences de marche" });
  element.append(summary);
  const buttons = PREFERENCE_ROWS.map((row) => {
    const button = Object.assign(doc.createElement("button"), { type: "button", textContent: rowText(row, store.read()) });
    button.addEventListener("click", () => { cyclePreference(store, row); });
    element.append(button);
    return button;
  });
  const unsubscribe = store.subscribe((prefs) => {
    buttons.forEach((button, i) => { button.textContent = rowText(PREFERENCE_ROWS[i] as PreferenceRow, prefs); });
  });
  root.append(element);
  return { remove: () => { unsubscribe(); element.remove(); } };
}
