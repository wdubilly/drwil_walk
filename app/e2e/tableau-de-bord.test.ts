// e2e du tableau de bord de marche (QUA-020, APP-002, SEC-007), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// chemin 13 : le poids se saisit à l'accueil, se garde dans le navigateur et s'efface ; le tableau de bord donne des
// calories « environ », le cap, le lieu et l'heure locale pendant la marche.
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

test("chemin 13 : le poids reste dans le navigateur et s'efface, les calories le suivent", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 1, 9, 5));
  await page.goto("/");
  await expect(weightField(page)).toHaveValue("");
  await weightField(page).fill("100");
  await weightField(page).dispatchEvent("change");
  expect(await stored(page)).toBe("100");

  // Un nouvel accueil relit le poids gardé.
  await page.reload();
  await expect(weightField(page)).toHaveValue("100");

  await page.getByLabel("Vitesse de départ (km/h)").fill("7.2");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect(panel(page)).toHaveAttribute("data-hud-visible", "true");
  await expect.poll(async () => Number(await panel(page).getAttribute("data-time-s")), { timeout: 20_000 }).toBeGreaterThan(1);

  // Les calories sont celles de la formule : 7,2 km/h = 120 m/min, VO2 = 15,5 ml/kg/min, 100 kg, 7,75 kcal/min.
  const { timeS, kcal } = await panel(page).evaluate((el) => ({ timeS: Number(el.dataset["timeS"]), kcal: Number(el.dataset["kcal"]) }));
  expect(kcal).toBeCloseTo((7.75 * timeS) / 60, 0);
  await expect(panel(page)).toHaveAttribute("data-weight-kg", "100");
  await expect(panel(page).locator("[data-field='kcal']")).toHaveText(/^environ \d+ kcal$/);
  await expect(panel(page)).toHaveAttribute("data-clock", "09:05");
  await expect(panel(page)).toHaveAttribute("data-place", "Doha Souq Waqif");
  await expect(panel(page)).toHaveAttribute("data-compass", /^(N|NE|E|SE|S|SO|O|NO) \d{1,3}°$/);

  // Le poids s'efface : le stockage est vidé.
  await page.reload();
  await page.getByRole("button", { name: "Effacer mon poids" }).click();
  await expect(weightField(page)).toHaveValue("");
  expect(await stored(page)).toBeNull();
});

test("chemin 13 : sans poids saisi, la valeur moyenne de 70 kg s'applique", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect(panel(page)).toHaveAttribute("data-weight-kg", "70");
  expect(await stored(page)).toBeNull();
});
