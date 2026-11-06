// e2e de la tablette (QUA-020, APP-007), dans Chromium en émulation tactile et petit écran, sans WebXR : boutons à l'écran,
// glisser pour regarder, tableau de bord en surimpression dans la page.
import { expect, test, type Page } from "@playwright/test";

test.use({ hasTouch: true, isMobile: true, viewport: { width: 600, height: 900 } });

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const read = async (page: Page, name: string) => Number(await panel(page).getAttribute(name));

test("chemin 14 : la marche à la tablette se commande au toucher, tableau de bord à l'écran, sans session WebXR", async ({ page }) => {
  await page.goto("/");
  // Petit écran : l'accueil ne déborde pas de la largeur et les cibles font au moins 48 px.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const pcButton = page.getByRole("button", { name: "Version PC" });
  expect((await pcButton.boundingBox())?.height).toBeGreaterThanOrEqual(48);
  await page.getByLabel("Vitesse de départ (km/h)").fill("7.2");
  await pcButton.tap();
  await expect(page.getByRole("status")).toHaveText("Version PC active : marche dans la page, sans casque.");

  const controls = page.getByRole("group", { name: "Commandes tactiles" });
  await expect(controls).toBeVisible();
  for (const name of ["Moins vite", "Pause ou reprise", "Plus vite", "Recaler", "Quitter"]) {
    expect((await controls.getByRole("button", { name }).boundingBox())?.height).toBeGreaterThanOrEqual(48);
  }
  // Le tableau de bord est du HTML de la page, par-dessus le canvas, et tient dans la largeur de l'écran.
  const dash = (await panel(page).boundingBox()) as { x: number; width: number };
  expect(dash.x).toBeGreaterThanOrEqual(0);
  expect(dash.x + dash.width).toBeLessThanOrEqual(600);
  await expect(panel(page).locator("[data-field='speed']")).toHaveText("7,2 km/h");

  await controls.getByRole("button", { name: "Plus vite" }).tap();
  await expect(panel(page)).toHaveAttribute("data-speed-kmh", "7.3");
  await controls.getByRole("button", { name: "Moins vite" }).tap();
  await controls.getByRole("button", { name: "Moins vite" }).tap();
  await expect(panel(page)).toHaveAttribute("data-speed-kmh", "7.1");

  await controls.getByRole("button", { name: "Pause ou reprise" }).tap();
  await expect(panel(page)).toHaveAttribute("data-paused", "true");
  const frozen = await read(page, "data-distance-m");
  await page.waitForTimeout(400);
  expect(await read(page, "data-distance-m")).toBe(frozen);
  await controls.getByRole("button", { name: "Pause ou reprise" }).tap();
  await expect(panel(page)).toHaveAttribute("data-paused", "false");
  await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(frozen + 1);

  // Glisser un doigt sur la scène tourne le regard ; le recalage prend ce regard sans toucher à la distance.
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", x?: number) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: x === undefined ? [] : [{ x, y: 600 }] });
  await touch("touchStart", 400);
  await touch("touchMove", 350);
  await touch("touchMove", 300);
  await touch("touchEnd");
  await controls.getByRole("button", { name: "Recaler" }).tap();
  await expect.poll(() => read(page, "data-calibration-yaw")).toBeCloseTo(0.4, 1);

  await controls.getByRole("button", { name: "Quitter" }).tap();
  await expect(page.getByRole("status")).toHaveText("Version PC arrêtée : vous pouvez y revenir.");
  await expect(controls).toHaveCount(0);
});

// Deux parcours autonomes gardent la réentrée et tous les gestes sans cumuler huit réglages sous SwiftShader.
const preferenceCases = [
  {
    name: "qualité et ville",
    buttons: [/^Ville vivante/, /^Lampadaires/, /^Arbres/, /^Qualité/],
    profile: "qualite", side: "right",
    choices: ["Qualité : Qualité", "Ville vivante (piétons et circulation) : Oui", "Lampadaires : Non", "Arbres : Non",
      "Brouillard : Non", "Sons d'ambiance (%) : Coupés", "Côté du panneau : À droite", "Opacité du panneau (%) : 70"],
  },
  {
    name: "ambiance et panneau",
    buttons: [/^Brouillard/, /^Sons d'ambiance/, /^Côté du panneau/, /^Opacité du panneau/],
    profile: "equilibre", side: "left",
    choices: ["Qualité : Équilibré", "Ville vivante (piétons et circulation) : Non", "Lampadaires : Oui", "Arbres : Oui",
      "Brouillard : Oui", "Sons d'ambiance (%) : 25", "Côté du panneau : À gauche", "Opacité du panneau (%) : 80"],
  },
];

for (const prefsCase of preferenceCases) {
  test(`APP-006 APP-007 : les préférences tactiles s'appliquent sans quitter la marche et sont mémorisées — ${prefsCase.name}`, async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto("/");
    await page.getByRole("button", { name: "Version PC" }).tap();
    const canvas = await page.locator(".pc-canvas").elementHandle();
    const before = await read(page, "data-distance-m");
    await page.getByText("Préférences de marche", { exact: true }).tap();
    const prefs = page.locator(".walk-preferences");
    for (const name of prefsCase.buttons) {
      const button = prefs.getByRole("button", { name });
      expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(48);
      await button.tap();
    }
    await expect(page.locator("#app")).toHaveAttribute("data-profile", prefsCase.profile);
    await expect(page.locator("#app")).toHaveAttribute("data-panel-side", prefsCase.side);
    expect(await canvas.evaluate((el) => el === document.querySelector(".pc-canvas"))).toBe(true);
    await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(before + 1);
    await page.getByRole("group", { name: "Commandes tactiles" }).getByRole("button", { name: "Plus vite" }).tap();
    await expect(panel(page)).toHaveAttribute("data-speed-kmh", "4.1");
    await page.getByRole("group", { name: "Commandes tactiles" }).getByRole("button", { name: "Quitter" }).tap();
    await page.reload();
    await page.getByRole("button", { name: "Version PC" }).tap();
    await page.getByText("Préférences de marche", { exact: true }).tap();
    for (const name of prefsCase.choices) {
      await expect(prefs.getByRole("button", { name, exact: true })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
