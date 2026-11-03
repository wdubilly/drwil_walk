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
