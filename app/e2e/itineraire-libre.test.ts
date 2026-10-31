// e2e de l'itinéraire libre (QUA-020, chemin 10), dans Chromium avec un Meta Quest 3 émulé (IWER). Google et Overpass ne sont JAMAIS
// appelés : routage, géocodage, bâtiments et tuiles de la carte sont servis ici ; toute autre requête hors de la machine est refusée
// et fait échouer le test. Les clés du serveur de test sont fictives.
import { createRequire } from "node:module";
import { expect, test, type Page, type Route } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");
const ROUTES_KEY = "cle-routes-factice-e2e";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type,x-goog-api-key,x-goog-fieldmask" };
/** Deux lieux factices à environ 60 m l'un de l'autre. */
const PLACES: Record<string, { lat: number; lng: number }> = {
  "Départ factice": { lat: 18.5204, lng: 73.8567 },
  "Arrivée factice": { lat: 18.5209, lng: 73.8567 },
};

interface Seen {
  leaks: string[];
  tileHosts: number;
  routeKeys: string[];
  routeBodies: { origin: { location: { latLng: { latitude: number } } }; destination: { location: { latLng: { latitude: number } } }; travelMode: string }[];
}

const way = (id: number, tags: Record<string, string>, lat: number) => ({
  type: "way", id, tags,
  geometry: [{ lat, lon: 73.8568 }, { lat: lat + 0.0001, lon: 73.8568 }, { lat: lat + 0.0001, lon: 73.8570 }, { lat, lon: 73.8568 }],
});

/** Les services factices ; `routesStatus` : le code que renvoie le routage, `geocode` : la réponse du géocodage. */
async function fakeServices(page: Page, options: { routesStatus?: number; zeroResults?: boolean } = {}): Promise<Seen> {
  const seen: Seen = { leaks: [], tileHosts: 0, routeKeys: [], routeBodies: [] };
  await page.route(/^https?:\/\/(?!localhost)/, async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    if (url.host === "tile.openstreetmap.org") {
      seen.tileHosts++;
      return route.fulfill({ body: PNG, contentType: "image/png" });
    }
    if (url.host === "routes.googleapis.com") {
      seen.routeKeys.push(request.headers()["x-goog-api-key"] ?? "");
      if (options.routesStatus) return route.fulfill({ status: options.routesStatus, headers: cors, json: { error: "refusé" } });
      const body = request.postDataJSON() as Seen["routeBodies"][number];
      seen.routeBodies.push(body);
      const [a, b] = [body.origin.location.latLng, body.destination.location.latLng] as unknown as { latitude: number; longitude: number }[];
      const coordinates = [[a?.longitude, a?.latitude], [b?.longitude, b?.latitude]];
      return route.fulfill({ headers: cors, json: { routes: [{ distanceMeters: 60, polyline: { geoJsonLinestring: { coordinates } } }] } });
    }
    if (url.host === "maps.googleapis.com") {
      expect(url.searchParams.get("key")).toBe(ROUTES_KEY);
      if (options.zeroResults) return route.fulfill({ headers: cors, json: { status: "ZERO_RESULTS", results: [] } });
      const place = PLACES[url.searchParams.get("address") ?? ""];
      const location = place ?? { lat: 18.5204, lng: 73.8567 };
      const label = place ? `${url.searchParams.get("address") ?? ""}, Pune` : "Rue factice, Pune";
      return route.fulfill({ headers: cors, json: { status: "OK", results: [{ formatted_address: label, geometry: { location } }] } });
    }
    if (url.host === "overpass-api.de") {
      return route.fulfill({ headers: cors, json: { elements: [way(1, { building: "yes", height: "15" }, 18.5206), way(2, { highway: "residential" }, 18.5204)] } });
    }
    seen.leaks.push(url.host);
    return route.abort();
  });
  return seen;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as { IWER: { XRDevice: new (c: unknown) => { installRuntime(o: object): void }; metaQuest3: unknown } };
    new w.IWER.XRDevice(w.IWER.metaQuest3).installRuntime({ forceInstall: true });
  });
  test.setTimeout(120_000);
});

const panel = (page: Page) => page.getByRole("region", { name: "Marche" });
const message = (page: Page) => page.locator(".free-message");

async function openFree(page: Page) {
  await page.goto("/");
  await page.locator("label.card", { hasText: "Itinéraire libre" }).click();
}

async function searchBoth(page: Page) {
  await page.getByRole("textbox", { name: "Départ" }).fill("Départ factice");
  await page.getByRole("button", { name: "Chercher départ" }).click();
  await expect(page.getByRole("textbox", { name: "Départ" })).toHaveValue("Départ factice, Pune");
  await page.getByRole("textbox", { name: "Arrivée" }).fill("Arrivée factice");
  await page.getByRole("button", { name: "Chercher arrivée" }).click();
  await expect(page.getByRole("textbox", { name: "Arrivée" })).toHaveValue("Arrivée factice, Pune");
}

