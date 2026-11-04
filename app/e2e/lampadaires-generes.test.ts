// e2e des lampadaires produits par règle (QUA-020, APP-013, APP-001), dans Chromium avec un Meta Quest 3 émulé (IWER) : la marche
// de la Vieille ville de Pune pose des lampadaires produits à côté du relevé d'OpenStreetMap, le réglage de l'accueil les éteint,
// le profil « performance » les plafonne plus bas, et tête baissée ils s'effacent avec la ville.
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

async function walk(page: Page): Promise<void> {
  await page.getByLabel("Vitesse de départ (km/h)").fill("6.5");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect.poll(async () => Number(await panel(page).getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(8);
  await expect(page.getByRole("alert")).toHaveText("");
}

const produced = async (page: Page): Promise<number> => {
  const text = (await page.locator("#app").getAttribute("data-mobilier")) ?? "";
  return Number(/(\d+) produits/.exec(text)?.[1]);
};

test("chemin 27 : les lampadaires produits sont posés par défaut, plafonnés, et s'effacent tête baissée", async ({ page }) => {
  const seen = watch(page);
  await page.goto("/");
  await expect(page.getByLabel("Lampadaires produits par règle")).toBeChecked();
  await walk(page);
  expect(await produced(page)).toBeGreaterThan(20);
  expect(await produced(page)).toBeLessThanOrEqual(300);
  await page.evaluate(() => {
    (window as unknown as E2eWindow).quest.quaternion.set(Math.sin((-45 * Math.PI) / 360), 0, 0, Math.cos((-45 * Math.PI) / 360));
  });
  await expect(panel(page).locator("[data-field='opacity']")).toHaveText("0 %");
  expect(seen).toEqual({ errors: [], foreign: [] });
});

test("chemin 27 : décocher le réglage de l'accueil ne laisse que le mobilier réel", async ({ page }) => {
  const seen = watch(page);
  await page.goto("/");
  await page.getByLabel("Lampadaires produits par règle").uncheck();
  await walk(page);
  await expect(page.locator("#app")).toHaveAttribute("data-mobilier", /^\d+ d'OpenStreetMap · 0 produits$/);
  expect(seen).toEqual({ errors: [], foreign: [] });
});

test("chemin 27 : le profil performance plafonne les lampadaires produits à 100", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Performance").check();
  await walk(page);
  expect(await produced(page)).toBeGreaterThan(0);
  expect(await produced(page)).toBeLessThanOrEqual(100);
});
