import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CITIES } from "../../scripts/cities.ts";
import { catalogText, parseCityArgs } from "../../scripts/city-args.ts";

const NEW = ["--nom", "Essai", "--emprise", "49.99,9.99,50.01,10.01", "--depart", "50,10", "--arrivee", "50,10.002"];
const refused = (...argv: string[]) => () => parseCityArgs(argv, CITIES);

describe("lecture des options de la commande de création de ville", () => {
  it("APP-003: rejoue une ville déjà décrite par son seul identifiant, sans changer le catalogue", () => {
    const request = parseCityArgs(["fc-road", "--photos", "/dossier/hors-depot"], CITIES);
    expect(request).toMatchObject({ key: "fc-road", city: CITIES["fc-road"], photosDir: "/dossier/hors-depot", described: false });
  });

  it("APP-003: décrit une nouvelle ville par un nom, une emprise et un départ/arrivée, sans code propre à la ville", () => {
    const request = parseCityArgs(["rome", ...NEW, "--via", "50.001,10.001", "--retour", "boucle"], CITIES);
    expect(request.described).toBe(true);
    expect(request.city).toEqual({
      itinerary: "rome",
      label: "Essai",
      place: "Itinéraire à pied : Essai",
      name: "Essai",
      bbox: { south: 49.99, west: 9.99, north: 50.01, east: 10.01 },
      userAgent: "drwil_walk/0.1 (extraction OpenStreetMap de Essai)",
      file: "data/rome.json",
      route: { points: [[50, 10], [50.001, 10.001], [50, 10.002]], return: "boucle" },
    });
    const titled = parseCityArgs(["rome", ...NEW, "--libelle", "Rome antique", "--lieu", "Le Forum"], CITIES).city;
    expect(titled).toMatchObject({ label: "Rome antique", place: "Le Forum", name: "Essai" });
    expect(parseCityArgs(["rome", ...NEW], CITIES).city.route).toEqual({ points: [[50, 10], [50, 10.002]], return: "aller-retour" });
  });

  it("change une option d'une ville décrite et garde le reste (fichier, identification, étapes)", () => {
    const { city } = parseCityArgs(["souq", "--retour", "aller-retour"], CITIES);
    expect(city).toEqual({ ...CITIES.souq, route: { ...CITIES.souq.route, return: "aller-retour" } });
    const moved = parseCityArgs(["souq", "--nom", "Souk", "--emprise", "1,2,3,4", "--depart", "1.5,2.5", "--arrivee", "1.6,2.6", "--via", "1.55,2.55"], CITIES).city;
    expect(moved).toMatchObject({ itinerary: "doha-souq-waqif", file: "data/souq-waqif.json", name: "Souk", route: { points: [[1.5, 2.5], [1.55, 2.55], [1.6, 2.6]] } });
    expect(parseCityArgs(["souq", "--depart", "25.2869,51.5312"], CITIES).city.route.points).toEqual(CITIES.souq.route.points);
  });

  it("refuse, en le disant, un identifiant, une option ou une valeur invalide", () => {
    expect(refused()).toThrow("un identifiant de ville est demandé");
    expect(refused("../x")).toThrow("un identifiant de ville est demandé");
    expect(refused("inconnue")).toThrow("« inconnue » n'est pas décrite dans data/villes.json");
    expect(refused("rome", "nom")).toThrow("option « nom » inconnue ou sans valeur");
    expect(refused("rome", "--nom")).toThrow("option « --nom » inconnue ou sans valeur");
    expect(refused("rome", "--ville", "x")).toThrow("option « --ville » inconnue");
    expect(refused("rome", ...NEW.slice(2))).toThrow("--nom est demandé");
    expect(refused("rome", "--nom", "E", "--depart", "50,10", "--arrivee", "50,10.1")).toThrow("--emprise est demandée");
    expect(refused("rome", "--nom", "E", "--emprise", "50,10,49,11", "--depart", "50,10", "--arrivee", "50,10.1")).toThrow("du sud vers le nord");
    expect(refused("rome", "--nom", "E", "--emprise", "49,11,50,10", "--depart", "50,10", "--arrivee", "50,10.1")).toThrow("de l'ouest vers l'est");
    expect(refused("rome", "--nom", "E", "--emprise", "1,2,3", "--depart", "50,10", "--arrivee", "50,10.1")).toThrow("l'emprise attendu en 4 nombres");
    expect(refused("rome", "--nom", "E", "--emprise", "1,2,3,4", "--arrivee", "50,10.1")).toThrow("--depart est demandé");
    expect(refused("rome", "--nom", "E", "--emprise", "1,2,3,4", "--depart", "50,10")).toThrow("--arrivee est demandée");
    expect(refused("rome", "--nom", "E", "--emprise", "1,2,3,4", "--depart", "50,x", "--arrivee", "1,1")).toThrow("le départ attendu en 2 nombres");
    expect(refused("rome", "--nom", "E", "--emprise", "1,2,3,4", "--depart", "95,10", "--arrivee", "1,1")).toThrow("le départ hors du globe");
    expect(refused("rome", ...NEW, "--retour", "circuit")).toThrow("--retour vaut « aller-retour » ou « boucle »");
  });

  it("écrit le catalogue lisiblement : une ville par bloc, l'emprise et le tracé sur une ligne, relu à l'identique", () => {
    const text = catalogText(CITIES);
    expect(JSON.parse(text)).toEqual(CITIES);
    expect(text).toContain('    "bbox": {"south":25.284,"west":51.529,"north":25.29,"east":51.538},');
    expect(text).toBe(readFileSync(new URL("../../data/villes.json", import.meta.url), "utf8"));
  });
});