async function enter(page: Page) {
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
}

test("chemin 10 : une adresse de départ et d'arrivée, le chemin calculé, la marche jusqu'à l'arrivée où elle s'arrête", async ({ page }) => {
  const seen = await fakeServices(page);
  await page.goto("/");
  // Rien n'est demandé à OpenStreetMap tant que la carte libre n'est pas ouverte.
  expect(seen.tileHosts).toBe(0);
  await page.locator("label.card", { hasText: "Itinéraire libre" }).click();
  await expect(page.locator(".map-view img").first()).toBeVisible();
  await searchBoth(page);
  await expect(message(page)).toContainText("Départ et arrivée posés");
  await page.getByRole("button", { name: "Calculer le trajet" }).click();
  await expect(message(page)).toContainText("Trajet prêt : 0,1 km");
  // Le routage reçoit la clé Routes, le mode piéton, et les points trouvés par l'adresse.
  expect(seen.routeKeys).toEqual([ROUTES_KEY]);
  expect(seen.routeBodies[0]?.travelMode).toBe("WALK");
  expect(seen.routeBodies[0]?.origin.location.latLng.latitude).toBe(18.5204);
  expect(seen.routeBodies[0]?.destination.location.latLng.latitude).toBe(18.5209);

  await page.getByLabel("Vitesse de départ (km/h)").fill("8");
  await enter(page);
  await expect(panel(page)).toHaveAttribute("data-building-count", "1");
  await expect(panel(page).locator(".arrival")).toBeHidden();
  // APP-002 : la marche s'arrête à l'arrivée au lieu de reprendre au départ.
  await expect(panel(page)).toHaveAttribute("data-arrived", "true", { timeout: 90_000 });
  await expect(panel(page).locator(".arrival")).toContainText("Arrivée");
  const end = await panel(page).getAttribute("data-distance-m");
  expect(Number(end)).toBeGreaterThan(40);
  await expect(panel(page)).toHaveAttribute("data-distance-m", end ?? "");
  await expect(panel(page).locator(".attribution")).toHaveText("© contributeurs OpenStreetMap");
  expect(seen.leaks).toEqual([]);
});

test("chemin 10 : deux touches sur la carte posent le départ et l'arrivée, les champs se remplissent", async ({ page }) => {
  const seen = await fakeServices(page);
  await openFree(page);
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Zoom avant" }).click();
  const map = page.locator(".map-view");
  await map.click({ position: { x: 320, y: 200 } });
  await map.click({ position: { x: 320, y: 140 } });
  await expect(page.getByRole("textbox", { name: "Départ" })).toHaveValue("Rue factice, Pune");
  await expect(page.getByRole("textbox", { name: "Arrivée" })).toHaveValue("Rue factice, Pune");
  await expect(page.locator(".marker")).toHaveCount(2);
  await page.getByRole("button", { name: "Calculer le trajet" }).click();
  await expect(message(page)).toContainText("Trajet prêt");
  const { origin, destination } = seen.routeBodies[0] as Seen["routeBodies"][number];
  // Le centre de la carte est la Vieille ville de Pune ; l'arrivée est au nord du départ.
  expect(origin.location.latLng.latitude).toBeCloseTo(18.5204, 3);
  expect(destination.location.latLng.latitude).toBeGreaterThan(origin.location.latLng.latitude);
  await enter(page);
  expect(seen.leaks).toEqual([]);
});

test("chemin 10 : adresse introuvable, trajet non préparé : la raison est dite et les itinéraires figés restent utilisables", async ({ page }) => {
  await fakeServices(page, { zeroResults: true });
  await openFree(page);
  await page.getByRole("textbox", { name: "Départ" }).fill("nulle part");
  await page.getByRole("button", { name: "Chercher départ" }).click();
  await expect(message(page)).toContainText("Adresse introuvable : « nulle part »");
  await page.getByRole("button", { name: "Calculer le trajet" }).click();
  await expect(message(page)).toHaveText("Posez d'abord un départ et une arrivée.");
  // Entrer sans trajet prêt : la raison est dite, aucune session n'est ouverte.
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toContainText("posez un départ et une arrivée");
  await page.locator("label.card", { hasText: "Pune FC Road" }).click();
  await enter(page);
});

test("chemin 10 : le service de routage refuse la clé, la raison est dite sans la clé", async ({ page }) => {
  await fakeServices(page, { routesStatus: 403 });
  await openFree(page);
  await searchBoth(page);
  await page.getByRole("button", { name: "Calculer le trajet" }).click();
  await expect(message(page)).toContainText("Calcul du trajet impossible : le service a répondu 403");
  await expect(message(page)).not.toContainText(ROUTES_KEY);
  await page.locator("label.card", { hasText: "Doha Souq Waqif" }).click();
  await enter(page);
});
