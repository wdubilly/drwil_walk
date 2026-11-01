// e2e du champ de vision (QUA-020, APP-004, APP-005), dans Chromium avec un Meta Quest 3 émulé (IWER) : la marche est rejouée avec
// le masque de champ de vision de la cible (app/src/xr/fov.ts), et le rendu masqué est capturé pour être publié par la CI.
import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";
import { QUEST3_FOV, visibilityMask } from "../src/xr/fov.ts";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");
const CAPTURES = "../dist/e2e-captures";

interface MaskedDevice {
  visibilityMask?: unknown;
  visibilityMaskEnabled: boolean;
}
interface E2eWindow {
  IWER: { XRDevice: new (config: unknown, options: unknown) => MaskedDevice & { installRuntime(o: object): void }; metaQuest3: unknown };
  device: MaskedDevice;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript((mask) => {
    const w = window as unknown as E2eWindow;
    w.device = new w.IWER.XRDevice(w.IWER.metaQuest3, { visibilityMask: mask });
    (w.device as unknown as { installRuntime(o: object): void }).installRuntime({ forceInstall: true });
  }, visibilityMask(QUEST3_FOV));
});

test("chemin 16 : la marche avec le masque du champ de vision du Quest 3, sans erreur, capture du rendu masqué", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => {
    errors.push(e.message);
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect.poll(() => page.evaluate(() => (window as unknown as E2eWindow).device.visibilityMaskEnabled)).toBe(true);
  expect(await page.evaluate(() => (window as unknown as E2eWindow).device.visibilityMask)).toEqual(visibilityMask(QUEST3_FOV));
  await expect.poll(async () => Number(await page.getByRole("region", { name: "Marche" }).getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(1);
  await page.screenshot({ path: `${CAPTURES}/champ-de-vision-marche.png` });
  expect(errors).toEqual([]);
});

for (const side of ["left", "right"] as const) {
  test(`chemin 15 : le panneau d'infos est affiché côté ${side === "left" ? "gauche" : "droit"} avec le masque du champ de vision, sans erreur`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => {
      errors.push(e.message);
    });
    await page.addInitScript((value) => {
      localStorage.setItem("drwil_walk.cote-panneau", value);
    }, side);
    await page.goto("/");
    await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
    await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
    await expect(page.locator("#app")).toHaveAttribute("data-panel-side", side);
    await expect(page.getByRole("region", { name: "Marche" })).toHaveAttribute("data-hud-visible", "true");
    await expect.poll(async () => Number(await page.getByRole("region", { name: "Marche" }).getAttribute("data-time-s")), { timeout: 20_000 }).toBeGreaterThan(1);
    await page.screenshot({ path: `${CAPTURES}/champ-de-vision-panneau-${side}.png` });
    expect(errors).toEqual([]);
  });
}
