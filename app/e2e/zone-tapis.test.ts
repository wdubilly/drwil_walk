// e2e de la zone tapis et de la vignette réelle (QUA-020, APP-001), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// chemin 13 : la boîte par défaut protège le tapis dès le premier lancement, la manette gauche pose et déplace la zone,
// elle est relue au lancement suivant ; la vignette est active par défaut et le rendu (découpe + vignette) ne produit aucune erreur WebGL.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface Controller {
  updateButtonValue(id: string, value: number): void;
  updateAxes(id: string, x: number, y: number): void;
}
interface EmulatedQuest {
  position: { set(x: number, y: number, z: number): void };
  controllers: { left?: Controller };
}
interface E2eWindow {
  quest: EmulatedQuest;
  IWER: { XRDevice: new (config: unknown) => EmulatedQuest & { installRuntime(o: object): void }; metaQuest3: unknown };
}

async function installQuest(page: Page) {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as E2eWindow;
    const quest = new w.IWER.XRDevice(w.IWER.metaQuest3);
    quest.installRuntime({ forceInstall: true });
    w.quest = quest;
  });
}

test.beforeEach(async ({ page }) => {
  await installQuest(page);
});

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const zone = async (page: Page) => ((await panel(page).getAttribute("data-zone")) ?? "").split(" ").map(Number);

async function enter(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
}

test("chemin 13 : la boîte par défaut protège le tapis, X la pose, le joystick la déplace, elle est relue au lancement suivant", async ({ page, context }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => {
    errors.push(e.message);
  });
  await enter(page);
  await expect(panel(page)).toHaveAttribute("data-vignette", "true");
  expect(await zone(page)).toEqual([0, 0, 0, 1.2, 2.4, 1.2]);

  // X : la boîte se pose sous la tête, à l'endroit où l'on se tient.
  await page.evaluate(() => { (window as unknown as E2eWindow).quest.position.set(0.4, 1.6, -0.3); });
  await page.evaluate(() => (window as unknown as E2eWindow).quest.controllers.left?.updateButtonValue("x-button", 1));
  await expect.poll(async () => (await zone(page))[0]).toBeCloseTo(0.4, 2);
  expect((await zone(page))[1]).toBeCloseTo(-0.3, 2);
  await page.evaluate(() => (window as unknown as E2eWindow).quest.controllers.left?.updateButtonValue("x-button", 0));

  // Joystick poussé vers l'avant : la boîte avance (z diminue).
  await page.waitForTimeout(250);
  await page.evaluate(() => (window as unknown as E2eWindow).quest.controllers.left?.updateAxes("thumbstick", 0, -1));
  await expect.poll(async () => (await zone(page))[1]).toBeLessThan(-0.6);
  await page.evaluate(() => (window as unknown as E2eWindow).quest.controllers.left?.updateAxes("thumbstick", 0, 0));
  await page.waitForTimeout(400);
  const placed = await zone(page);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("drwil_walk.zone-tapis"))).toContain('"width":1.2');

  // Nouveau lancement, dans une page neuve du même navigateur (même stockage) : la zone enregistrée est relue.
  await page.close();
  const next = await context.newPage();
  await installQuest(next);
  await enter(next);
  const reread = await zone(next);
  expect(reread[0]).toBeCloseTo(placed[0] as number, 2);
  expect(reread[1]).toBeCloseTo(placed[1] as number, 2);
  expect(errors).toEqual([]);
});

test("chemin 13 : une zone enregistrée illisible redonne la boîte par défaut, et la vignette se désactive à l'accueil", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => { localStorage.setItem("drwil_walk.zone-tapis", '{"x":"?"}'); });
  await page.reload();
  await page.getByLabel("Vignette réelle").uncheck();
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  expect(await zone(page)).toEqual([0, 0, 0, 1.2, 2.4, 1.2]);
  await expect(panel(page)).toHaveAttribute("data-vignette", "false");
});
