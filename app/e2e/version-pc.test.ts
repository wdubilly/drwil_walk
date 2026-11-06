// e2e de la version PC (QUA-020, APP-002), dans Chromium SANS émulation WebXR : l'accueil, le bouton « Version PC », la marche dans
// un canvas de la page, pilotée au clavier et à la souris, sur les itinéraires embarqués sans réseau externe.
import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Aucune session WebXR ne doit jamais être demandée : le compte des demandes reste à zéro.
  await page.addInitScript(() => {
    const w = window as unknown as { xrRequests: number; navigator: Navigator & { xr?: XRSystem } };
    w.xrRequests = 0;
    const xr = w.navigator.xr;
    if (xr) {
      const request = xr.requestSession.bind(xr);
      xr.requestSession = (...args) => {
        w.xrRequests++;
        return request(...args);
      };
    }
  });
});

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const read = async (page: Page, name: string) => Number(await panel(page).getAttribute(name));
const noXrSession = async (page: Page) => {
  expect(await page.evaluate(() => (window as unknown as { xrRequests: number }).xrRequests)).toBe(0);
};

async function startPc(page: Page, speed = "4.0") {
  await page.goto("/");
  await page.getByLabel("Vitesse de départ (km/h)").fill(speed);
  await page.getByRole("button", { name: "Version PC" }).click();
  await expect(page.getByRole("status")).toHaveText("Version PC active : marche dans la page, sans casque.");
}

test("chemin 13 : la version PC marche dans un canvas de la page, sans session WebXR, au clavier et à la souris", async ({ page }) => {
  await startPc(page, "7.2");
  const canvas = page.locator("canvas.pc-canvas");
  await expect(canvas).toBeVisible();
  await expect(panel(page)).toHaveAttribute("data-mode", "pc");
  await expect(panel(page)).toHaveAttribute("data-zone", "aucune");
  await expect(panel(page)).toHaveAttribute("data-vignette", "false");
  // Ville, parcours et vitesse du casque : le souk de Doha par défaut, à la vitesse réglée.
  await expect(panel(page)).toHaveAttribute("data-place", "Doha Souq Waqif");
  expect(await read(page, "data-building-count")).toBeGreaterThan(100);
  await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(1);
  await expect(panel(page).locator("[data-field='speed']")).toHaveText("7,2 km/h");
  await expect(panel(page).locator(".attribution")).toContainText("OpenStreetMap");

  // Vitesse : ↑ plus, ↓ moins, au moins 1 km/h, sans maximum.
  await page.keyboard.press("ArrowUp");
  await expect(panel(page)).toHaveAttribute("data-speed-kmh", "7.3");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(panel(page)).toHaveAttribute("data-speed-kmh", "7.1");
  await page.keyboard.press("PageUp");
  await expect(panel(page)).toHaveAttribute("data-speed-kmh", "8.1");
  await expect(panel(page)).not.toContainText("Vitesse au maximum");
  await page.keyboard.press("PageDown");
  await expect(panel(page)).toHaveAttribute("data-speed-kmh", "7.1");

  // Espace : pause puis reprise, une pression, une action (une touche tenue ne répète pas).
  await page.keyboard.down("Space");
  await expect(panel(page)).toHaveAttribute("data-paused", "true");
  await page.keyboard.down("Space");
  await page.keyboard.down("Space");
  await page.keyboard.up("Space");
  await page.waitForTimeout(200);
  await expect(panel(page)).toHaveAttribute("data-paused", "true");
  const frozen = await read(page, "data-distance-m");
  await page.waitForTimeout(400);
  expect(await read(page, "data-distance-m")).toBe(frozen);
  await page.keyboard.press("Space");
  await expect(panel(page)).toHaveAttribute("data-paused", "false");
  await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(frozen + 1);

  // Souris : glisser tourne le regard, R recale le parcours sur ce regard sans toucher à la distance.
  await page.keyboard.press("r");
  await expect.poll(() => read(page, "data-calibration-yaw")).toBe(0);
  const box = (await canvas.boundingBox()) as { x: number; y: number; width: number; height: number };
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await page.keyboard.press("r");
  await expect.poll(() => read(page, "data-calibration-yaw")).toBeCloseTo(0.4, 1);

  // H masque le tableau (les mentions de données restent), Échap quitte la version PC.
  await page.keyboard.press("h");
  await expect(panel(page)).toHaveAttribute("data-hud-visible", "false");
  await expect(panel(page).locator(":scope > dl")).toBeHidden();
  await expect(panel(page).locator(".attribution")).toBeVisible();
  await page.keyboard.press("h");
  await expect(panel(page).locator(":scope > dl")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("status")).toHaveText("Version PC arrêtée : vous pouvez y revenir.");
  await expect(canvas).toHaveCount(0);
  await noXrSession(page);
});

