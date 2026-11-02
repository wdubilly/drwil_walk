// e2e d'un trajet libre de plus de 5 km, marché à plus de 8 km/h (APP-002, QUA-002, QUA-020), dans Chromium avec un Meta Quest 3
// émulé (IWER), SANS AUCUNE CLÉ : routage, adresses et Overpass sont servis par la page de test ; toute autre requête sortante échoue.
import { createRequire } from "node:module";
import { expect, test, type Page, type Route } from "@playwright/test";

const iwerBuild = createRequire(import.meta.url).resolve("iwer/build/iwer.min.js");
const cors = { "access-control-allow-origin": "*" };
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
/** Départ et arrivée à environ 11 km l'un de l'autre, sur un même méridien. */
const PLACES: Record<string, number> = { "Départ lointain": 18.5204, "Arrivée lointaine": 18.62 };

/** Un tracé, encodé en polyligne à 6 décimales comme le fait Valhalla. */
function encode(points: { lat: number; lon: number }[]): string {
  let [lat, lon, out] = [0, 0, ""];
  const put = (value: number): void => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    while (v >= 0x20) {
      out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    out += String.fromCharCode(v + 63);
  };
  for (const p of points) {
    const [nlat, nlon] = [Math.round(p.lat * 1e6), Math.round(p.lon * 1e6)];
    put(nlat - lat);
    put(nlon - lon);
    [lat, lon] = [nlat, nlon];
  }
  return out;
}

async function fakeServices(page: Page, overpassStatus: number): Promise<string[]> {
  const leaks: string[] = [];
  await page.route(/^https?:\/\/(?!localhost)/, async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    if (url.host === "tile.openstreetmap.org") return route.fulfill({ body: PNG, contentType: "image/png" });
    if (url.host === "valhalla1.openstreetmap.de") {
      const body = JSON.parse(url.searchParams.get("json") ?? "{}") as { locations: { lat: number; lon: number }[] };
      return route.fulfill({ headers: cors, json: { trip: { summary: { length: 11.1 }, legs: [{ shape: encode(body.locations) }] } } });
    }
    if (url.host === "photon.komoot.io") {
      const lat = PLACES[url.searchParams.get("q") ?? ""] ?? 18.5204;
      return route.fulfill({ headers: cors, json: { features: [{ geometry: { coordinates: [73.8567, lat] }, properties: { name: "Lieu factice", city: "Pune" } }] } });
    }
    if (url.host === "overpass-api.de") return route.fulfill({ status: overpassStatus, headers: cors, json: { error: "refusé" } });
    leaks.push(url.host);
    return route.abort();
  });
  return leaks;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: iwerBuild });
  await page.addInitScript(() => {
    const w = window as unknown as { IWER: { XRDevice: new (c: unknown) => { installRuntime(o: object): void }; metaQuest3: unknown } };
    new w.IWER.XRDevice(w.IWER.metaQuest3).installRuntime({ forceInstall: true });
  });
  test.setTimeout(120_000);
});

test("chemin 12 : un trajet de 11 km est accepté, la ville ne se charge pas, la raison est dite, la marche se fait à 30 km/h", async ({ page }) => {
  const leaks = await fakeServices(page, 429);
  await page.goto("/");
  await page.locator("label.card", { hasText: "Itinéraire libre" }).click();
  for (const [name, label] of [["Départ", "Départ lointain"], ["Arrivée", "Arrivée lointaine"]] as const) {
    await page.getByRole("textbox", { name }).fill(label);
    await page.getByRole("button", { name: `Chercher ${name.toLowerCase()}` }).click();
    await expect(page.getByRole("textbox", { name })).toHaveValue("Lieu factice, Pune");
  }
  await page.getByRole("button", { name: "Calculer le trajet" }).click();
  const message = page.locator(".free-message");
  await expect(message).toContainText("Trajet prêt : 11,");
  await expect(message).toContainText("Bâtiments OpenStreetMap indisponibles");
  await expect(message).toContainText("marche sans bâtiments");
  await expect(message).not.toContainText("trop long");
  await page.getByLabel("Vitesse de départ (km/h)").fill("30");
  await page.getByRole("button", { name: "Entrer en réalité mixte" }).click();
  await expect(page.getByRole("status")).toHaveText("Réalité mixte active (immersive-ar)");
  const panel = page.getByRole("region", { name: "Marche" });
  await expect(panel.locator("[data-field='speed']")).toHaveText("30,0 km/h");
  await expect(panel).toHaveAttribute("data-building-count", "0");
  await expect.poll(async () => Number(await panel.getAttribute("data-distance-m")), { timeout: 20_000 }).toBeGreaterThan(8);
  expect(leaks).toEqual([]);
});
