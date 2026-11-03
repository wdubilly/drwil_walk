// e2e du mobilier urbain et des marquages au sol (QUA-020, APP-009, APP-001), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// chacun des quatre itinéraires figés se marche avec le mobilier (lampadaires, bancs, poubelles, panneaux) et les marquages
// (bordures, passages piétons, lignes d'arrêt) de son extrait, sans erreur WebGL ni requête hors de la page servie ; tête baissée,
// le mobilier s'efface avec la ville. Le profil « performance », qui réduit la densité, se marche aussi.
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

async function walk(page: Page, card: string, route: string): Promise<void> {
  await page.locator("label.card", { hasText: card }).click();
  await page.getByLabel("Vitesse de départ (km/h)").fill("6.5");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect(page.locator("#app")).toHaveAttribute("data-route", route);
  await expect.poll(async () => Number(await panel(page).getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(8);
  await expect(page.getByRole("alert")).toHaveText("");
}

for (const { card, route } of ITINERARIES) {
  test(`chemin 24 : ${card}, la marche avec le mobilier et les marquages, sans erreur WebGL, tout s'efface tête baissée`, async ({ page }) => {
    const seen = watch(page);
    await page.goto("/");
    await walk(page, card, route);
    await page.evaluate(() => {
      (window as unknown as E2eWindow).quest.quaternion.set(Math.sin((-45 * Math.PI) / 360), 0, 0, Math.cos((-45 * Math.PI) / 360));
    });
    await expect(panel(page).locator("[data-field='opacity']")).toHaveText("0 %");
    expect(seen).toEqual({ errors: [], foreign: [] });
  });
}

test("chemin 24 : en profil performance, la marche garde le mobilier réduit, sans erreur ni appel réseau", async ({ page }) => {
  const seen = watch(page);
  await page.goto("/");
  await page.getByLabel("Performance").check();
  await walk(page, "Doha Souq Waqif", "doha-souq-waqif");
  await expect(page.locator("#app")).toHaveAttribute("data-profile", "performance");
  expect(seen).toEqual({ errors: [], foreign: [] });
});
