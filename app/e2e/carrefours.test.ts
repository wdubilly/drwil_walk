// e2e du choix de la rue aux carrefours (QUA-020, APP-002), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// chemin 13 : à l'approche d'un carrefour les rues sont annoncées, la manette droite en pointe une, la prise la choisit,
// et la marche quitte le tracé d'origine sans toucher à la vitesse réglée.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface Controller {
  quaternion: { set(x: number, y: number, z: number, w: number): void };
  updateButtonValue(id: string, value: number): void;
}
interface E2eWindow {
  quest: { controllers: { right?: Controller } };
  IWER: { XRDevice: new (config: unknown) => E2eWindow["quest"] & { installRuntime(o: object): void }; metaQuest3: unknown };
}
interface Reading {
  bearingDeg: number;
  isDefault: boolean;
  chosen: boolean;
  pointed: boolean;
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
const read = async (page: Page, name: string) => Number(await panel(page).getAttribute(name));
const choices = async (page: Page): Promise<Reading[]> => JSON.parse((await panel(page).getAttribute("data-choices")) ?? "[]") as Reading[];

/** Oriente la manette droite vers `bearingDeg` (positif à gauche, 0 droit devant). */
const aim = (page: Page, bearingDeg: number) =>
  page.evaluate((deg) => {
    const half = (deg * Math.PI) / 360;
    (window as unknown as E2eWindow).quest.controllers.right?.quaternion.set(0, Math.sin(half), 0, Math.cos(half));
  }, bearingDeg);

test("chemin 13 : à un carrefour, pointer une rue et presser la prise droite quitte le tracé d'origine", async ({ page }) => {
  test.setTimeout(240_000);
  await page.goto("/");
  await page.getByLabel("Vitesse de départ (km/h)").fill("8");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");

  // Sans choix, la marche suit le tracé d'origine ; un carrefour finit par être annoncé avec la rue du tracé.
  await expect(panel(page)).toHaveAttribute("data-off-route", "false");
  await expect.poll(async () => (await choices(page)).length, { timeout: 180_000, intervals: [100] }).toBeGreaterThanOrEqual(2);
  await expect(panel(page).getByText(/Carrefour dans \d+ m/)).toBeVisible();
  expect((await choices(page)).filter((c) => c.isDefault)).toHaveLength(1);

  // La manette suit le cap de la rue voulue (la ville tourne en approchant) : pointer ne choisit pas, la prise droite confirme.
  // Sous charge les images sont rares : on vise, on presse, on relâche, et on recommence tant que la rue n'est pas choisie.
  const squeeze = (value: number) => page.evaluate((v) => (window as unknown as E2eWindow).quest.controllers.right?.updateButtonValue("squeeze", v), value);
  const wantedStreet = async () => (await choices(page)).find((c) => !c.isDefault);
  await expect
    .poll(
      async () => {
        const wanted = await wantedStreet();
        if (wanted) await aim(page, wanted.bearingDeg);
        return (await choices(page)).some((c) => !c.isDefault && c.pointed);
      },
      { timeout: 30_000, intervals: [30] },
    )
    .toBe(true);
  expect((await choices(page)).some((c) => c.chosen)).toBe(false);
  await expect
    .poll(
      async () => {
        const wanted = await wantedStreet();
        if (wanted) await aim(page, wanted.bearingDeg);
        await squeeze(1);
        await page.waitForTimeout(150);
        const chosen = (await choices(page)).some((c) => !c.isDefault && c.chosen);
        await squeeze(0);
        await page.waitForTimeout(150);
        return chosen;
      },
      { timeout: 30_000, intervals: [30] },
    )
    .toBe(true);
  await expect(panel(page).locator("[data-field='speed']")).toHaveText("8,0 km/h");

  // Après le carrefour la marche est hors du tracé d'origine, et la distance n'a jamais reculé.
  const before = await read(page, "data-distance-m");
  await expect(panel(page)).toHaveAttribute("data-off-route", "true", { timeout: 30_000 });
  expect(await read(page, "data-distance-m")).toBeGreaterThanOrEqual(before);
  await expect(panel(page).locator("[data-field='speed']")).toHaveText("8,0 km/h");
});
