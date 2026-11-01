// e2e des commandes de la manette droite (QUA-020, APP-002), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// chemin 12 : la gâchette met en pause et reprend, A recale le parcours sur le regard, B masque et réaffiche le panneau d'infos.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface EmulatedQuest {
  position: { set(x: number, y: number, z: number): void };
  quaternion: { set(x: number, y: number, z: number, w: number): void };
  controllers: { right?: { updateButtonValue(id: string, value: number): void } };
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
const read = async (page: Page, name: string) => Number(await panel(page).getAttribute(name));

/** Un appui complet sur un bouton de la manette droite : l'émulateur n'applique une valeur qu'à l'image suivante. */
async function press(page: Page, id: string, observed: () => Promise<unknown>) {
  await page.evaluate((b) => (window as unknown as E2eWindow).quest.controllers.right?.updateButtonValue(b, 1), id);
  await observed();
  await page.evaluate((b) => (window as unknown as E2eWindow).quest.controllers.right?.updateButtonValue(b, 0), id);
  // Quelques images (72 par seconde) pour que le relâchement soit lu avant l'appui suivant.
  await page.waitForTimeout(250);
}

test("chemin 12 : la gâchette met en pause et reprend, A recale le parcours, B masque et réaffiche le panneau", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Vitesse de départ (km/h)").fill("7.2");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(1);

  // Gâchette : l'avancée s'arrête, la vitesse réglée reste, puis la marche repart.
  await press(page, "trigger", () => expect(panel(page)).toHaveAttribute("data-paused", "true"));
  await expect(panel(page).getByText("Marche en pause")).toBeVisible();
  const frozen = await read(page, "data-distance-m");
  await page.waitForTimeout(400);
  expect(await read(page, "data-distance-m")).toBe(frozen);
  await expect(panel(page).locator("[data-field='speed']")).toHaveText("7,2 km/h");

  // A, pendant la pause : le parcours se recale sur l'endroit et la direction du regard, sans toucher à la distance.
  await page.evaluate(() => {
    const quest = (window as unknown as E2eWindow).quest;
    quest.position.set(0.3, 1.6, -0.5);
    // Tête tournée de 90° vers la gauche.
    quest.quaternion.set(0, Math.SQRT1_2, 0, Math.SQRT1_2);
  });
  await press(page, "a-button", () => expect.poll(() => read(page, "data-calibration-yaw"), { timeout: 20_000 }).toBeCloseTo(Math.PI / 2, 2));
  expect(await read(page, "data-calibration-x")).toBeCloseTo(0.3, 2);
  expect(await read(page, "data-calibration-z")).toBeCloseTo(-0.5, 2);
  expect(await read(page, "data-distance-m")).toBe(frozen);

  // B : le panneau d'infos du casque, affiché au départ, se masque puis se réaffiche.
  await expect(panel(page)).toHaveAttribute("data-hud-visible", "true");
  await press(page, "b-button", () => expect(panel(page)).toHaveAttribute("data-hud-visible", "false"));
  await press(page, "b-button", () => expect(panel(page)).toHaveAttribute("data-hud-visible", "true"));

  // Gâchette encore : la marche reprend à la vitesse conservée.
  await press(page, "trigger", () => expect(panel(page)).toHaveAttribute("data-paused", "false"));
  await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(frozen + 1);
  await expect(panel(page).locator("[data-field='speed']")).toHaveText("7,2 km/h");
});
