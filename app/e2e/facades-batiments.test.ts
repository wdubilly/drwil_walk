// e2e des façades procédurales (QUA-020, APP-008, APP-001), dans Chromium : sur chacun des quatre itinéraires figés, la marche se
// rejoue avec les façades (profil équilibré, par défaut) sans erreur WebGL ni requête hors de la page servie, sous le budget de
// triangles ; tête baissée dans le Quest 3 émulé (IWER), la ville et ses façades s'effacent comme avant.
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

/** Budget de triangles d'une scène de ville avec façades, sur le casque (profil équilibré) : de quoi tenir 72 images par seconde. */
const MAX_TRIANGLES = 1_200_000;

const ITINERARIES = [
  { card: "Doha Souq Waqif", route: "doha-souq-waqif" },
  { card: "Pune Vieille ville", route: "pune-vieille-ville" },
  { card: "Doha Corniche", route: "doha-corniche" },
  { card: "Pune FC Road", route: "pune-fc-road" },
];

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

for (const { card, route } of ITINERARIES) {
  test(`chemin 23 : ${card}, la marche avec les façades procédurales, sous le budget de triangles, sans erreur WebGL`, async ({ page }) => {
    const seen = watch(page);
    await page.goto("/");
    await page.locator("label.card", { hasText: card }).click();
    await page.getByRole("button", { name: "Version PC" }).click();
    await expect(page.getByRole("status")).toHaveText("Version PC active : marche dans la page, sans casque.");
    await expect(page.locator("#app")).toHaveAttribute("data-route", route);
    await page.keyboard.press("d");
    const triangles = diagnostics(page).locator("[data-field='triangles']");
    await expect(triangles).toHaveText(/^\d+$/);
    await expect.poll(async () => Number(await triangles.textContent())).toBeGreaterThan(0);
    expect(Number(await triangles.textContent())).toBeLessThan(MAX_TRIANGLES);
    await expect(page.getByRole("alert")).toHaveText("");
    expect(seen).toEqual({ errors: [], foreign: [] });
  });

  test(`chemin 23 : ${card}, dans le Quest 3 émulé, les façades s'effacent avec la ville tête baissée`, async ({ page }) => {
    await page.addInitScript({ path: iwerBuild });
    await page.addInitScript(() => {
      const w = window as unknown as E2eWindow;
      const quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
      quest.installRuntime({ forceInstall: true });
      w.quest = quest;
    });
    const seen = watch(page);
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
    expect(seen).toEqual({ errors: [], foreign: [] });
  });
}
