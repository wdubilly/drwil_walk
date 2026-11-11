import { describe, expect, it } from "vitest";
import { bundledData as bundled } from "./traffic-assets.ts";
import { DEFAULT_REGION, readCatalogue, regionSetting } from "./traffic-catalog.ts";

type Data = Record<string, unknown>;
const at = (data: Data, path: string[]): Data => path.reduce<Data>((node, key) => node[key] as Data, data);
/** Une copie du catalogue embarqué où chaque chemin reçoit sa valeur, ou est retiré (valeur absente). */
const edited = (...edits: [string[], unknown?][]): Data => {
  const data = structuredClone(bundled) as Data;
  for (const [path, value] of edits) {
    const parent = at(data, path.slice(0, -1));
    const key = path.at(-1) as string;
    if (value === undefined) Reflect.deleteProperty(parent, key);
    else parent[key] = value;
  }
  return data;
};

describe("catalogue des figurants", () => {
  it("APP-014: le catalogue embarqué se lit : types, lieux et régions, golfe réglé, inde à gauche, ailleurs par défaut", () => {
    const catalogue = readCatalogue(bundled);
    expect(catalogue.itineraires).toEqual(["doha-souq-waqif"]);
    expect(Object.values(catalogue.types).map((t) => t.lieu)).toEqual(expect.arrayContaining(["chaussee", "trottoir", "voie-pietonne"]));
    expect(regionSetting(catalogue, "golfe").conduite).toBe("droite");
    expect(regionSetting(catalogue, "inde").conduite).toBe("gauche");
    expect(regionSetting(catalogue, "provence")).toBe(catalogue.regions[DEFAULT_REGION]);
  });

  it("APP-014: un type s'ajoute en données seulement : un modèle, une ligne de catalogue et un poids de région", () => {
    const data = edited(
      [["types", "rickshaw"], { modeles: ["rickshaw"], lieu: "chaussee", vitesseKmh: 25, gabarit: { longueurM: 2.6, largeurM: 1.3, hauteurM: 1.7 } }],
      [["regions", "inde", "poids", "rickshaw"], 5],
    );
    const catalogue = readCatalogue(data);
    expect(catalogue.types["rickshaw"]?.lieu).toBe("chaussee");
    expect(regionSetting(catalogue, "inde").poids["rickshaw"]).toBe(5);
  });

  it("APP-014: un catalogue mal décrit est refusé avec sa raison, jamais un figurant mal décrit", () => {
    const refused = (reason: string, ...edits: [string[], unknown?][]): void => {
      expect(() => readCatalogue(edited(...edits))).toThrow(reason);
    };
    expect(() => readCatalogue(null)).toThrow("itinéraires illisibles");
    refused("classes de voie illisibles", [["lieux"]]);
    refused("type taxi : aucun modèle", [["types", "taxi", "modeles"], []]);
    refused("type taxi : aucun modèle", [["types", "taxi"], 3]);
    refused("lieu inconnu", [["types", "taxi", "lieu"], "ciel"]);
    refused("vitesse illisible", [["types", "taxi", "vitesseKmh"], -1]);
    refused("gabarit illisible", [["types", "taxi", "gabarit"]]);
    refused("gabarit illisible", [["types", "taxi", "gabarit", "hauteurM"], 0]);
    refused("côté de conduite", [["regions", "golfe", "conduite"], "milieu"]);
    refused("côté de conduite", [["regions", "golfe"], null]);
    refused("densité illisible", [["regions", "golfe", "densites", "ciel"], 1]);
    refused("densité illisible", [["regions", "golfe", "densites", "chaussee"], -1]);
    refused("type inconnu", [["regions", "golfe", "poids", "fantome"], 1]);
    refused("type inconnu", [["regions", "golfe", "poids", "taxi"], "un"]);
    refused("« ailleurs » absente", [["regions", "ailleurs"]]);
    refused("« ailleurs » absente", [["regions"]]);
    refused("type inconnu", [["types"]]);
    expect(() => readCatalogue(edited([["regions", "golfe", "densites"]], [["regions", "golfe", "poids"]]))).not.toThrow();
  });
});
