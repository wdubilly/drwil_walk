// e2e de la version PC (QUA-020, APP-002), dans Chromium SANS émulation WebXR : l'accueil, le bouton « Version PC », la marche dans
// un canvas de la page, pilotée au clavier et à la souris, sur un itinéraire figé puis sur un trajet libre servi par des services factices.
import { expect, test, type Page, type Route } from "@playwright/test";

const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const cors = { "access-control-allow-origin": "*" };
/** Tracé de Valhalla entre (18.5204 ; 73.8567) et (18.5209 ; 73.8567), encodé en polyligne à 6 décimales. */
const SHAPE = "_tkib@wjzzkCg^?";

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

test("chemin 13 : un trajet libre se marche en version PC et s'arrête à l'arrivée en le disant", async ({ page }) => {
  test.setTimeout(120_000);
  const leaks: string[] = [];
  const way = (id: number, tags: Record<string, string>, lat: number) => ({
    type: "way", id, tags,
    geometry: [{ lat, lon: 73.8568 }, { lat: lat + 0.0001, lon: 73.8568 }, { lat: lat + 0.0001, lon: 73.857 }, { lat, lon: 73.8568 }],
  });
  await page.route(/^https?:\/\/(?!localhost)/, async (route: Route) => {
    const url = new URL(route.request().url());
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    if (url.host === "tile.openstreetmap.org") return route.fulfill({ body: PNG, contentType: "image/png" });
    if (url.host === "valhalla1.openstreetmap.de") {
      return route.fulfill({ headers: cors, json: { trip: { summary: { length: 0.06 }, legs: [{ shape: SHAPE }] } } });
    }
    if (url.host === "photon.komoot.io") {
      const arrival = (url.searchParams.get("q") ?? "").startsWith("Arrivée");
      const coordinates = [73.8567, arrival ? 18.5209 : 18.5204];
      return route.fulfill({ headers: cors, json: { features: [{ geometry: { coordinates }, properties: { name: arrival ? "Arrivée factice" : "Départ factice", city: "Pune" } }] } });
    }
    if (url.host === "overpass-api.de") {
      return route.fulfill({ headers: cors, json: { elements: [way(1, { building: "yes", height: "15" }, 18.5206), way(2, { highway: "residential" }, 18.5204)] } });
    }
    leaks.push(url.host);
    return route.abort();
  });
  await page.goto("/");
  await page.locator("label.card", { hasText: "Itinéraire libre" }).click();
  await page.getByRole("textbox", { name: "Départ" }).fill("Départ factice");
  await page.getByRole("button", { name: "Chercher départ" }).click();
  await expect(page.getByRole("textbox", { name: "Départ" })).toHaveValue("Départ factice, Pune");
  await page.getByRole("textbox", { name: "Arrivée" }).fill("Arrivée factice");
  await page.getByRole("button", { name: "Chercher arrivée" }).click();
  await expect(page.getByRole("textbox", { name: "Arrivée" })).toHaveValue("Arrivée factice, Pune");
  await page.getByRole("button", { name: "Calculer le trajet" }).click();
  await expect(page.locator(".free-message")).toContainText("Trajet prêt");
  await page.getByLabel("Vitesse de départ (km/h)").fill("8");
  await page.getByRole("button", { name: "Version PC" }).click();
  await expect(page.getByRole("status")).toHaveText("Version PC active : marche dans la page, sans casque.");
  await expect(panel(page)).toHaveAttribute("data-building-count", "1");
  await expect(panel(page).locator(".arrival")).toBeHidden();
  await expect(panel(page)).toHaveAttribute("data-arrived", "true", { timeout: 90_000 });
  await expect(panel(page).locator(".arrival")).toContainText("Arrivée");
  const end = await panel(page).getAttribute("data-distance-m");
  expect(Number(end)).toBeGreaterThan(40);
  await page.waitForTimeout(300);
  await expect(panel(page)).toHaveAttribute("data-distance-m", end ?? "");
  expect(leaks).toEqual([]);
  await noXrSession(page);
});
