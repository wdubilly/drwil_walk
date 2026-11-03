import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cityFor } from "./cities.ts";
import { BENCH_BACK_M } from "./furniture.ts";
import { pushMarkings } from "./markings.ts";
import { buildFurniture } from "./props.ts";
import { newRibbons } from "./roads.ts";

const ITINERARIES = [
  { id: "doha-souq-waqif", file: "souq-waqif.json" },
  { id: "pune-vieille-ville", file: "pune-vieille-ville.json" },
  { id: "doha-corniche", file: "doha-corniche.json" },
  { id: "pune-fc-road", file: "pune-fc-road.json" },
];

const read = (file: string): { features: { properties: { kind: string; footway?: string; sidewalk?: string } }[] } =>
  JSON.parse(readFileSync(new URL(`../../data/${file}`, import.meta.url), "utf8")) as ReturnType<typeof read>;

describe("mobilier et marquages des quatre itinéraires", () => {
  for (const { id, file } of ITINERARIES) {
    it(`APP-009: ${id}, le mobilier dessiné est celui des balises de l'extrait, rien n'est inventé`, () => {
      const kinds = new Set(read(file).features.map((f) => f.properties.kind));
      const city = cityFor(id);
      expect(city.props.every((p) => kinds.has(p.kind))).toBe(true);
      const geometry = buildFurniture(city.props, city.route).geometry;
      // Aucun extrait ne porte de lampadaire (relevé du 2026-11-03) : rien ne dépasse donc la hauteur d'un banc.
      expect(city.props.some((p) => p.kind === "lamp")).toBe(false);
      if (!geometry.hasAttribute("position")) return;
      geometry.computeBoundingBox();
      expect(geometry.boundingBox?.max.y).toBeLessThanOrEqual(BENCH_BACK_M + 0.01);
    });

    it(`APP-009: ${id}, les marquages suivent les balises de voie, et rien sans balise`, () => {
      const city = cityFor(id);
      const tagged = city.roads.filter((r) => r.footway !== undefined || r.sidewalk !== undefined);
      expect(tagged.length).toBeGreaterThan(0);
      const marks = newRibbons();
      pushMarkings(marks, city.roads, city.route);
      expect(marks.positions.length).toBeGreaterThan(0);
      const bare = newRibbons();
      pushMarkings(bare, city.roads.map((r) => ({ highway: r.highway, points: r.points })), city.route);
      expect(bare.positions).toEqual([]);
    });
  }
});
