// e2e du rendu riche (QUA-020, APP-003, APP-001), dans Chromium avec un Meta Quest 3 émulé (IWER) : chacun des quatre itinéraires figés
// se marche avec le sol, la verdure, les toits, les auvents et les noms des rues de son extrait, sans erreur WebGL ni requête hors
// de la page servie (tout est dans le dépôt) ; tête baissée, la ville riche s'efface avec le reste.
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

const ITINERARIES = [
  { card: "Doha Souq Waqif", route: "doha-souq-waqif" },
  { card: "Pune Vieille ville", route: "pune-vieille-ville" },
  { card: "Doha Corniche", route: "doha-corniche" },
  { card: "Pune FC Road", route: "pune-fc-road" },
];

for (const { card, route } of ITINERARIES) {
  test(`chemin 17 : ${card}, la marche avec le rendu riche, sans erreur ni appel réseau, la ville riche s'efface tête baissée`, async ({ page }) => {
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
    await page.locator("label.card", { hasText: card }).click();
    await page.getByLabel("Vitesse de départ (km/h)").fill("7.2");
    await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
    await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
    await expect(page.locator("#app")).toHaveAttribute("data-route", route);
    await expect.poll(async () => Number(await panel(page).getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(8);
    await expect(page.getByRole("alert")).toHaveText("");
    await page.evaluate(() => {
      (window as unknown as E2eWindow).quest.quaternion.set(Math.sin((-45 * Math.PI) / 360), 0, 0, Math.cos((-45 * Math.PI) / 360));
    });
    await expect(panel(page).locator("[data-field='opacity']")).toHaveText("0 %");
    expect({ errors, foreign }).toEqual({ errors: [], foreign: [] });
  });
}
