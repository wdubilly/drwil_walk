import type { Page } from "@playwright/test";
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, type Preferences } from "../src/ui/preferences.ts";

/** Prépare le dernier choix d'une marche antérieure ; les interactions à chaud ont leurs propres scénarios. */
export async function remembered(page: Page, changes: Partial<Preferences>): Promise<void> {
  await page.addInitScript(({ key, prefs }) => {
    localStorage.setItem(key, JSON.stringify(prefs));
  }, { key: PREFERENCES_KEY, prefs: { ...DEFAULT_PREFERENCES, ...changes } });
}
