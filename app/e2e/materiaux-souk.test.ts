// e2e des matériaux locaux du souk (QUA-020, APP-012, APP-001), dans Chromium : l'option se choisit à l'accueil pour le souk seulement,
// ses textures embarquées se chargent sans requête hors de la page servie ni erreur WebGL, et tête baissée dans le Quest 3 émulé
// (IWER), la ville habillée s'efface comme avant.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface EmulatedQuest {
  quaternion: { set(x: number, y: number, z: number, w: number): void };
}
interface E2eWindow {
  quest: EmulatedQuest;
  IWER: { XRDevice: new (config: unknown) => EmulatedQuest & { installRuntime(o: object): void }; metaQuest3: unknown };
}

const LOCAL = "Matériaux locaux (prototype)";
const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const diagnostics = (page: Page) => page.getByRole("region", { name: "Diagnostic de rendu" });

function watch(page: Page) {
  const seen = { errors: [] as string[], foreign: [] as string[] };
  page.on("request", (r) => {
    if (!/^(https:\/\/localhost:|data:|blob:)/.test(r.url())) seen.foreign.push(r.url());
  });
  page.on("console", (m) => {
    if (m.type() === "error") seen.errors.push(m.text());
  });
  page.on("pageerror", (e) => {
    seen.errors.push(e.message);
  });
  return seen;
}

/** Le nombre de textures en mémoire graphique, lu sur le diagnostic de la version PC une fois la ville dessinée. */
async function texturesInPc(page: Page, local: boolean): Promise<number> {
  await page.goto("/");
  if (local) await page.getByLabel(LOCAL).check();
  await page.getByRole("button", { name: "Version PC" }).click();
  await expect(page.getByRole("status")).toHaveText("Version PC active : marche dans la page, sans casque.");
  await page.keyboard.press("d");
  const textures = diagnostics(page).locator("[data-field='textures']");
  await expect(textures).toHaveText(/^\d+$/);
  // Les images embarquées se décodent après la première image : on attend que le compte se stabilise.
  await page.waitForTimeout(1500);
  return Number(await textures.textContent());
}

test("chemin 26 : l'option des matériaux locaux n'existe que pour le souk, OpenStreetMap reste le rendu par défaut", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("OpenStreetMap")).toBeChecked();
  await expect(page.getByLabel(LOCAL)).toBeVisible();
  await page.locator("label.card", { hasText: "Pune FC Road" }).click();
  await expect(page.getByLabel(LOCAL)).toBeHidden();
  await page.locator("label.card", { hasText: "Doha Corniche" }).click();
  await expect(page.getByLabel(LOCAL)).toBeHidden();
});

test("chemin 26 : au souk, les matériaux locaux chargent leurs textures embarquées, sans réseau ni erreur WebGL", async ({ page }) => {
  const seen = watch(page);
  const without = await texturesInPc(page, false);
  const withLocal = await texturesInPc(page, true);
  // Couleur et relief de chaque matériau employé : au moins deux textures de plus.
  expect(withLocal).toBeGreaterThanOrEqual(without + 2);
  await expect(page.locator("#app")).toHaveAttribute("data-route", "doha-souq-waqif");
  await expect(page.getByRole("alert")).toHaveText("");
  expect(seen).toEqual({ errors: [], foreign: [] });
});

test("chemin 26 : dans le Quest 3 émulé, la ville habillée des matériaux locaux s'efface tête baissée", async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as E2eWindow;
    const quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
    quest.installRuntime({ forceInstall: true });
    w.quest = quest;
  });
  const seen = watch(page);
  await page.goto("/");
  await page.getByLabel(LOCAL).check();
  await page.getByLabel("Vitesse de départ (km/h)").fill("7.2");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect.poll(async () => Number(await panel(page).getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(8);
  await expect(panel(page).locator("[data-field='opacity']")).not.toHaveText("0 %");
  await page.evaluate(() => {
    (window as unknown as E2eWindow).quest.quaternion.set(Math.sin((-45 * Math.PI) / 360), 0, 0, Math.cos((-45 * Math.PI) / 360));
  });
  await expect(panel(page).locator("[data-field='opacity']")).toHaveText("0 %");
  await expect(page.getByRole("alert")).toHaveText("");
  expect(seen).toEqual({ errors: [], foreign: [] });
});
