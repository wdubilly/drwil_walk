// e2e du tableau de bord de marche (QUA-020, APP-002, SEC-007), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// Poids fixe et ancien poids ignoré ; calories approximatives, cap, lieu et heure pendant la marche.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface E2eWindow {
  IWER: { XRDevice: new (config: unknown) => { installRuntime(o: object): void }; metaQuest3: unknown };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as E2eWindow;
    new w.IWER.XRDevice(w.IWER.metaQuest3).installRuntime({ forceInstall: true });
  });
});

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const weightField = (page: Page) => page.getByLabel(/^Poids/);
const stored = (page: Page) => page.evaluate(() => localStorage.getItem("drwil_walk.poids"));

test("chemin 13 : l'ancien poids est ignoré, les calories sont approximatives pour 70 kg", async ({ page }) => {
  // Deux entrées XR et rechargements en rendu logiciel dépassent le budget global de 30 s.
  test.setTimeout(60_000);
  await page.clock.setFixedTime(new Date(2026, 10, 1, 9, 5));
  await page.goto("/");
  await page.evaluate(() => { localStorage.setItem("drwil_walk.poids", "100"); });
  await page.reload();
  await expect(weightField(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Effacer mon poids" })).toHaveCount(0);
  expect(await stored(page)).toBe("100");

  await page.getByLabel("Vitesse de départ (km/h)").fill("7.2");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect(panel(page)).toHaveAttribute("data-hud-visible", "true");
  await expect.poll(async () => Number(await panel(page).getAttribute("data-time-s")), { timeout: 20_000 }).toBeGreaterThan(1);

  // 7,2 km/h = 120 m/min, VO2 = 15,5 ml/kg/min, référence 70 kg : 5,425 kcal/min.
  const { timeS, kcal } = await panel(page).evaluate((el) => ({ timeS: Number(el.dataset["timeS"]), kcal: Number(el.dataset["kcal"]) }));
  expect(kcal).toBeCloseTo((5.425 * timeS) / 60, 0);
  await expect(panel(page)).toHaveAttribute("data-weight-kg", "70");
  await expect(panel(page)).toContainText("référence 70 kg");
  await expect(panel(page).locator("[data-field='kcal']")).toHaveText(/^environ \d+ kcal$/);
  await expect(panel(page)).toHaveAttribute("data-clock", "09:05");
  await expect(panel(page)).toHaveAttribute("data-place", "Doha Souq Waqif");
  // 7,2 km/h : 8 min 20 s par kilomètre ; la boucle du souk est entamée, il en reste moins que sa longueur.
  await expect(panel(page)).toHaveAttribute("data-pace", "8:20 min/km");
  await expect(panel(page).locator("[data-field='pace']")).toHaveText("8:20 min/km");
  const { remainingM, progressPct, distanceM } = await panel(page).evaluate((el) => ({
    remainingM: Number(el.dataset["remainingM"]), progressPct: Number(el.dataset["progressPct"]), distanceM: Number(el.dataset["distanceM"]),
  }));
  expect(remainingM).toBeGreaterThan(0);
  expect(progressPct).toBeGreaterThanOrEqual(0);
  expect(progressPct).toBeLessThan(100);
  expect(distanceM).toBeGreaterThan(0);
  await expect(panel(page).locator("[data-field='remaining']")).toHaveText(/^\d+,\d km$/);
  await expect(panel(page).locator("[data-field='progress']")).toHaveText(/^\d+ %$/);
  await expect(panel(page)).toHaveAttribute("data-compass", /^(N|NE|E|SE|S|SO|O|NO) \d{1,3}°$/);

  await page.reload();
  await expect(weightField(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(panel(page)).toHaveAttribute("data-weight-kg", "70");
  expect(await stored(page)).toBe("100");
});

test("chemin 13 : sans poids saisi, la valeur moyenne de 70 kg s'applique", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect(panel(page)).toHaveAttribute("data-weight-kg", "70");
  expect(await stored(page)).toBeNull();
});
