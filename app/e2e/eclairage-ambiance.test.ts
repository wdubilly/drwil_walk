import { expect, test, type Page } from "@playwright/test";
import { installQuest, toggleQuestPreferences, questPreference, lookDown } from "./quest-preferences-helper.ts";
import { remembered } from "./preferences-helper.ts";

test.beforeEach(async ({ page }) => { await installQuest(page); });
const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
async function enter(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
}

test("QUA-020 APP-001 APP-006 APP-011 APP-014: préférences Quest à chaud, marche continue, plafonds et mémoire", async ({ page }) => {
  // Les nombreux fronts de manette et la seconde entrée XR dépassent ensemble les 30 s en rendu logiciel.
  test.setTimeout(60_000);
  const errors: string[] = [];
  const foreign: string[] = [];
  page.on("pageerror", (e) => { errors.push(e.message); });
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("request", (r) => { if (!/^(https:\/\/localhost:|data:|blob:)/.test(r.url())) foreign.push(r.url()); });
  await page.goto("/");
  await expect(page.getByLabel("Brouillard")).toHaveCount(0);
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard éteint · sons 0 %");
  await expect(page.locator("#app")).toHaveAttribute("data-figurants", "aucun : ville vivante désactivée");
  const before = Number(await panel(page).getAttribute("data-distance-m"));
  await toggleQuestPreferences(page, true);
  await questPreference(page, 4, { fog: true });
  for (const soundPct of [25, 50, 75, 100]) await questPreference(page, 5, { soundPct });
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard 15 % · sons 20 %");
  await questPreference(page, 1, { traffic: true });
  await expect(page.locator("#app")).toHaveAttribute("data-figurants", /^[1-9]\d* véhicules · [1-9]\d* piétons$/);
  await questPreference(page, 3, { trees: false });
  await questPreference(page, 7, { panelOpacityPct: 80 });
  await questPreference(page, 6, { side: "left" });
  for (const profile of ["qualite", "performance", "equilibre"]) {
    await questPreference(page, 0, { profile: profile as "qualite" | "performance" | "equilibre" });
    await expect(page.locator("#app")).toHaveAttribute("data-profile", profile);
    await expect(page.locator("#app")).toHaveAttribute("data-ambiance", profile === "performance" ? "brouillard éteint · sons 20 %" : "brouillard 15 % · sons 20 %");
  }
  await questPreference(page, 4, { fog: false });
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard éteint · sons 20 %");
  await toggleQuestPreferences(page, false);
  expect(Number(await panel(page).getAttribute("data-distance-m"))).toBeGreaterThan(before);
  await toggleQuestPreferences(page, true);
  await lookDown(page);
  await expect(panel(page).locator("[data-field='opacity']")).toHaveText("0 %");
  await expect(page.locator("#app")).toHaveAttribute("data-preferences-visible", "false");
  expect({ errors, foreign }).toEqual({ errors: [], foreign: [] });
  await page.reload();
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-panel-side", "left");
  await expect(page.locator("#app")).toHaveAttribute("data-profile", "equilibre");
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard éteint · sons 20 %");
});

test("QUA-020 APP-011: nuit et jour, lanternes coupées à chaud avec les mâts", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 5, 22, 30));
  await page.goto("/");
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-lanternes", "allumées");
  await page.screenshot({ path: "../dist/e2e-captures/souk-nuit.png" });
  await toggleQuestPreferences(page, true);
  await questPreference(page, 2, { lamps: false });
  await expect(page.locator("#app")).toHaveAttribute("data-lanternes", "absentes");
  await questPreference(page, 2, { lamps: true });
  await expect(page.locator("#app")).toHaveAttribute("data-lanternes", "allumées");
  await page.clock.setFixedTime(new Date(2026, 10, 5, 12, 0));
  await page.reload();
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-lanternes", "éteintes");
});

test("QUA-020 APP-006 APP-011: dernier choix brouillard relu, profil performance le refuse", async ({ page }) => {
  await remembered(page, { profile: "performance", fog: true });
  await page.goto("/");
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard éteint · sons 0 %");
});