test("chemin 13 : sans WebXR, le bouton du casque dit son échec et la version PC reste utilisable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "xr", { value: undefined, configurable: true });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toContainText("WebXR indisponible");
  await expect(page.getByRole("button", { name: "Version PC" })).toBeEnabled();
  await page.getByRole("button", { name: "Version PC" }).click();
  await expect(page.getByRole("status")).toHaveText("Version PC active : marche dans la page, sans casque.");
  await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(0);
});

test("chemin 19 : un autre itinéraire se marche en version PC, sans réseau externe ni arrêt de la boucle", async ({ page }) => {
  const leaks: string[] = [];
  await page.route(/^https?:\/\/(?!localhost)/, async (route) => {
    leaks.push(route.request().url());
    return route.abort();
  });
  await page.goto("/");
  await page.locator("label.card", { hasText: "Pune FC Road" }).click();
  await page.getByLabel("Vitesse de départ (km/h)").fill("8");
  await page.getByRole("button", { name: "Version PC" }).click();
  await expect(page.getByRole("status")).toHaveText("Version PC active : marche dans la page, sans casque.");
  await expect(page.locator("#app")).toHaveAttribute("data-route", "pune-fc-road");
  await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(2);
  await expect(panel(page)).toHaveAttribute("data-arrived", "false");
  expect(leaks).toEqual([]);
  await noXrSession(page);
});

test("APP-006 : toutes les préférences PC changent en marche et reviennent au départ suivant", async ({ page }) => {
  test.setTimeout(45_000);
  const leaks: string[] = [];
  await page.route(/^https?:\/\/(?!localhost)/, async (route) => { leaks.push(route.request().url()); await route.abort(); });
  await startPc(page);
  const canvas = await page.locator(".pc-canvas").elementHandle();
  const before = await read(page, "data-distance-m");
  await page.getByText("Préférences de marche", { exact: true }).click();
  const prefs = page.locator(".walk-preferences");
  for (const name of [/^Ville vivante/, /^Lampadaires/, /^Arbres/, /^Brouillard/, /^Sons d'ambiance/, /^Côté du panneau/, /^Opacité du panneau/]) {
    await prefs.getByRole("button", { name }).click();
  }
  await prefs.getByRole("button", { name: "Qualité : Équilibré", exact: true }).click();
  await expect(prefs.getByRole("button", { name: "Qualité : Qualité", exact: true })).toBeVisible();
  await prefs.getByRole("button", { name: "Qualité : Qualité", exact: true }).click();
  await expect(page.locator("#app")).toHaveAttribute("data-profile", "performance");
  await expect(page.locator("#app")).toHaveAttribute("data-ambiance", "brouillard éteint · sons 5 %");
  await expect(page.locator("#app")).toHaveAttribute("data-panel-side", "left");
  expect(await canvas.evaluate((el) => el === document.querySelector(".pc-canvas"))).toBe(true);
  await expect.poll(() => read(page, "data-distance-m"), { timeout: 20_000 }).toBeGreaterThan(before + 1);
  await page.keyboard.press("ArrowUp");
  await expect(panel(page)).toHaveAttribute("data-speed-kmh", "4.1");
  await page.keyboard.press("Escape");
  await expect(prefs).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Version PC" }).click();
  await page.getByText("Préférences de marche", { exact: true }).click();
  for (const name of ["Qualité : Performance", "Ville vivante (piétons et circulation) : Oui", "Lampadaires : Non", "Arbres : Non",
    "Brouillard : Oui", "Sons d'ambiance (%) : 25", "Côté du panneau : À gauche", "Opacité du panneau (%) : 80"]) {
    await expect(prefs.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await noXrSession(page);
  expect(leaks).toEqual([]);
});
