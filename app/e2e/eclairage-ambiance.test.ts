// e2e de l'éclairage et de l'ambiance (QUA-020 chemin 25, APP-011, APP-001), dans Chromium avec un Meta Quest 3 émulé
// (IWER) : brouillard et sons arrivent éteints, s'allument à l'accueil, le voile du casque reste plafonné à 15 %, il se
// coupe d'un geste, et tête baissée la ville s'efface comme toujours, brouillard et sons actifs.
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

async function enter(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
}

test("chemin 25 : brouillard et sons allumés à l'accueil, voile plafonné à 15 % au casque, ville effacée tête baissée", async ({ page }) => {
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
  await expect(page.getByLabel("Brouillard")).not.toBeChecked();
  await expect(page.getByLabel("Sons d'ambiance")).toHaveValue("0");
  await page.getByLabel("Brouillard").check();
  await page.getByLabel("Sons d'ambiance").fill("100");
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard 15 % · sons 20 %");
  await expect.poll(async () => Number(await panel(page).getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(5);
  await page.evaluate(() => {
    (window as unknown as E2eWindow).quest.quaternion.set(Math.sin((-45 * Math.PI) / 360), 0, 0, Math.cos((-45 * Math.PI) / 360));
  });
  await expect(panel(page).locator("[data-field='opacity']")).toHaveText("0 %");
  expect({ errors, foreign }).toEqual({ errors: [], foreign: [] });
});

test("chemin 25 : sans réglage, la marche se fait sans brouillard ni son, et le brouillard se coupe d'un geste", async ({ page }) => {
  await page.goto("/");
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard éteint · sons 0 %");
  await page.reload();
  await page.getByLabel("Brouillard").check();
  await page.getByLabel("Brouillard").uncheck();
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard éteint · sons 0 %");
});

test("chemin 25 : le profil le plus léger refuse le brouillard, même coché à l'accueil", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Performance").check();
  await page.getByLabel("Brouillard").check();
  await enter(page);
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard éteint · sons 0 %");
});
