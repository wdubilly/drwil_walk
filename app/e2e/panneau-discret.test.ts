// e2e du panneau d'infos discret (QUA-020, APP-001, APP-002), dans Chromium avec un Meta Quest 3 émulé (IWER) :
// chemin 15 : le côté du panneau (gauche ou droite) se choisit à l'accueil, reste dans le navigateur, et la marche
// démarre avec le panneau affiché de ce côté.
import { createRequire } from "node:module";
import { expect, test, type Page } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");

interface E2eWindow {
  IWER: { XRDevice: new (config: unknown) => { installRuntime(o: object): void }; metaQuest3: unknown };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as E2eWindow;
    new w.IWER.XRDevice(w.IWER.metaQuest3).installRuntime({ forceInstall: true });
  });
});

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const stored = (page: Page) => page.evaluate(() => localStorage.getItem("drwil_walk.cote-panneau"));

test("chemin 15 : sans choix, le panneau est à droite et rien n'est gardé", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("À droite")).toBeChecked();
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  await expect(page.locator("#app")).toHaveAttribute("data-panel-side", "right");
  await expect(panel(page)).toHaveAttribute("data-hud-visible", "true");
  expect(await stored(page)).toBeNull();
});

for (const [side, label] of [["left", "À gauche"], ["right", "À droite"]] as const) {
  test(`chemin 15 : le panneau est choisi ${label.toLowerCase()} à l'accueil, gardé, et la marche démarre de ce côté`, async ({ page }) => {
    await page.goto("/");
    // Le côté opposé d'abord : le choix doit changer ce qui était gardé.
    await page.getByLabel(side === "left" ? "À droite" : "À gauche").check();
    await page.getByLabel(label).check();
    expect(await stored(page)).toBe(side);

    // Un nouvel accueil relit le côté gardé.
    await page.reload();
    await expect(page.getByLabel(label)).toBeChecked();

    await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
    await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
    await expect(page.locator("#app")).toHaveAttribute("data-panel-side", side);
    await expect(panel(page)).toHaveAttribute("data-hud-visible", "true");
    await expect.poll(async () => Number(await panel(page).getAttribute("data-time-s")), { timeout: 20_000 }).toBeGreaterThan(1);
  });
}

test("chemin 15 : une valeur illisible gardée est remplacée par le côté par défaut", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("drwil_walk.cote-panneau", "au-dessus");
  });
  await page.goto("/");
  await expect(page.getByLabel("À droite")).toBeChecked();
});
