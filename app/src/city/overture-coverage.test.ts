import { describe, expect, it, vi } from "vitest";
import {
  BUCKET,
  COUNTED,
  LICENCES,
  PREAMBLE,
  RELEASE,
  ZONES,
  addressesQuery,
  buildingsQuery,
  byZone,
  inBbox,
  licences,
  osmCounts,
  parquet,
  survey,
  table,
  type Zone,
} from "../../scripts/overture-coverage.ts";

const zone: Zone = { id: "essai", name: "Essai", bbox: { south: 1, west: 2, north: 3, east: 4 }, extract: "essai.json" };

const extract = JSON.stringify({
  features: [
    { properties: { kind: "building", heightM: 12, levels: 4, building: "house", roofShape: "gabled", colour: "#c8785a" } },
    { properties: { kind: "building", heightM: 7, building: "yes", material: "brick" } },
    { properties: { kind: "building", heightM: 7 } },
    { properties: { kind: "highway", highway: "residential" } },
  ],
});

describe("APP-003: essai de couverture d'Overture Maps", () => {
  it("APP-003: écrit la licence de chaque couche lue avant tout import", () => {
    expect(LICENCES.map((l) => l.layer)).toEqual(["buildings / building", "addresses / address"]);
    expect(LICENCES[0].licence).toBe("ODbL");
    expect(LICENCES[0].sources).toContain("OpenStreetMap");
    const text = licences();
    expect(text).toContain("`buildings / building` : **ODbL**");
    expect(text).toContain("addresses / address");
  });

  it("APP-003: lit les fichiers publiés d'Overture, sans compte ni clé, à une version figée", () => {
    expect(BUCKET).toBe("s3://overturemaps-us-west-2/release");
    expect(RELEASE).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/);
    expect(parquet("buildings", "building")).toBe(`${BUCKET}/${RELEASE}/theme=buildings/type=building/*.parquet`);
  });

  it("couvre les quatre zones des extraits figés", () => {
    expect(ZONES.map((z) => z.id)).toEqual(["pune-vieille-ville", "pune-fc-road", "doha-corniche", "doha-souq-waqif"]);
    expect(ZONES.map((z) => z.extract)).toEqual(["pune-vieille-ville.json", "pune-fc-road.json", "doha-corniche.json", "souq-waqif.json"]);
    for (const z of ZONES) expect(z.bbox.south).toBeLessThan(z.bbox.north);
  });

  it("interroge chaque zone par son seul cadre, pour que les fichiers soient élagués", () => {
    expect(inBbox(zone.bbox)).toBe("bbox.xmin BETWEEN 2 AND 4 AND bbox.ymin BETWEEN 1 AND 3");
    const query = buildingsQuery([zone]);
    expect(query.startsWith(PREAMBLE)).toBe(true);
    expect(query).toContain("SELECT 'essai' AS zone, count(*) AS batiments");
    expect(query).toContain(COUNTED["nom"]);
    expect(query).toContain(parquet("buildings", "building"));
    // Un cadre par lecture : un « OU » entre zones dans le WHERE empêcherait l'élagage des fichiers.
    expect(query).not.toContain("WHERE bbox.xmin BETWEEN 2 AND 4 AND bbox.ymin BETWEEN 1 AND 3 OR");
    expect(buildingsQuery([zone, zone]).split("UNION ALL")).toHaveLength(2);
    expect(buildingsQuery()).toContain("doha-souq-waqif");
  });

  it("compte les adresses de la couche addresses sur les mêmes cadres", () => {
    expect(addressesQuery([zone])).toContain("count(*) AS adresses");
    expect(addressesQuery([zone])).toContain(parquet("addresses", "address"));
    expect(addressesQuery()).toContain("pune-fc-road");
  });

  it("compte ce que l'extrait figé porte déjà, bâtiments seuls", () => {
    expect(osmCounts(extract)).toEqual({ batiments: 3, hauteur: 1, etages: 1, type: 1, nom: 0, toit: 1, facade: 2 });
  });

  it("range les lignes de DuckDB par zone", () => {
    expect(byZone('[{"zone":"essai","batiments":5}]')).toEqual({ essai: { batiments: 5 } });
  });

  it("montre le gain de chaque attribut, et zéro pour une zone absente d'Overture", () => {
    const text = table([zone], { essai: { batiments: 10, hauteur: 9 } }, { essai: { batiments: 4 } }, { essai: { adresses: 7 } });
    expect(text).toContain("| Zone | Bâtiments | Hauteur ou étages |");
    expect(text).toContain("| Essai | 10 → 4 (-6) | 9 → 0 (-9) | 0 → 0 (+0)");
    expect(text).toContain("| 0 → 7 |");
    expect(table([zone], {}, {}, {})).toContain("| Essai | 0 → 0 (+0) |");
  });

  it("APP-003: rend un relevé chiffré sans rien écrire dans app/data/ ni appeler le réseau lui-même", async () => {
    const run = vi.fn((sql: string) =>
      Promise.resolve(sql.includes("adresses") ? '[{"zone":"essai","adresses":2}]' : '[{"zone":"essai","batiments":40,"hauteur":30}]'));
    const read = vi.fn(() => extract);
    const text = await survey(run, read, [zone]);
    expect(read).toHaveBeenCalledWith("essai.json");
    expect(run).toHaveBeenCalledTimes(2);
    expect(text).toContain(`Version publiée lue : \`${RELEASE}\``);
    expect(text).toContain("aucune donnée");
    expect(text).toContain("`buildings / building` : **ODbL**");
    expect(text).toContain("| Essai | 3 → 40 (+37) | 1 → 30 (+29)");
    expect(text).toContain("| 0 → 2 |");
  });

  it("APP-003: le relevé par défaut porte sur les quatre zones", async () => {
    const run = vi.fn(() => Promise.resolve("[]"));
    const text = await survey(run, () => extract);
    expect(text).toContain("| Doha Souq Waqif |");
    expect(text).toContain("| Pune Vieille ville |");
  });
});
