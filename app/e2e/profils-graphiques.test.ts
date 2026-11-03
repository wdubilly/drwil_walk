// e2e des profils graphiques (QUA-020, APP-006, APP-001), dans Chromium avec un Meta Quest 3 émulé (IWER) : les trois profils
// se marchent sans erreur WebGL ni requête hors de la page servie, le choix est gardé dans le navigateur et relu, une valeur
// gardée illisible est dite, et tête baissée la ville s'efface quel que soit le profil (le réel reste visible).
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

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as E2eWindow;
    const quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
    quest.installRuntime({ forceInstall: true });
    w.quest = quest;
  });
});

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const KEY = "drwil_walk.profil-graphique";

const PROFILES = [
  { label: "Performance", id: "performance" },
  { label: "Équilibré", id: "equilibre" },
  { label: "Qualité", id: "qualite" },
];

for (const { label, id } of PROFILES) {
  test(`chemin 22 : profil ${label}, la marche dans le Quest 3 émulé, sans erreur ni appel réseau, la ville s'efface tête baissée`, async ({ page }) => {
    const errors: string[] = [];
    const foreign: string[] = [];
    page.on("request", (r) => {
      if (!/^(https:\/\/localhost:|data:|blob:)/.test(r.url())) foreign.push(r.url());
    });
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => {
      errors.push(e.message);
    });
    await page.goto("/");
    await page.getByLabel(label).check();
    await page.getByLabel("Vitesse de départ (km/h)").fill("7.2");
    await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
    await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
    await expect(page.locator("#app")).toHaveAttribute("data-profile", id);
    await expect.poll(async () => Number(await panel(page).getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(8);
    await expect(page.getByRole("alert")).toHaveText("");
    await page.evaluate(() => {
      (window as unknown as E2eWindow).quest.quaternion.set(Math.sin((-45 * Math.PI) / 360), 0, 0, Math.cos((-45 * Math.PI) / 360));
    });
    await expect(panel(page).locator("[data-field='opacity']")).toHaveText("0 %");
    expect({ errors, foreign }).toEqual({ errors: [], foreign: [] });
  });
}

test("chemin 22 : le casque émulé propose équilibré, le choix manuel est gardé et relu à l'accueil suivant", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Équilibré")).toBeChecked();
  await expect(page.getByText("Proposé d'après votre appareil.")).toBeVisible();
  await page.getByLabel("Qualité").check();
  await page.reload();
  await expect(page.getByLabel("Qualité")).toBeChecked();
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe("qualite");
});

test("chemin 22 : un profil gardé illisible est ignoré et dit, le profil de l'appareil s'applique", async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, "ultra");
  }, KEY);
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("« ultra »");
  await expect(page.getByLabel("Équilibré")).toBeChecked();
});
